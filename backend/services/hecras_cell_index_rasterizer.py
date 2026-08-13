"""Rasterize unstructured HEC-RAS cell centers into a uint32 Cell Index Map."""
from __future__ import annotations

import json
import logging
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger("PTDT.CellIndexRasterizer")

try:
    import h5py
except ImportError:
    h5py = None


def load_cell_centers_from_hdf(hdf_path: str, flow_area: str) -> np.ndarray:
    if h5py is None:
        raise RuntimeError("h5py required")
    candidates = [
        f"/Geometry/2D Flow Areas/{flow_area}/Cells Center Coordinate",
        f"/Geometry/2D Flow Areas/{flow_area}/Cells Center Coordinates",
    ]
    with h5py.File(hdf_path, "r") as h5:
        for path in candidates:
            if path in h5:
                arr = np.asarray(h5[path], dtype=np.float64)
                if arr.ndim == 2 and arr.shape[1] >= 2:
                    return arr[:, :2]
                raise ValueError(f"Unexpected shape at {path}: {arr.shape}")
        base = "/Geometry/2D Flow Areas"
        areas = list(h5[base].keys()) if base in h5 else []
        raise KeyError(f"Cell centers not found for {flow_area!r}. Areas: {areas}")


def rasterize_nearest_cell_index(
    cell_xy: np.ndarray,
    *,
    origin_xy: tuple[float, float],
    pixel_size: float,
    width: int,
    height: int,
    nodata_id: int = 0xFFFFFFFF,
    max_distance: float | None = None,
) -> np.ndarray:
    if cell_xy.ndim != 2 or cell_xy.shape[1] < 2:
        raise ValueError("cell_xy must be (N, 2)")
    if width <= 0 or height <= 0 or pixel_size <= 0:
        raise ValueError("invalid raster parameters")
    n = cell_xy.shape[0]
    ox, oy = origin_xy
    xs = ox + (np.arange(width) + 0.5) * pixel_size
    ys = oy - (np.arange(height) + 0.5) * pixel_size
    grid_x, grid_y = np.meshgrid(xs, ys)
    flat_x = grid_x.ravel()
    flat_y = grid_y.ravel()
    out = np.full(flat_x.shape[0], nodata_id, dtype=np.uint32)
    best = np.full(flat_x.shape[0], np.inf, dtype=np.float64)
    chunk = max(1, min(4096, n))
    for start in range(0, n, chunk):
        pts = cell_xy[start : start + chunk]
        dx = flat_x[:, None] - pts[None, :, 0]
        dy = flat_y[:, None] - pts[None, :, 1]
        d2 = dx * dx + dy * dy
        local_min = d2.min(axis=1)
        local_arg = d2.argmin(axis=1)
        improved = local_min < best
        best[improved] = local_min[improved]
        out[improved] = (start + local_arg[improved]).astype(np.uint32)
    if max_distance is not None:
        out[best > max_distance * max_distance] = nodata_id
    return out.reshape(height, width)


def save_cell_index_map(
    index_map: np.ndarray,
    path: str | Path,
    *,
    metadata: dict[str, Any] | None = None,
) -> Path:
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    np.save(path, index_map)
    meta = {"dtype": "uint32", "shape": list(index_map.shape), "nodata_id": int(0xFFFFFFFF), **(metadata or {})}
    path.with_suffix(".json").write_text(json.dumps(meta, indent=2))
    return path
