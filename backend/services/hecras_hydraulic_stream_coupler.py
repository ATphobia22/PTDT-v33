"""PTDT-v33: HEC-RAS 2D Hydraulic Stream Coupler.

Extracts cell WSE from plan HDF5, seals payload, XADDs to Redis.
Face Velocity is per-face — not cell velocity. Mesh is unstructured.
"""
from __future__ import annotations

import json
import logging
import time
from hashlib import sha256
from typing import Any

logger = logging.getLogger("PTDT.HECRASCoupler")

try:
    import h5py
except ImportError:  # pragma: no cover
    h5py = None

try:
    import redis
except ImportError:  # pragma: no cover
    redis = None

TS_BASE = (
    "/Results/Unsteady/Output/Output Blocks/Base Output/"
    "Unsteady Time Series/2D Flow Areas"
)


class HECRASHydraulicCoupler:
    def __init__(
        self,
        hdf_plan_file: str,
        redis_url: str = "redis://localhost:6379",
        *,
        vertical_datum: str = "NAVD88",
        units: str = "ft",
        stream_name: str = "ptdt:scene:hydraulics",
        schema_version: int = 1,
    ) -> None:
        if h5py is None:
            raise RuntimeError("h5py required for HEC-RAS HDF5 coupling")
        if redis is None:
            raise RuntimeError("redis package required for stream broadcast")
        self.hdf_plan_file = hdf_plan_file
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.stream_name = stream_name
        self.schema_version = schema_version
        self.vertical_datum = vertical_datum
        self.units = units

    @staticmethod
    def _compute_seal(payload: dict[str, Any]) -> str:
        body = {k: v for k, v in payload.items() if k != "state_cryptographic_seal"}
        raw = json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
        return sha256(raw.encode("utf-8")).hexdigest()

    def list_flow_areas(self) -> list[str]:
        with h5py.File(self.hdf_plan_file, "r") as h5:
            if TS_BASE not in h5:
                return []
            return list(h5[TS_BASE].keys())

    def extract_and_broadcast_timestep(
        self,
        time_index: int,
        flow_area_name: str,
        *,
        include_face_velocity_note: bool = True,
    ) -> dict[str, Any]:
        with h5py.File(self.hdf_plan_file, "r") as h5:
            base = f"{TS_BASE}/{flow_area_name}"
            if base not in h5:
                raise KeyError(
                    f"Flow area {flow_area_name!r} not in HDF5. Available: {self.list_flow_areas()}"
                )
            wse_path = f"{base}/Water Surface"
            if wse_path not in h5:
                raise KeyError(f"Missing dataset {wse_path}")
            wse_ds = h5[wse_path]
            if time_index < 0 or time_index >= wse_ds.shape[0]:
                raise IndexError(
                    f"time_index {time_index} out of range [0, {wse_ds.shape[0]})"
                )
            wse = wse_ds[time_index, :]
            wse_milli: list[int] = []
            dry = 0
            for w in wse:
                if w != w:
                    wse_milli.append(-9999)
                    dry += 1
                else:
                    wse_milli.append(int(round(float(w) * 1000.0)))
            face_vel_present = f"{base}/Face Velocity" in h5
            cell_count = int(wse_ds.shape[1])
            payload: dict[str, Any] = {
                "schema_version": self.schema_version,
                "sequence": int(time_index),
                "source": "HEC-RAS-2D",
                "flow_area": flow_area_name,
                "vertical_datum": self.vertical_datum,
                "units": self.units,
                "cell_count": cell_count,
                "wse_milli": wse_milli,
                "dry_cell_count": dry,
                "mesh_topology": "unstructured",
                "raster_note": (
                    "Cell WSE is 1D unstructured. Do not writeTexture as WxH without "
                    "cell-center rasterization or use storage buffer + cell index attrs."
                ),
                "timestamp_unix": time.time(),
            }
            if include_face_velocity_note:
                payload["face_velocity_present"] = face_vel_present
                payload["face_velocity_note"] = (
                    "Face Velocity is face-normal series (time×face), not cell velocity."
                )
            payload["state_cryptographic_seal"] = self._compute_seal(payload)
            self.redis_client.xadd(
                self.stream_name,
                {"envelope_json": json.dumps(payload, separators=(",", ":"))},
                maxlen=100,
                approximate=True,
            )
            logger.info(
                "Broadcast HEC-RAS t=%s area=%s cells=%s dry=%s",
                time_index,
                flow_area_name,
                cell_count,
                dry,
            )
            return payload


def verify_hydraulic_seal(payload: dict[str, Any]) -> bool:
    expected = HECRASHydraulicCoupler._compute_seal(payload)
    return expected == payload.get("state_cryptographic_seal")
