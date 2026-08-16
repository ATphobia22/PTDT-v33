from __future__ import annotations

import asyncio
import hashlib
import logging
import time
from collections.abc import AsyncIterator, Callable
from pathlib import Path

import grpc

from backend.security.tls import peer_identity, server_credentials

LOGGER = logging.getLogger(__name__)


class SpatialStreamerService:
    """Transport adapter; generated protobuf classes are supplied at deployment time."""

    def __init__(self, pb2, ledger_verifier: Callable[[str, str], bool], frame_supplier: Callable[[int], tuple[float, bytes, tuple[float, float, float]]]) -> None:
        self.pb2 = pb2
        self.ledger_verifier = ledger_verifier
        self.frame_supplier = frame_supplier

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
                wse, payload, ecef = self.frame_supplier(timestep)
                evidence_hash = hashlib.sha256(payload).hexdigest()
                yield self.pb2.VoxelMatrixFrame(
                    timestamp_epoch_ms=int(time.time() * 1000),
                    timestep_index=timestep,
                    calculated_wse_navd88_ft=wse,
                    geocentric_anchor_epsg4978=self.pb2.CoordinateECEF(x=ecef[0], y=ecef[1], z=ecef[2]),
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
            return self.pb2.LedgerVerificationResponse(valid=False, verification_message=str(exc))
        valid = self.ledger_verifier(request.target_node_id, request.declared_evidence_hash)
        return self.pb2.LedgerVerificationResponse(
            valid=valid,
            verification_message="ledger hash verified" if valid else "ledger hash mismatch or unknown node",
        )


def load_credentials(cert_dir: str) -> grpc.ServerCredentials:
    return server_credentials(cert_dir)
