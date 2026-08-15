"""USD/WebGPU Sovereign Renderer — presentation orchestration."""
from __future__ import annotations

import json
from dataclasses import dataclass
from hashlib import sha256
from typing import Any

from engine.cinematic_runtime.acescg_hydra_viewport import (
    ACEScgHydraViewportConfig,
    seal_viewport_config,
)
from engine.cinematic_runtime.archimedes_webgpu_coupler import ArchimedesWebGPUCoupler
from engine.cinematic_runtime.usd_scene_state_generator import UsdSceneStateGenerator
from engine.cinematic_runtime.webgpu_cinematic_frame_emitter import WebGPUCinematicFrameEmitter


@dataclass
class SovereignRenderPlan:
    scene_state: dict[str, Any]
    scene_state_seal: str
    viewport: dict[str, Any]
    viewport_seal: str
    archimedes_pack: dict[str, Any]
    webgpu_buffers: dict[str, Any]
    authority: str = "PRESENTATION"
    plan_seal: str = ""


def _seal(d: dict[str, Any]) -> str:
    return sha256(
        json.dumps(d, sort_keys=True, separators=(",", ":"), ensure_ascii=False).encode()
    ).hexdigest()


class UsdWebGpuSovereignRenderer:
    def __init__(self) -> None:
        self.usd = UsdSceneStateGenerator()
        self.viewport_cfg = ACEScgHydraViewportConfig()
        self.arch = ArchimedesWebGPUCoupler()
        self.emitter = WebGPUCinematicFrameEmitter()

    def build_plan(self, width: int = 1920, height: int = 1080) -> SovereignRenderPlan:
        state = self.usd.build_default_bonebank()
        scene_dict = self.usd.to_dict(state)
        scene_seal = self.usd.seal(state)
        vp = self.viewport_cfg.to_hydra_settings()
        vp_seal = seal_viewport_config(self.viewport_cfg)
        uniforms = self.arch.from_defaults()
        pack = self.arch.pack_for_webgpu(uniforms)
        buffers = {
            "archimedes_uniforms": {
                "byteLength": 64,
                "usage": "UNIFORM | COPY_DST",
                "float32": pack["float32"],
                "seal": pack["seal"],
            },
            "frame_target": {"width": width, "height": height, "color_space": "ACEScg"},
        }
        plan = SovereignRenderPlan(
            scene_state=scene_dict,
            scene_state_seal=scene_seal,
            viewport=vp,
            viewport_seal=vp_seal,
            archimedes_pack=pack,
            webgpu_buffers=buffers,
        )
        plan.plan_seal = _seal({
            "scene_state_seal": scene_seal,
            "viewport_seal": vp_seal,
            "archimedes_seal": pack["seal"],
            "width": width,
            "height": height,
        })
        return plan

    def emit_frame_from_plan(self, plan: SovereignRenderPlan, width: int = 1920, height: int = 1080):
        return self.emitter.emit(
            width=width,
            height=height,
            plate_ids=["sovereign-0"],
            composition_stack_sha256=plan.plan_seal,
            color_space="ACEScg",
        )
