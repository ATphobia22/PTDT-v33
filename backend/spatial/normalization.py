"""Spatial normalization — EPSG:2966 project meters + render-origin local frame."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from backend.core.v34_sovereign_constants import CRS, SITE_LAT, SITE_LON

RENDER_ORIGIN_E_M: float = 480_000.0
RENDER_ORIGIN_N_M: float = 4_195_000.0


@dataclass(frozen=True, slots=True)
class ProjectedPoint:
    easting_m: float
    northing_m: float
    elev_navd88_ft: float
    crs: str = CRS


@dataclass(frozen=True, slots=True)
class LocalPoint:
    x_m: float
    y_m: float
    z_m: float


class SpatialNormalizationEngine:
    """Fail-closed spatial transforms for PTDT presentation + physics bridges."""

    def __init__(
        self,
        origin_e: float = RENDER_ORIGIN_E_M,
        origin_n: float = RENDER_ORIGIN_N_M,
        crs: str = CRS,
    ) -> None:
        if not (origin_e == origin_e and origin_n == origin_n):
            raise ValueError("Origin must be finite.")
        self.origin_e = origin_e
        self.origin_n = origin_n
        self.crs = crs
        self.site_lat = SITE_LAT
        self.site_lon = SITE_LON

    def project_to_local(self, point: ProjectedPoint) -> LocalPoint:
        if point.crs != self.crs:
            raise ValueError(f"CRS mismatch: expected {self.crs}, got {point.crs}")
        if not all(
            v == v
            for v in (point.easting_m, point.northing_m, point.elev_navd88_ft)
        ):
            raise ValueError("Non-finite projected coordinates.")
        z_m = point.elev_navd88_ft * 0.3048
        return LocalPoint(
            x_m=point.easting_m - self.origin_e,
            y_m=point.northing_m - self.origin_n,
            z_m=z_m,
        )

    def local_to_project(self, local: LocalPoint) -> ProjectedPoint:
        if not all(v == v for v in (local.x_m, local.y_m, local.z_m)):
            raise ValueError("Non-finite local coordinates.")
        return ProjectedPoint(
            easting_m=local.x_m + self.origin_e,
            northing_m=local.y_m + self.origin_n,
            elev_navd88_ft=local.z_m / 0.3048,
            crs=self.crs,
        )

    def normalize_ring(self, ring: Sequence[ProjectedPoint]) -> list[LocalPoint]:
        if len(ring) < 3:
            raise ValueError("Polygon ring requires >= 3 vertices.")
        return [self.project_to_local(p) for p in ring]

    def assert_same_origin(
        self, other_origin_e: float, other_origin_n: float, tol_m: float = 1e-3
    ) -> None:
        if abs(self.origin_e - other_origin_e) > tol_m or abs(
            self.origin_n - other_origin_n
        ) > tol_m:
            raise ValueError("Render origin mismatch between subsystems.")
