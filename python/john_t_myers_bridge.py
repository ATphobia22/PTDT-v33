#!/usr/bin/env python3
"""Real-time bridge for USGS 03322000 / NWS UNWK2 (John T. Myers L&D, Ohio River)."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Dict, Optional

import requests
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PTDT.JohnTMyersBridge")


class JohnTMyersTelemetryPayload(BaseModel):
    station_id: str = Field("03322000")
    nws_lid: str = Field("UNWK2")
    stage_ft: float
    discharge_cfs: float
    timestamp_utc: str
    flood_stage_status: str = Field("NORMAL")


class JohnTMyersTelemetryBridge:
    def __init__(self) -> None:
        self.usgs_endpoint = "https://waterservices.usgs.gov/nwis/iv/"
        self.station_id = "03322000"
        self.action_stage_ft = 33.0
        self.minor_flood_ft = 37.0
        self.moderate_flood_ft = 49.0
        self.major_flood_ft = 60.0

    def _status(self, stage: float) -> str:
        if stage >= self.major_flood_ft:
            return "MAJOR"
        if stage >= self.moderate_flood_ft:
            return "MODERATE"
        if stage >= self.minor_flood_ft:
            return "MINOR"
        if stage >= self.action_stage_ft:
            return "ACTION"
        return "NORMAL"

    def fetch_live_telemetry(self) -> JohnTMyersTelemetryPayload:
        params = {
            "format": "json",
            "sites": self.station_id,
            "parameterCd": "00065,00060",
            "siteStatus": "all",
        }
        response = requests.get(self.usgs_endpoint, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()
        stage = 0.0
        discharge = 0.0
        ts = datetime.now(timezone.utc).isoformat()
        for series in data.get("value", {}).get("timeSeries", []):
            code = series.get("variable", {}).get("variableCode", [{}])[0].get("value")
            values = series.get("values", [{}])[0].get("value", [])
            if not values:
                continue
            latest = values[-1]
            val = float(latest.get("value", 0.0))
            ts = latest.get("dateTime", ts)
            if code == "00065":
                stage = val
            elif code == "00060":
                discharge = val
        return JohnTMyersTelemetryPayload(
            stage_ft=stage,
            discharge_cfs=discharge,
            timestamp_utc=ts,
            flood_stage_status=self._status(stage),
        )


if __name__ == "__main__":
    bridge = JohnTMyersTelemetryBridge()
    try:
        payload = bridge.fetch_live_telemetry()
        print(payload.model_dump_json(indent=2))
    except Exception as exc:
        logger.error("Myers fetch failed: %s", exc)
        raise
