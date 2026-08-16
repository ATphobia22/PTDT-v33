from __future__ import annotations

import math
from dataclasses import dataclass

from pyproj import Transformer

WGS84_A_M = 6378137.0
WGS84_F = 1.0 / 298.257223563
WGS84_E2 = WGS84_F * (2.0 - WGS84_F)


def _require_finite(*values: float) -> None:
    if not all(math.isfinite(value) for value in values):
        raise ValueError("spatial coordinates must be finite")


@dataclass(frozen=True, slots=True)
class ECEF:
    x_m: float
    y_m: float
    z_m: float


class SpatialTransformBridge:
    """Authoritative horizontal projection bridge plus WGS84/ECEF conversion.

    EPSG:2966 is a projected horizontal CRS in US survey feet. EPSG:4978 uses
    WGS84 ellipsoidal height. NAVD88 orthometric height must be converted with
    an authoritative geoid model before calling the ECEF method.
    """

    def __init__(self) -> None:
        self._epsg2966_to_wgs84 = Transformer.from_crs("EPSG:2966", "EPSG:4326", always_xy=True)

    def wgs84_ellipsoidal_to_ecef(self, lon_deg: float, lat_deg: float, h_m: float) -> ECEF:
        _require_finite(lon_deg, lat_deg, h_m)
        if not (-180.0 <= lon_deg <= 180.0 and -90.0 <= lat_deg <= 90.0):
            raise ValueError("invalid WGS84 longitude/latitude")
        lon = math.radians(lon_deg)
        lat = math.radians(lat_deg)
        sin_lat = math.sin(lat)
        cos_lat = math.cos(lat)
        n = WGS84_A_M / math.sqrt(1.0 - WGS84_E2 * sin_lat * sin_lat)
        return ECEF(
            (n + h_m) * cos_lat * math.cos(lon),
            (n + h_m) * cos_lat * math.sin(lon),
            (n * (1.0 - WGS84_E2) + h_m) * sin_lat,
        )

    def epsg2966_to_wgs84(self, easting_ftus: float, northing_ftus: float) -> tuple[float, float]:
        _require_finite(easting_ftus, northing_ftus)
        lon_deg, lat_deg = self._epsg2966_to_wgs84.transform(easting_ftus, northing_ftus)
        if not (-180.0 <= lon_deg <= 180.0 and -90.0 <= lat_deg <= 90.0):
            raise ValueError("EPSG:2966 transform returned invalid WGS84 coordinates")
        return float(lon_deg), float(lat_deg)

    def epsg2966_to_ecef(self, easting_ftus: float, northing_ftus: float, ellipsoidal_height_m: float) -> ECEF:
        _require_finite(easting_ftus, northing_ftus, ellipsoidal_height_m)
        lon_deg, lat_deg = self.epsg2966_to_wgs84(easting_ftus, northing_ftus)
        return self.wgs84_ellipsoidal_to_ecef(lon_deg, lat_deg, ellipsoidal_height_m)

    def slippy_tile(self, lon_deg: float, lat_deg: float, zoom: int) -> tuple[int, int]:
        _require_finite(lon_deg, lat_deg)
        if zoom < 0 or zoom > 30:
            raise ValueError("zoom must be in [0, 30]")
        if not -180.0 <= lon_deg <= 180.0:
            raise ValueError("longitude must be in [-180, 180]")
        lat = max(-85.05112878, min(85.05112878, lat_deg))
        n = 1 << zoom
        x = int((lon_deg + 180.0) / 360.0 * n)
        lat_rad = math.radians(lat)
        y = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
        return max(0, min(n - 1, x)), max(0, min(n - 1, y))
