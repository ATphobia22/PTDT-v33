from __future__ import annotations

import asyncio
import hashlib
import logging
import time
from collections.abc import AsyncIterator, Callable

import grpc

from backend.security.tls import peer_identity, server_credentials

LOGGER = logging.getLogger(__name__)

FrameSupplier = Callable[[int], tuple[float, bytes, tuple[float, float, float]]]
LedgerVerifier = Callable[[str, str], bool]


def build_servicer(pb2, pb2_grpc, ledger_verifier: LedgerVerifier, frame_supplier: FrameSupplier):
    """Build a generated-protobuf-compatible servicer without checked-in generated code."""
    class SpatialStreamerService(pb2_grpc.SpatialSynthesisStreamerServicer):
        async def StreamHydraulicVoxelMatrix(self, request, context) -> AsyncIterator[object]:
            try:
                identity = peer_identity(context)
            except PermissionError as exc:
                await context.abort(grpc.StatusCode.UNAUTHENTICATED, str(exc))
                return
            LOGGER.info("mTLS stream opened identity=%s node=%s", identity, request.project_node_id)
            timestep = 0
            try:
                while context.is_active():
                    wse, payload, ecef = frame_supplier(timestep)
                    evidence_hash = hashlib.sha256(payload).hexdigest()
                    yield pb2.VoxelMatrixFrame(
                        timestamp_epoch_ms=int(time.time() * 1000),
                        timestep_index=timestep,
                        calculated_wse_navd88_ft=wse,
                        geocentric_anchor_epsg4978=pb2.CoordinateECEF(x=ecef[0], y=ecef[1], z=ecef[2]),
                        evidence_hash=evidence_hash,
                        depth_voxels_float32=payload,
                    )
                    timestep += 1
                    await asyncio.sleep(1.0 / 30.0)
            finally:
                LOGGER.info("mTLS stream closed identity=%s node=%s", identity, request.project_node_id)

        async def VerifyLedgerNodeIntegrity(self, request, context):
            try:
                peer_identity(context)
            except PermissionError as exc:
                await context.abort(grpc.StatusCode.UNAUTHENTICATED, str(exc))
                return pb2.LedgerVerificationResponse(valid=False, verification_message=str(exc))
            valid = ledger_verifier(request.target_node_id, request.declared_evidence_hash)
            return pb2.LedgerVerificationResponse(
                valid=valid,
                verification_message="ledger hash verified" if valid else "ledger hash mismatch or unknown node",
            )

    return SpatialStreamerService()


async def serve(
    pb2,
    pb2_grpc,
    ledger_verifier: LedgerVerifier,
    frame_supplier: FrameSupplier,
    *,
    cert_dir: str = "build/certs",
    listen_address: str = "[::]:50051",
) -> None:
    server = grpc.aio.server()
    pb2_grpc.add_SpatialSynthesisStreamerServicer_to_server(
        build_servicer(pb2, pb2_grpc, ledger_verifier, frame_supplier), server
    )
    server.add_secure_port(listen_address, server_credentials(cert_dir))
    await server.start()
    LOGGER.info("PTDT mTLS gRPC server started address=%s", listen_address)
    try:
        await server.wait_for_termination()
    finally:
        await server.stop(grace=5)
