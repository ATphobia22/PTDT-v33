from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from typing import Any, Mapping

from .provenance import canonical_sha256


@dataclass(frozen=True, slots=True)
class SceneState:
    """Deterministic, transport-neutral snapshot for rendering and simulation.

    The state is intentionally free of engine-specific objects. It can therefore
    be serialized once and consumed by MapLibre/WebGPU, OpenUSD, Unity, or Unreal.
    """

    scene_id: str
    revision: int
    timestamp_utc: str
    tile_ids: tuple[str, ...] = ()
    layer_revisions: Mapping[str, int] = field(default_factory=dict)
    camera_origin_ecef_m: tuple[float, float, float] = (0.0, 0.0, 0.0)
    water_surface_elevation_m: float | None = None
    confidence: float = 1.0

    def __post_init__(self) -> None:
        if not self.scene_id:
            raise ValueError("scene_id is required")
        if self.revision < 0:
            raise ValueError("revision must be >= 0")
        if not self.timestamp_utc or self.timestamp_utc[-1] != "Z":
            raise ValueError("timestamp_utc must be an explicit UTC timestamp ending in Z")
        if len(self.camera_origin_ecef_m) != 3 or not all(math.isfinite(float(v)) for v in self.camera_origin_ecef_m):
            raise ValueError("camera_origin_ecef_m must contain three finite values")
        if self.water_surface_elevation_m is not None and not math.isfinite(self.water_surface_elevation_m):
            raise ValueError("water_surface_elevation_m must be finite")
        if not math.isfinite(self.confidence) or not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be in [0,1]")
        if any(not tile_id for tile_id in self.tile_ids):
            raise ValueError("tile_ids cannot contain empty identifiers")
        if any(not name or revision < 0 for name, revision in self.layer_revisions.items()):
            raise ValueError("layer revisions require non-empty names and non-negative revisions")

    def to_mapping(self) -> dict[str, Any]:
        return {
            "scene_id": self.scene_id,
            "revision": self.revision,
            "timestamp_utc": self.timestamp_utc,
            "tile_ids": list(self.tile_ids),
            "layer_revisions": dict(sorted(self.layer_revisions.items())),
            "camera_origin_ecef_m": list(self.camera_origin_ecef_m),
            "water_surface_elevation_m": self.water_surface_elevation_m,
            "confidence": self.confidence,
        }

    def canonical_bytes(self) -> bytes:
        return json.dumps(
            self.to_mapping(),
            sort_keys=True,
            separators=(",", ":"),
            ensure_ascii=False,
            allow_nan=False,
        ).encode("utf-8")

    @property
    def content_sha256(self) -> str:
        return canonical_sha256(self.to_mapping())

    def diff(self, other: SceneState) -> dict[str, Any]:
        """Return only changed top-level fields between two scene snapshots."""
        if not isinstance(other, SceneState):
            raise TypeError("other must be a SceneState")
        current = self.to_mapping()
        previous = other.to_mapping()
        return {key: value for key, value in current.items() if value != previous.get(key)}
