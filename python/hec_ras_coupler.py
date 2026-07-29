#!/usr/bin/env python3
"""
HEC-RAS 2D HDF5 geometry coupler (optional h5py).

Honest scope:
- If a RAS mapper HDF is present, open for inspection.
- compute_2d_flood_extent is a *screening* Manning reach estimate, NOT a HEC-RAS 2D solution.
- Regulatory No-Rise requires PE-run HEC-RAS (or equivalent) models, not this helper.
"""
from __future__ import annotations

import logging
import os
from typing import Any, Dict, Optional

logger = logging.getLogger("PTDT.HECRASCoupler")

try:
    import h5py
except ImportError:
    h5py = None  # type: ignore
    logger.warning("h5py unavailable; HDF5 open disabled")


class HECRASCoupler:
    def __init__(self, project_path: Optional[str] = None, manning_n: float = 0.045):
        self.project_path = project_path
        self.manning_n = manning_n
        self.mesh_cells: Any = None
        if h5py and project_path and os.path.exists(project_path):
            try:
                self.mesh_cells = h5py.File(project_path, "r")
                logger.info("Opened HEC-RAS HDF5: %s", project_path)
            except Exception as e:
                logger.error("HDF5 open failed: %s", e)

    def compute_2d_flood_extent(
        self, upstream_stage_ft: float, downstream_stage_ft: float, upstream_flow_cfs: float
    ) -> Dict[str, Any]:
        """Screening friction-slope estimate — label as non-regulatory."""
        upstream_flow_m3s = upstream_flow_cfs * 0.0283168
        channel_width_m = 300.0 * 0.3048
        avg_depth_ft = max(0.1, (upstream_stage_ft + downstream_stage_ft) / 2.0)
        avg_depth_m = avg_depth_ft * 0.3048
        area_m2 = max(0.01, channel_width_m * avg_depth_m)
        velocity_ms = upstream_flow_m3s / area_m2
        hydraulic_radius_m = abs(avg_depth_m)
        friction_slope = (self.manning_n**2 * velocity_ms**2) / (hydraulic_radius_m ** (4.0 / 3.0))
        reach_length_m = 1000.0
        drop_m = friction_slope * reach_length_m
        peak_wse_ft = upstream_stage_ft - (drop_m / 0.3048)
        return {
            "status": "SCREENING_ONLY",
            "average_depth_m": round(avg_depth_m, 4),
            "velocity_ms": round(velocity_ms, 4),
            "friction_slope": round(float(friction_slope), 8),
            "simulated_peak_wse_ft": round(peak_wse_ft, 4),
            "hdf5_loaded": self.mesh_cells is not None,
            "disclaimer": "Not a HEC-RAS 2D solution. Use USACE HEC-RAS for No-Rise / floodway models.",
        }

    def close(self) -> None:
        if self.mesh_cells is not None:
            try:
                self.mesh_cells.close()
            except Exception:
                pass
