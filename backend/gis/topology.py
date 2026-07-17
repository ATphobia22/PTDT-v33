import logging
from typing import Dict, Any, Tuple, Optional
from shapely.geometry import Polygon, MultiPolygon, box
from shapely.validation import make_valid

logger = logging.getLogger("ptdt.gis.topology")

class TopologyAnalyst:
    def __init__(self, target_crs: str = "EPSG:32616"):
        self.target_crs = target_crs

    def validate_and_repair_polygon(self, coords: list) -> Optional[Polygon]:
        try:
            if len(coords) < 3:
                raise ValueError("Polygons must contain at least 3 coordinate pairings.")
            poly = Polygon(coords)
            if not poly.is_valid:
                logger.warning("Invalid geometry ring detected; running topological repair...")
                repaired = make_valid(poly)
                if isinstance(repaired, MultiPolygon):
                    poly = max(repaired.geoms, key=lambda g: g.area)
                else:
                    poly = repaired
            return poly
        except Exception as e:
            logger.error(f"Failed to process or repair spatial polygon: {str(e)}")
            return None

    def evaluate_bbox_intersection(self, geom: Polygon, bbox_coords: Tuple[float, float, float, float]) -> bool:
        bounding_box = box(*bbox_coords)
        return geom.intersects(bounding_box)
