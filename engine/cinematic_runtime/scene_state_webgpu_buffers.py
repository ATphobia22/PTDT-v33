"""PTDT SceneState → WebGPU Buffer Generator"""
from __future__ import annotations

import struct
from dataclasses import dataclass
from typing import Any

from engine.cinematic_runtime.archimedes_webgpu_coupler import ArchimedesWebGPUCoupler
from engine.cinematic_runtime.usd_scene_state_generator import (
    PtdtSceneState,
    UsdSceneStateGenerator,
)


@dataclass
class BufferDescriptor:
    label: str
    size: int
    usage: str
    data: bytes
    seal: str | None = None


class SceneStateWebGpuBufferGenerator:
    def __init__(self) -> None:
        self.usd = UsdSceneStateGenerator()
        self.arch = ArchimedesWebGPUCoupler()

    def generate(
        self,
        state: PtdtSceneState | None = None,
        archimedes_dict: dict[str, Any] | None = None,
    ) -> list[BufferDescriptor]:
        if state is None:
            state = self.usd.build_default_bonebank()
        uniforms = (
            self.arch.from_archimedes_dict(archimedes_dict)
            if archimedes_dict
            else self.arch.from_defaults()
        )
        pack = self.arch.pack_for_webgpu(uniforms)
        origin = state.render_origin_xy
        origin_bytes = struct.pack("<4f", float(origin[0]), float(origin[1]), 0.0, 0.0)
        scene_seal = self.usd.seal(state)
        return [
            BufferDescriptor(
                label="ptdt-archimedes-uniforms",
                size=64,
                usage="UNIFORM | COPY_DST",
                data=uniforms.to_bytes(),
                seal=pack["seal"],
            ),
            BufferDescriptor(
                label="ptdt-render-origin",
                size=16,
                usage="UNIFORM | COPY_DST",
                data=origin_bytes,
                seal=scene_seal[:16],
            ),
        ]
