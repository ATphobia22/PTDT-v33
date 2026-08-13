"""USD / Hydra / WebGPU cinematic pipeline — presentation authority only."""
from __future__ import annotations

from dataclasses import dataclass, field
from hashlib import sha256
from typing import Any

from backend.core.v34_sovereign_constants import AUTHORITY_PRESENTATION, CRS, DATUM


@dataclass
class CinematicPipelineStatus:
    usd_stage: str = "OpenUSD stage (optional export)"
    hydra_delegate: str = "Storm / HdStorm or custom WebGPU delegate"
    webgpu_path: str = "TurboVec + floodWater.wgsl + MapLibre/deck hybrid"
    box3d_path: str = "integrations/box3d-unity (derived physics/VFX)"
    authority: str = AUTHORITY_PRESENTATION
    datum: str = DATUM
    crs: str = CRS
    plate_seal_algorithm: str = "SHA-256"
    components: dict[str, str] = field(
        default_factory=lambda: {
            "turbovec_compute": "frontend/src/shaders/turbovecCompute.wgsl",
            "turbovec_host": "frontend/src/viz/turbovecGpu.ts (pending main push)",
            "maplibre_hybrid": "frontend/src/viz/MapLibreDeckHybrid.tsx (pending)",
            "box3d_bridge": "integrations/box3d-unity",
            "cinematic_service": "backend/services/cinematic_pipeline.py",
        }
    )

    def as_dict(self) -> dict[str, Any]:
        return {
            "usd_stage": self.usd_stage,
            "hydra_delegate": self.hydra_delegate,
            "webgpu_path": self.webgpu_path,
            "box3d_path": self.box3d_path,
            "authority": self.authority,
            "datum": self.datum,
            "crs": self.crs,
            "plate_seal_algorithm": self.plate_seal_algorithm,
            "components": self.components,
            "invariant": "Visualization cannot create engineering or regulatory evidence.",
        }


def seal_composition_stack(payload: dict[str, Any]) -> str:
    import json

    body = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return sha256(body.encode("utf-8")).hexdigest()
