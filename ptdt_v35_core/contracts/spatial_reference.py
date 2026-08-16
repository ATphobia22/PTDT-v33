from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Final

SUPPORTED_LINEAR_UNITS: Final[frozenset[str]] = frozenset({"m", "ft", "ftUS"})


@dataclass(frozen=True, slots=True)
class SpatialReferenceContract:
    horizontal_crs: str
    vertical_datum: str
    epoch: str
    units: str
    axis_order: str
    transformation: str | None = None

    def validate(self) -> None:
        if not self.horizontal_crs.strip():
            raise ValueError("horizontal_crs is required")
        if not self.vertical_datum.strip():
            raise ValueError("vertical_datum is required")
        if not self.epoch.strip():
            raise ValueError("epoch is required")
        if self.units not in SUPPORTED_LINEAR_UNITS:
            raise ValueError(f"unsupported linear units: {self.units}")
        if self.axis_order not in {"xy", "yx"}:
            raise ValueError("axis_order must be 'xy' or 'yx'")

    def validate_coordinate(self, x: float, y: float, z: float | None = None) -> None:
        self.validate()
        values = (x, y) if z is None else (x, y, z)
        if not all(math.isfinite(value) for value in values):
            raise ValueError("coordinates must be finite")
