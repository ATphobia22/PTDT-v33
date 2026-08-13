"""HEC-RAS unstructured 1D WSE coupler. Seal hash excludes seal field."""
from __future__ import annotations

import json
import logging
import time
from hashlib import sha256
from typing import Any

logger = logging.getLogger("PTDT.HECRASUnstructured")

try:
    import h5py
except ImportError:
    h5py = None

try:
    import redis
except ImportError:
    redis = None

TS = (
    "/Results/Unsteady/Output/Output Blocks/Base Output/"
    "Unsteady Time Series/2D Flow Areas"
)


def seal_payload(payload: dict[str, Any]) -> str:
    body = {k: v for k, v in payload.items() if k != "state_cryptographic_seal"}
    raw = json.dumps(body, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return sha256(raw.encode("utf-8")).hexdigest()


def verify_seal(payload: dict[str, Any]) -> bool:
    return payload.get("state_cryptographic_seal") == seal_payload(payload)


class HECRASUnstructuredCoupler:
    def __init__(
        self,
        hdf_plan_file: str,
        redis_url: str = "redis://localhost:6379",
        *,
        units: str = "ft",
        vertical_datum: str = "NAVD88",
        stream_name: str = "ptdt:scene:hydraulics",
    ) -> None:
        if h5py is None or redis is None:
            raise RuntimeError("h5py and redis required")
        self.hdf_plan_file = hdf_plan_file
        self.redis_client = redis.from_url(redis_url, decode_responses=True)
        self.units = units
        self.vertical_datum = vertical_datum
        self.stream_name = stream_name

    def extract_and_broadcast(self, time_index: int, flow_area: str = "2D_TriState") -> dict[str, Any]:
        with h5py.File(self.hdf_plan_file, "r") as h5:
            path = f"{TS}/{flow_area}/Water Surface"
            wse = h5[path][time_index, :]
            wse_scaled = [
                -9999 if (w != w) else int(round(float(w) * 1000.0)) for w in wse
            ]
            payload: dict[str, Any] = {
                "schema_version": 1,
                "sequence": int(time_index),
                "source": "HEC-RAS-2D-Unstructured",
                "flow_area": flow_area,
                "units": self.units,
                "vertical_datum": self.vertical_datum,
                "cell_count": len(wse_scaled),
                "wse_1d_mm": wse_scaled,
                "timestamp_unix": time.time(),
                "gpu_path": "storage_buffer_plus_cell_index_map",
            }
            payload["state_cryptographic_seal"] = seal_payload(payload)
            self.redis_client.xadd(
                self.stream_name,
                {"envelope_json": json.dumps(payload, separators=(",", ":"))},
                maxlen=100,
                approximate=True,
            )
            return payload
