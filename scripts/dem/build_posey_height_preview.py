#!/usr/bin/env python3
"""Build a normalized RGBA8 DEM preview for the PTDT WebGPU ray marcher.

Inputs may be a local GeoTIFF/COG or HDF5 dataset. PDAL is used as an optional
point-cloud preprocessing path; no proprietary service/API is required.

Examples:
  python scripts/dem/build_posey_height_preview.py data/posey_dem.tif public/tiles/posey_height_preview.png
  python scripts/dem/build_posey_height_preview.py data/posey_dem.h5 public/tiles/posey_height_preview.png --dataset /elevation
"""
from __future__ import annotations

import argparse
from pathlib import Path
import numpy as np
from PIL import Image


def read_raster(path: Path, dataset: str | None) -> np.ndarray:
    suffix = path.suffix.lower()
    if suffix in {'.h5', '.hdf5'}:
        import h5py
        with h5py.File(path, 'r') as f:
            if dataset:
                return np.asarray(f[dataset])
            candidates: list[str] = []
            def visitor(name: str, obj) -> None:
                if isinstance(obj, h5py.Dataset) and obj.ndim >= 2:
                    candidates.append(name)
            f.visititems(visitor)
            if not candidates:
                raise RuntimeError('No 2-D HDF5 dataset found; pass --dataset explicitly.')
            return np.asarray(f[candidates[0]])

    try:
        import rasterio
    except ImportError as exc:
        raise RuntimeError('COG/GeoTIFF input requires rasterio; HDF5 input requires h5py.') from exc

    with rasterio.open(path) as src:
        data = src.read(1, masked=True)
        return np.asarray(data.filled(np.nan), dtype=np.float32)


def normalize(arr: np.ndarray, nodata_value: float | None) -> np.ndarray:
    a = np.asarray(arr, dtype=np.float32)
    if nodata_value is not None:
        a = np.where(a == nodata_value, np.nan, a)
    finite = np.isfinite(a)
    if not finite.any():
        raise RuntimeError('DEM contains no finite elevation samples.')
    lo, hi = np.nanpercentile(a, [0.5, 99.5])
    hi = max(hi, lo + 1e-6)
    a = np.clip(a, lo, hi)
    return np.nan_to_num((a - lo) / (hi - lo), nan=0.0)


def resize(arr: np.ndarray, width: int, height: int) -> np.ndarray:
    image = Image.fromarray(np.uint8(np.clip(arr, 0, 1) * 255), mode='L')
    image = image.resize((width, height), Image.Resampling.LANCZOS)
    return np.asarray(image, dtype=np.uint8)


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument('input', type=Path)
    p.add_argument('output', type=Path)
    p.add_argument('--dataset', help='HDF5 dataset path, e.g. /elevation')
    p.add_argument('--width', type=int, default=2048)
    p.add_argument('--height', type=int, default=2048)
    p.add_argument('--nodata', type=float, default=None)
    args = p.parse_args()

    elevation = read_raster(args.input, args.dataset)
    normalized = normalize(elevation, args.nodata)
    gray = resize(normalized, args.width, args.height)

    rgba = np.empty((args.height, args.width, 4), dtype=np.uint8)
    rgba[..., 0] = gray
    rgba[..., 1] = gray
    rgba[..., 2] = gray
    rgba[..., 3] = 255

    args.output.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, mode='RGBA').save(args.output, format='PNG', optimize=True)
    print(f'Wrote {args.output} ({args.width}x{args.height})')
    print(f'Input: {args.input}')
    print('Note: normalization is visualization-only; preserve original COG/HDF5 for quantitative engineering work.')


if __name__ == '__main__':
    main()
