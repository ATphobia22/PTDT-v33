#!/usr/bin/env python3
"""
Volumetric water accumulation + cut/fill compliance (screening).

Depth matrices should come from HEC-RAS 2D / PE models — mock grids are for unit tests only.
"""
from __future__ import annotations

import hashlib
import json
from typing import Any, Dict

try:
    import numpy as np
except ImportError:  # pragma: no cover
    np = None  # type: ignore

CUBIC_METERS_TO_ACRE_FEET = 0.000810714
CUBIC_METERS_TO_GALLONS = 264.172
CELL_AREA_SQ_METERS = 1.0  # assume 1 m grid; override when using true cell size
YD3_TO_M3 = 0.764555


class VolumetricAccumulationEngine:
    def __init__(self, property_name: str = "13101 Bonebank Road", cell_area_m2: float = CELL_AREA_SQ_METERS):
        self.property_name = property_name
        self.cell_area = float(cell_area_m2)

    def compute_volume(self, depth_matrix: Any, economic_threshold_ft: float = 1.0) -> Dict[str, Any]:
        if np is None:
            raise RuntimeError("numpy is required: pip install numpy")
        matrix = np.array(depth_matrix, dtype=np.float64)
        wet = matrix[np.isfinite(matrix) & (matrix > 0.0)]
        total_m3 = float(np.sum(wet) * self.cell_area)
        total_af = total_m3 * CUBIC_METERS_TO_ACRE_FEET
        total_gal = total_m3 * CUBIC_METERS_TO_GALLONS
        thr_m = economic_threshold_ft / 3.28084
        inundated = int(np.sum(matrix >= thr_m))
        acres = float(inundated * self.cell_area * 0.000247105)
        payload = f"{self.property_name}:{total_m3:.6f}:{total_af:.6f}:{wet.size}"
        return {
            "property": self.property_name,
            "total_wet_cells": int(wet.size),
            "total_cubic_meters": round(total_m3, 3),
            "total_acre_feet": round(total_af, 4),
            "total_gallons": round(total_gal, 2),
            "economic_trigger": {
                "threshold_feet": economic_threshold_ft,
                "impacted_acres": round(acres, 3),
                "alert_active": acres > 0.0,
            },
            "cryptographic_provenance": hashlib.sha256(payload.encode("utf-8")).hexdigest(),
            "note": "Screening volume from depth grid; PE HEC-RAS 2D governs regulatory filings",
        }

    def verify_cut_fill_compliance(
        self, fill_volume_yd3: float, cut_volume_yd3: float, safety_factor: float = 1.20
    ) -> Dict[str, Any]:
        fill_m3 = fill_volume_yd3 * YD3_TO_M3
        cut_m3 = cut_volume_yd3 * YD3_TO_M3
        net_m3 = fill_m3 - cut_m3
        ratio = cut_volume_yd3 / max(fill_volume_yd3, 1e-9)
        compliant = (ratio >= safety_factor) and (net_m3 <= 0.0)
        return {
            "fill_yd3": fill_volume_yd3,
            "cut_yd3": cut_volume_yd3,
            "compensatory_ratio": round(ratio, 3),
            "required_ratio": safety_factor,
            "net_volume_m3": round(net_m3, 3),
            "storage_increases": net_m3 <= 0.0,
            "project_1_20x_met": ratio >= safety_factor,
            "no_rise_screening_ok": compliant,
            "note": "Project 1.20x factor; confirm IDNR/local required ratio and method before seal",
        }


if __name__ == "__main__":
    if np is None:
        print(json.dumps({"error": "numpy required"}))
    else:
        mock = np.array(
            [
                [0.0, 0.0, 0.2, 0.5, 0.8, 0.5, 0.2, 0.0, 0.0, 0.0],
                [0.0, 0.1, 0.4, 0.9, 1.2, 0.9, 0.4, 0.1, 0.0, 0.0],
                [0.0, 0.3, 0.7, 1.4, 1.8, 1.4, 0.7, 0.3, 0.0, 0.0],
                [0.2, 0.5, 1.0, 1.9, 2.4, 1.9, 1.0, 0.5, 0.2, 0.0],
                [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
            ]
        )
        eng = VolumetricAccumulationEngine()
        print(json.dumps(eng.compute_volume(mock), indent=2))
        print(json.dumps(eng.verify_cut_fill_compliance(5000.0, 6500.0), indent=2))
