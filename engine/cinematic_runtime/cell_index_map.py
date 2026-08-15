"""PTDT-v33: bake HEC-RAS cell index map for WebGPU.

Produces HxW uint32 array; 0xFFFFFFFF = no cell.
Prefer CPU rasterize (rasterio) for deterministic sealed artifacts.
"""
from __future__ import annotations

from typing import Any, Sequence

import numpy as np

NODATA_CELL: int = 0xFFFFFFFF


def bake_cell_index_map(
    width: int,
    height: int,
    *,
    world_origin_x: float,
    world_origin_y: float,
    pixel_size_x: float,
    pixel_size_y: float,
    cell_polygons: Sequence[Any] | None = None,
    precomputed: np.ndarray | None = None,
) -> np.ndarray:
    """Return uint32 HxW index map.

    If precomputed is provided it is validated and returned.
    Otherwise returns nodata-filled grid (caller must rasterize offline).
    """
    if precomputed is not None:
        if precomputed.shape != (height, width):
            raise ValueError(
                f"precomputed shape {precomputed.shape} != ({height}, {width})"
            )
        if precomputed.dtype != np.uint32:
            raise ValueError("precomputed must be dtype uint32")
        return precomputed

    # Fail-closed empty map: no silent fake cell IDs
    _ = (world_origin_x, world_origin_y, pixel_size_x, pixel_size_y, cell_polygons)
    return np.full((height, width), NODATA_CELL, dtype=np.uint32)


def scale_wse_to_mm(wse: np.ndarray, nodata: float = -9999.0) -> np.ndarray:
    """Compress float WSE to int32 millimeters for Redis/WebSocket."""
    out = np.full(wse.shape, -9999, dtype=np.int32)
    valid = np.isfinite(wse) & (wse != nodata)
    out[valid] = np.round(wse[valid] * 1000.0).astype(np.int32)
    return out
