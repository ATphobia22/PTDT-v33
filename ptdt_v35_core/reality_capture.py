from __future__ import annotations

import math
from dataclasses import dataclass

from .provenance import canonical_sha256


@dataclass(frozen=True, slots=True)
class CameraObservation:
    observation_id: str
    timestamp: str
    sensor: str
    pose: tuple[float, ...]
    source_hash: str
    confidence: float

    def __post_init__(self) -> None:
        if not self.observation_id or not self.timestamp or not self.sensor:
            raise ValueError("observation identity, timestamp, and sensor are required")
        if len(self.pose) not in (6, 7):
            raise ValueError("pose must contain 6 or 7 values")
        if not all(math.isfinite(float(v)) for v in self.pose):
            raise ValueError("pose values must be finite")
        if len(self.source_hash) != 64 or any(c not in "0123456789abcdef" for c in self.source_hash):
            raise ValueError("source_hash must be a lowercase SHA-256 digest")
        if not math.isfinite(self.confidence) or not 0 <= self.confidence <= 1:
            raise ValueError("confidence must be in [0,1]")


@dataclass(frozen=True, slots=True)
class PointCloudDescriptor:
    point_count: int
    coordinate_crs: str
    vertical_datum: str
    source_hash: str

    def __post_init__(self) -> None:
        if self.point_count < 0:
            raise ValueError("point_count must be non-negative")
        if not self.coordinate_crs or not self.vertical_datum:
            raise ValueError("coordinate_crs and vertical_datum are required")
        if len(self.source_hash) != 64 or any(c not in "0123456789abcdef" for c in self.source_hash):
            raise ValueError("source_hash must be a lowercase SHA-256 digest")


@dataclass(frozen=True, slots=True)
class GaussianSceneDescriptor:
    kind: str
    epoch_start: str
    source_hash: str
    confidence: float
    epoch_end: str | None = None

    def __post_init__(self) -> None:
        if self.kind not in {"static", "temporal"}:
            raise ValueError("kind must be static or temporal")
        if self.kind == "temporal" and self.epoch_end is None:
            raise ValueError("temporal Gaussian scenes require epoch_end")
        if len(self.source_hash) != 64 or any(c not in "0123456789abcdef" for c in self.source_hash):
            raise ValueError("source_hash must be a lowercase SHA-256 digest")
        if not math.isfinite(self.confidence) or not 0 <= self.confidence <= 1:
            raise ValueError("confidence must be in [0,1]")


def derive_evidence_hash(source_hashes: tuple[str, ...]) -> str:
    if not source_hashes:
        raise ValueError("at least one source hash is required")
    return canonical_sha256(sorted(source_hashes))


@dataclass(frozen=True, slots=True)
class PointObservation:
    x: float
    y: float
    z: float
    class_code: int | None = None
    water_surface_m: float | None = None
    valid: bool = True


def classify_point(point: PointObservation) -> str:
    if not point.valid:
        return "invalid"
    if point.class_code == 2:
        return "ground"
    if point.class_code == 9:
        return "water"
    if point.water_surface_m is not None and point.z <= point.water_surface_m:
        return "water_or_submerged"
    return "other"


def filter_invalid_points(points: list[PointObservation]) -> list[PointObservation]:
    return [point for point in points if point.valid and all(math.isfinite(float(v)) for v in (point.x, point.y, point.z))]
