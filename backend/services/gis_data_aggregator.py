# backend/services/gis_data_aggregator.py
import math
import logging
import redis.asyncio as aioredis
from shapely.geometry import Point, Polygon
from pydantic import BaseModel, Field
from typing import Dict, Any

logger = logging.getLogger("PTDT.GISDataAggregator")

INDIANA_BOUNDS = {
    "xmin": -88.09, "ymin": 37.77,
    "xmax": -84.78, "ymax": 41.76
}

class GISFeatureSchema(BaseModel):
    feature_id: str = Field(..., alias="id")
    geometry_wkt: str
    properties: Dict[str, Any]

class GISDataAggregator:
    def __init__(self, redis_url: str = "redis://localhost:6379"):
        self.redis_client = aioredis.from_url(redis_url, decode_responses=True)
        self.state_poly = Polygon([
            (INDIANA_BOUNDS["xmin"], INDIANA_BOUNDS["ymin"]),
            (INDIANA_BOUNDS["xmin"], INDIANA_BOUNDS["ymax"]),
            (INDIANA_BOUNDS["xmax"], INDIANA_BOUNDS["ymax"]),
            (INDIANA_BOUNDS["xmax"], INDIANA_BOUNDS["ymin"])
        ])

    def verify_jurisdictional_bounds(self, lat: float, lon: float) -> bool:
        """Enforces legal boundaries of Indiana to prevent out-of-bounds spatial requests."""
        return self.state_poly.contains(Point(lon, lat))

    def build_accurate_spatial_envelope(self, lat: float, lon: float, radius_miles: float) -> Dict[str, float]:
        """
        Calculates a georeferenced bounding envelope, correcting for longitudinal compression
        via meridian convergence cosines at Indiana's latitude coordinate.
        """
        lat_rad = math.radians(lat)
        delta_lat = radius_miles / 69.05
        # Longitudinal degrees are adjusted by the cosine of the active latitude angle
        delta_lon = radius_miles / (69.05 * math.cos(lat_rad))
        return {
            "xmin": lon - delta_lon,
            "ymin": lat - delta_lat,
            "xmax": lon + delta_lon,
            "ymax": lat + delta_lat
        }

    async def build_esri_query(self, lat: float, lon: float) -> Dict[str, Any]:
        """Generates valid ESRI REST parameters with input and output spatial references."""
        if not self.verify_jurisdictional_bounds(lat, lon):
            raise ValueError("Target coordinate falls outside Indiana DNR boundaries.")
        return {
            "f": "json",
            "geometry": f'{{"x":{lon},"y":{lat}}}',
            "geometryType": "esriGeometryPoint",
            "inSR": "4326",
            "outSR": "4326",
            "returnGeometry": "true"
        }
