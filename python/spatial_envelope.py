#!/usr/bin/env python3
"""Meridian-corrected bounding envelope for Indiana GIS queries (stdlib only)."""
from __future__ import annotations

import math
from typing import Dict

INDIANA_BOUNDS = {"xmin": -88.09, "ymin": 37.77, "xmax": -84.78, "ymax": 41.76}


def in_indiana(lat: float, lon: float) -> bool:
    return (
        INDIANA_BOUNDS["ymin"] <= lat <= INDIANA_BOUNDS["ymax"]
        and INDIANA_BOUNDS["xmin"] <= lon <= INDIANA_BOUNDS["xmax"]
    )


def build_spatial_envelope(lat: float, lon: float, radius_miles: float) -> Dict[str, float]:
    """Δlon scaled by cos(φ) to reduce flat-earth error near φ ≈ 38°N."""
    lat_rad = math.radians(lat)
    delta_lat = radius_miles / 69.05
    cos_lat = max(1e-6, abs(math.cos(lat_rad)))
    delta_lon = radius_miles / (69.05 * cos_lat)
    return {
        "xmin": lon - delta_lon,
        "ymin": lat - delta_lat,
        "xmax": lon + delta_lon,
        "ymax": lat + delta_lat,
        "in_sr": 4326,
        "out_sr": 4326,
    }


def esri_point_query_params(lat: float, lon: float) -> Dict[str, str]:
    if not in_indiana(lat, lon):
        raise ValueError("Coordinate outside approximate Indiana bounds")
    return {
        "f": "json",
        "geometry": f'{{"x": {lon}, "y": {lat}}}',
        "geometryType": "esriGeometryPoint",
        "inSR": "4326",
        "outSR": "4326",
        "returnGeometry": "true",
    }


if __name__ == "__main__":
    # 13101 Bonebank Rd approximate
    print(build_spatial_envelope(37.92, -87.95, 2.0))
