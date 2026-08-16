from __future__ import annotations

import math
from typing import Any

from pydantic import BaseModel, Field

INDIANA_BOUNDS = {"xmin": -88.09, "ymin": 37.77, "xmax": -84.78, "ymax": 41.76}


class GISFeatureSchema(BaseModel):
    feature_id: str = Field(..., alias="id")
    geometry_wkt: str
    properties: dict[str, Any]


class GISDataAggregator:
    def __init__(self, redis_url: str = "redis://localhost:6379") -> None:
        self.redis_url = redis_url
        self.anchor_lat = 37.9035
        self.anchor_lon = -88.0007
        self._bounds = INDIANA_BOUNDS

    def verify_jurisdictional_bounds(self, lat: float, lon: float) -> bool:
        return self._bounds["xmin"] <= lon <= self._bounds["xmax"] and self._bounds["ymin"] <= lat <= self._bounds["ymax"]

    def build_accurate_spatial_envelope(self, lat: float, lon: float, radius_miles: float) -> dict[str, float]:
        if radius_miles < 0:
            raise ValueError("radius_miles must be non-negative")
        lat_rad = math.radians(lat)
        delta_lat = radius_miles / 69.05
        delta_lon = radius_miles / max(69.05 * math.cos(lat_rad), 1e-9)
        return {"xmin": lon - delta_lon, "ymin": lat - delta_lat, "xmax": lon + delta_lon, "ymax": lat + delta_lat}

    def parcel_envelope(self) -> dict[str, float]:
        return self.build_accurate_spatial_envelope(self.anchor_lat, self.anchor_lon, 0.5)
