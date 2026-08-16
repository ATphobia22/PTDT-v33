from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone
from pathlib import Path

import grpc
from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.x509.oid import NameOID

LOGGER = logging.getLogger(__name__)


def _name(common_name: str) -> x509.Name:
    return x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "US"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "PTDT Engineering"),
        x509.NameAttribute(NameOID.COMMON_NAME, common_name),
    ])


def _write_key(path: Path, key: rsa.RSAPrivateKey) -> None:
    path.write_bytes(key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()))
    path.chmod(0o600)


def provision_mtls_material(output_dir: str = "build/certs") -> dict[str, str]:
    """Create a local development CA and mTLS leaf certificates.

    Production should inject trust material from an external PKI/secrets system.
    """
    root = Path(output_dir)
    root.mkdir(parents=True, exist_ok=True)
    now = datetime.now(timezone.utc)
    ca_key = rsa.generate_private_key(public_exponent=65537, key_size=3072)
    ca_subject = _name("ptdt-v35-root-ca")
    ca_cert = (
        x509.CertificateBuilder().subject_name(ca_subject).issuer_name(ca_subject)
        .public_key(ca_key.public_key()).serial_number(x509.random_serial_number())
        .not_valid_before(now - timedelta(minutes=5)).not_valid_after(now + timedelta(days=3650))
        .add_extension(x509.BasicConstraints(ca=True, path_length=1), critical=True)
        .sign(ca_key, hashes.SHA256())
    )
    ca_key_path, ca_cert_path = root / "root_ca.key", root / "root_ca.crt"
    _write_key(ca_key_path, ca_key)
    ca_cert_path.write_bytes(ca_cert.public_bytes(serialization.Encoding.PEM))

    def issue(common_name: str, key_name: str, cert_name: str, dns_names: list[str]) -> None:
        key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        cert = (
            x509.CertificateBuilder().subject_name(_name(common_name)).issuer_name(ca_cert.subject)
            .public_key(key.public_key()).serial_number(x509.random_serial_number())
            .not_valid_before(now - timedelta(minutes=5)).not_valid_after(now + timedelta(days=397))
            .add_extension(x509.BasicConstraints(ca=False, path_length=None), critical=True)
            .add_extension(x509.SubjectAlternativeName([x509.DNSName(name) for name in dns_names]), critical=False)
            .sign(ca_key, hashes.SHA256())
        )
        _write_key(root / key_name, key)
        (root / cert_name).write_bytes(cert.public_bytes(serialization.Encoding.PEM))

    issue("ptdt-v35-server", "server.key", "server.crt", ["localhost", "ptdt-gateway"])
    issue("ptdt-v35-client", "client.key", "client.crt", ["ptdt-engineering-client"])
    LOGGER.info("mTLS development material provisioned in %s", root)
    return {name: str(root / name) for name in ("root_ca.crt", "server.key", "server.crt", "client.key", "client.crt")}


def server_credentials(cert_dir: str) -> grpc.ServerCredentials:
    root = Path(cert_dir)
    return grpc.ssl_server_credentials(
        [(root.joinpath("server.key").read_bytes(), root.joinpath("server.crt").read_bytes())],
        root_certificates=root.joinpath("root_ca.crt").read_bytes(),
        require_client_auth=True,
    )


def client_credentials(cert_dir: str) -> grpc.ChannelCredentials:
    root = Path(cert_dir)
    return grpc.ssl_channel_credentials(
        root_certificates=root.joinpath("root_ca.crt").read_bytes(),
        private_key=root.joinpath("client.key").read_bytes(),
        certificate_chain=root.joinpath("client.crt").read_bytes(),
    )


def peer_identity(context: grpc.aio.ServicerContext) -> str:
    identities = context.peer_identities() or ()
    if not identities:
        raise PermissionError("mTLS client certificate identity is missing")
    identity = identities[0]
    return identity.decode("utf-8") if isinstance(identity, bytes) else str(identity)
