"""PTDT → Archimedes → USD Coupler"""
from __future__ import annotations

from typing import Any

from engine.cinematic_runtime.archimedes_webgpu_coupler import ArchimedesWebGPUCoupler
from engine.cinematic_runtime.usd_scene_state_generator import (
    PtdtSceneState,
    UsdPrimRef,
    UsdSceneStateGenerator,
)


class PtdtArchimedesUsdCoupler:
    def __init__(self) -> None:
        self.arch = ArchimedesWebGPUCoupler()
        self.usd = UsdSceneStateGenerator()

    def couple(self, archimedes_dict: dict[str, Any] | None = None) -> dict[str, Any]:
        uniforms = (
            self.arch.from_archimedes_dict(archimedes_dict)
            if archimedes_dict
            else self.arch.from_defaults()
        )
        pack = self.arch.pack_for_webgpu(uniforms)
        state = self.usd.build_default_bonebank()
        annotated: list[UsdPrimRef] = []
        for p in state.prims:
            meta = dict(p.metadata)
            if p.path.endswith("WseOverlay") or "Hydraulics" in p.path:
                meta.update(
                    {
                        "bfe_ft": uniforms.bfe_ft,
                        "lag_ft": uniforms.lag_ft,
                        "ffe_ft": uniforms.ffe_ft,
                        "manning_n": uniforms.manning_n,
                        "archimedes_seal": pack["seal"],
                    }
                )
            annotated.append(
                UsdPrimRef(
                    path=p.path,
                    type_name=p.type_name,
                    asset_path=p.asset_path,
                    translate=p.translate,
                    metadata=meta,
                )
            )
        state = PtdtSceneState(
            render_origin_xy=state.render_origin_xy,
            prims=annotated,
            pipeline_state_version=state.pipeline_state_version,
        )
        return {
            "archimedes": pack,
            "scene_state": self.usd.to_dict(state),
            "scene_state_seal": self.usd.seal(state),
            "authority": "PRESENTATION",
        }
