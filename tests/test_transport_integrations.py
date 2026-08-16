from __future__ import annotations

from pathlib import Path

from backend.security.tls import client_credentials, provision_mtls_material, server_credentials
from backend.reporting.fema_packager import FemaAppealPackager


def test_mtls_material_builds_and_loads(tmp_path: Path) -> None:
    provision_mtls_material(str(tmp_path))
    assert (tmp_path / "root_ca.crt").exists()
    assert (tmp_path / "server.key").exists()
    assert (tmp_path / "client.crt").exists()
    assert server_credentials(str(tmp_path))
    assert client_credentials(str(tmp_path))


def test_fema_packager_emits_failure_dossier(tmp_path: Path) -> None:
    manifest = {
        "manifest_metadata": {"cryptographic_manifest_seal": "a" * 64},
        "compliance_metrics": {
            "building_id": "test-node",
            "lowest_adjacent_grade_ft": 377.2,
            "first_floor_elevation_ft": 382.5,
            "current_water_surface_ft": 383.1,
            "freeboard_ft": -0.6,
            "lag_clearance_above_bfe_ft": 2.2,
            "threat_status": "CRITICAL_FIRST_FLOOR_SUBMERSION",
            "policy_compliance_pass": False,
        },
    }
    archive = FemaAppealPackager(str(tmp_path)).compile(manifest)
    assert archive is not None and archive.exists()
