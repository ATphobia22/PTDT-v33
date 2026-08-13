"""WebGPU Cinematic Frame Emitter — sealed presentation frames."""
from __future__ import annotations

import json
import time
from dataclasses import dataclass, field
from hashlib import sha256
from typing import Any


@dataclass
class CinematicFrameEnvelope:
    schema_version: int = 1
    sequence: int = 0
    pipeline_state_version: str = "v33.0"
    width: int = 0
    height: int = 0
    color_space: str = "ACEScg"
    plate_ids: list[str] = field(default_factory=list)
    dem_sha256: str = ""
    wse_sequence: int | None = None
    composition_stack_sha256: str = ""
    content_sha256: str | None = None
    timestamp_unix: float = 0.0
    authority: str = "PRESENTATION"
    state_cryptographic_seal: str = ""

    def payload_for_seal(self) -> dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "sequence": self.sequence,
            "pipeline_state_version": self.pipeline_state_version,
            "width": self.width,
            "height": self.height,
            "color_space": self.color_space,
            "plate_ids": list(self.plate_ids),
            "dem_sha256": self.dem_sha256,
            "wse_sequence": self.wse_sequence,
            "composition_stack_sha256": self.composition_stack_sha256,
            "content_sha256": self.content_sha256,
            "timestamp_unix": self.timestamp_unix,
            "authority": self.authority,
        }


def seal_frame(env: CinematicFrameEnvelope) -> str:
    raw = json.dumps(
        env.payload_for_seal(), sort_keys=True, separators=(",", ":"), ensure_ascii=False
    )
    return sha256(raw.encode("utf-8")).hexdigest()


def verify_frame_seal(env: CinematicFrameEnvelope) -> bool:
    return env.state_cryptographic_seal == seal_frame(env)


class WebGPUCinematicFrameEmitter:
    def __init__(self, pipeline_state_version: str = "v33.0") -> None:
        self.pipeline_state_version = pipeline_state_version
        self._seq = 0
        self._last: CinematicFrameEnvelope | None = None

    def emit(
        self,
        *,
        width: int,
        height: int,
        plate_ids: list[str] | None = None,
        dem_sha256: str = "",
        wse_sequence: int | None = None,
        composition_stack_sha256: str = "",
        content_sha256: str | None = None,
        color_space: str = "ACEScg",
    ) -> CinematicFrameEnvelope:
        if width <= 0 or height <= 0:
            raise ValueError("width/height must be positive")
        self._seq += 1
        env = CinematicFrameEnvelope(
            sequence=self._seq,
            pipeline_state_version=self.pipeline_state_version,
            width=width,
            height=height,
            color_space=color_space,
            plate_ids=list(plate_ids or []),
            dem_sha256=dem_sha256,
            wse_sequence=wse_sequence,
            composition_stack_sha256=composition_stack_sha256,
            content_sha256=content_sha256,
            timestamp_unix=time.time(),
        )
        env.state_cryptographic_seal = seal_frame(env)
        self._last = env
        return env

    @property
    def last_frame(self) -> CinematicFrameEnvelope | None:
        return self._last
