from __future__ import annotations

import json
import math
from dataclasses import dataclass
from typing import Any, Mapping

from .provenance import ProvenanceManifest, canonical_sha256


@dataclass(frozen=True, slots=True)
class SpatialTile:
    tile_id: str
    version: int
    crs: str
    vertical_datum: str
    bounds: tuple[float, float, float, float]
    provenance: ProvenanceManifest
    confidence: float
    epoch: str | None = None
    layers: Mapping[str, Any] | None = None

    def __post_init__(self) -> None:
        if not self.tile_id:
            raise ValueError("tile_id is required")
        if self.version < 1:
            raise ValueError("version must be >= 1")
        if not self.crs:
            raise ValueError("crs is required")
        if not self.vertical_datum:
            raise ValueError("vertical_datum is required")
        if len(self.bounds) != 4 or not all(math.isfinite(float(v)) for v in self.bounds):
            raise ValueError("bounds must contain four finite coordinates")
        min_x, min_y, max_x, max_y = self.bounds
        if min_x > max_x or min_y > max_y:
            raise ValueError("bounds must be ordered min_x,min_y,max_x,max_y")
        if not math.isfinite(self.confidence) or not 0.0 <= self.confidence <= 1.0:
            raise ValueError("confidence must be in [0,1]")
        if self.layers is None:
            object.__setattr__(self, "layers", {})

    def to_mapping(self) -> dict[str, Any]:
        return {
            "tile_id": self.tile_id,
            "version": self.version,
            "crs": self.crs,
            "vertical_datum": self.vertical_datum,
            "epoch": self.epoch,
            "bounds": list(self.bounds),
            "confidence": self.confidence,
            "provenance": self.provenance.to_mapping(),
            "layers": dict(self.layers or {}),
        }

    def canonical_bytes(self) -> bytes:
        return json.dumps(self.to_mapping(), sort_keys=True, separators=(",", ":"), ensure_ascii=False, allow_nan=False).encode("utf-8")

    @property
    def content_sha256(self) -> str:
        return canonical_sha256(self.to_mapping())

    @classmethod
    def from_mapping(cls, payload: Mapping[str, Any], provenance: ProvenanceManifest) -> "SpatialTile":
        bounds = payload.get("bounds")
        if not isinstance(bounds, (list, tuple)):
            raise ValueError("bounds must be a sequence")
        return cls(
            tile_id=str(payload["tile_id"]),
            version=int(payload.get("version", 1)),
            crs=str(payload["crs"]),
            vertical_datum=str(payload["vertical_datum"]),
            epoch=None if payload.get("epoch") is None else str(payload["epoch"]),
            bounds=tuple(float(v) for v in bounds),
            confidence=float(payload["confidence"]),
            provenance=provenance,
            layers=payload.get("layers", {}),
        )
