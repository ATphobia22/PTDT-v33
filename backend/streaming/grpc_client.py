from __future__ import annotations

from collections.abc import AsyncIterator

import grpc

from backend.security.tls import client_credentials


async def stream_frames(pb2, pb2_grpc, *, target: str = "localhost:50051", cert_dir: str = "build/certs", project_node_id: str = "ptdt-node") -> AsyncIterator[object]:
    """Consume the PTDT stream using client certificate authentication."""
    credentials = client_credentials(cert_dir)
    async with grpc.aio.secure_channel(target, credentials) as channel:
        stub = pb2_grpc.SpatialSynthesisStreamerStub(channel)
        request = pb2.MatrixStreamRequest(
            project_node_id=project_node_id,
            target_zoom_level=15,
            requested_pki_signature_validation=True,
        )
        async for frame in stub.StreamHydraulicVoxelMatrix(request):
            yield frame
