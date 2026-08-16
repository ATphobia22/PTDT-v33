from __future__ import annotations

import math
from dataclasses import dataclass

WGS84_A_M = 6378137.0
WGS84_F = 1.0 / 298.257223563
WGS84_E2 = WGS84_F * (2.0 - WGS84_F)

@dataclass(frozen=True, slots=True)
class ECEF:
    x_m: float
    y_m: float
    z_m: float

class SpatialTransformBridge:
    """WGS84 geodetic to EPSG:4978 plus Web-Mercator tiling.

    EPSG:4978 requires ellipsoidal height. NAVD88 orthometric height
    must first be converted with an authoritative geoid model; this
    core therefore does not silently substitute NAVD88 for ellipsoidal
    height.
    """
    def wgs84_ellipsoidal_to_ecef(self, lon_deg: float, lat_deg: float, h_m: float) -> ECEF:
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

    def slippy_tile(self, lon_deg: float, lat_deg: float, zoom: int) -> tuple[int, int]:
        if zoom < 0 or zoom > 30:
            raise ValueError("zoom must be in [0, 30]")
        lat = max(-85.05112878, min(85.05112878, lat_deg))
        n = 1 << zoom
        x = int((lon_deg + 180.0) / 360.0 * n)
        lat_rad = math.radians(lat)
        y = int((1.0 - math.asinh(math.tan(lat_rad)) / math.pi) / 2.0 * n)
        return max(0, min(n - 1, x)), max(0, min(n - 1, y))
