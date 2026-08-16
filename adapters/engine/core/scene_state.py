from __future__ import annotations

import math
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

import rfc8785


class SceneStateValidationError(ValueError):
    """Raised when a derived engine frame violates the authority contract."""


@dataclass(frozen=True, slots=True)
class SceneState:
    frame_id: str
    authority_snapshot_id: str
    timestamp_utc: str
    crs: str
    vertical_datum: str
    render_origin: tuple[float, float, float]
    content_hash: str
    validation_status: str

    @classmethod
    def from_mapping(cls, payload: Mapping[str, Any]) -> SceneState:
        required = (
            "frame_id",
            "authority_snapshot_id",
            "timestamp_utc",
            "crs",
            "vertical_datum",
            "render_origin",
            "content_hash",
            "validation_status",
        )
        missing = [name for name in required if name not in payload or payload[name] in (None, "")]
        if missing:
            raise SceneStateValidationError(f"missing SceneState fields: {', '.join(missing)}")

        origin = payload["render_origin"]
        if not isinstance(origin, (list, tuple)) or len(origin) != 3:
            raise SceneStateValidationError("render_origin must contain exactly three coordinates")
        coordinates = tuple(float(value) for value in origin)
        if not all(math.isfinite(value) for value in coordinates):
            raise SceneStateValidationError("render_origin must contain finite coordinates")
        if payload["crs"] != "EPSG:2966":
            raise SceneStateValidationError("SceneState CRS must be EPSG:2966")
        if payload["vertical_datum"] != "NAVD88":
            raise SceneStateValidationError("SceneState vertical datum must be NAVD88")
        content_hash = str(payload["content_hash"])
        if len(content_hash) != 64 or any(character not in "0123456789abcdef" for character in content_hash):
            raise SceneStateValidationError("content_hash must be a lowercase SHA-256 digest")

        return cls(
            frame_id=str(payload["frame_id"]),
            authority_snapshot_id=str(payload["authority_snapshot_id"]),
            timestamp_utc=str(payload["timestamp_utc"]),
            crs=str(payload["crs"]),
            vertical_datum=str(payload["vertical_datum"]),
            render_origin=coordinates,
            content_hash=content_hash,
            validation_status=str(payload["validation_status"]),
        )

    def to_mapping(self) -> dict[str, Any]:
        return {
            "frame_id": self.frame_id,
            "authority_snapshot_id": self.authority_snapshot_id,
            "timestamp_utc": self.timestamp_utc,
            "crs": self.crs,
            "vertical_datum": self.vertical_datum,
            "render_origin": list(self.render_origin),
            "content_hash": self.content_hash,
            "validation_status": self.validation_status,
        }

    def canonical_bytes(self) -> bytes:
        return rfc8785.dumps(self.to_mapping())
