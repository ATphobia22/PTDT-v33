"""PTDT-v33: HEC-RAS HDF → sealed WSE mm + cell_index_map bake.

Rule 1: HEC-RAS is authoritative for hydraulics.
Rule 12: SHA-256 seal on payload.
Rule 14: NAVD88 vertical; EPSG:2966 horizontal preferred.
Soft-fail: never fabricate WSE when HDF/rascmd missing.
"""
from __future__ import annotations

import hashlib
from pathlib import Path
from typing import Any

import numpy as np

try:
    import h5py
except ImportError:  # pragma: no cover
    h5py = None  # type: ignore

try:
    import rasterio
    from rasterio.features import rasterize
    import geopandas as gpd
except ImportError:  # pragma: no cover
    rasterio = None  # type: ignore
    rasterize = None  # type: ignore
    gpd = None  # type: ignore

NODATA_WSE_MM = -9999
NODATA_CELL = 0xFFFFFFFF


class HecRasPipeline:
    def __init__(self, plan_hdf_path: str) -> None:
        self.plan_hdf_path = plan_hdf_path

    def extract_wse_mm(self, flow_area: str, timestep_index: int) -> dict[str, Any]:
        hdf_path = (
            "/Results/Unsteady/Output/Output Blocks/Base Output/"
            f"Unsteady Time Series/2D Flow Areas/{flow_area}/Water Surface"
        )

        if h5py is None:
            return self._soft_fail("h5py not installed")

        path = Path(self.plan_hdf_path)
        if not path.is_file():
            return self._soft_fail(f"HDF missing: {self.plan_hdf_path}")

        try:
            with h5py.File(self.plan_hdf_path, "r") as hdf:
                if hdf_path not in hdf:
                    return self._soft_fail(f"HDF path missing: {hdf_path}")

                wse_dataset = hdf[hdf_path]
                if timestep_index >= wse_dataset.shape[0]:
                    return self._soft_fail("Timestep index out of bounds")

                wse_raw = np.asarray(wse_dataset[timestep_index, :], dtype=np.float64)
                wse_mm = np.where(
                    ~np.isfinite(wse_raw),
                    NODATA_WSE_MM,
                    np.round(wse_raw * 1000.0),
                ).astype(np.int32)

                seal = hashlib.sha256(wse_mm.tobytes()).hexdigest()
                return {
                    "status": "OK",
                    "crs": "EPSG:2966",
                    "vertical_datum": "NAVD88",
                    "timestep": timestep_index,
                    "seal": seal,
                    "data": wse_mm,
                }
        except Exception as exc:  # noqa: BLE001
            return self._soft_fail(f"HDF read error: {exc}")

    def _soft_fail(self, reason: str) -> dict[str, Any]:
        return {
            "status": "SOFT_FAIL_NO_HDF",
            "reason": reason,
            "data": np.array([], dtype=np.int32),
        }

    def generate_cell_index_map(
        self,
        cells_geojson_path: str,
        dem_cog_path: str,
        out_tif_path: str,
    ) -> None:
        if rasterio is None or gpd is None or rasterize is None:
            raise RuntimeError("rasterio/geopandas required for cell_index_map bake")

        with rasterio.open(dem_cog_path) as src:
            dem_meta = src.meta.copy()
            dem_transform = src.transform
            dem_width = src.width
            dem_height = src.height

        cells_gdf = gpd.read_file(cells_geojson_path)
        if cells_gdf.crs is not None and str(cells_gdf.crs).upper() not in (
            "EPSG:2966",
            "2966",
        ):
            cells_gdf = cells_gdf.to_crs("EPSG:2966")

        if "Cell_Index" not in cells_gdf.columns:
            raise ValueError("cells GeoJSON must include Cell_Index integer field")

        shapes = (
            (geom, int(val))
            for geom, val in zip(cells_gdf.geometry, cells_gdf["Cell_Index"], strict=False)
        )

        cell_index_array = rasterize(
            shapes=shapes,
            out_shape=(dem_height, dem_width),
            transform=dem_transform,
            fill=NODATA_CELL,
            dtype="uint32",
            all_touched=False,
        )

        dem_meta.update(
            dtype=rasterio.uint32,
            count=1,
            nodata=NODATA_CELL,
            compress="deflate",
        )

        with rasterio.open(out_tif_path, "w", **dem_meta) as dst:
            dst.write(cell_index_array, 1)


if __name__ == "__main__":
    pipeline = HecRasPipeline("data/ras/PointTownship.p01.hdf")
    state = pipeline.extract_wse_mm(flow_area="Wabash_Confluence", timestep_index=12)
    print(
        f"Hydraulic State Status: {state['status']} | "
        f"Seal: {state.get('seal', 'N/A')} | "
        f"Reason: {state.get('reason', '')}"
    )
