#!/usr/bin/env python3
"""
Live USGS NWIS bridge for Ohio River at J.T. Myers L&D (03322000 / NWS UNWK2).

Flood category thresholds from published NWS/river-stage references (verify against
water.noaa.gov/gauges/unwk2 before operational alerting).
"""
from __future__ import annotations

import datetime as dt
import json
import logging
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass
from typing import Any, Dict, Optional

logger = logging.getLogger("PTDT.JohnTMyers")


@dataclass
class JohnTMyersTelemetryPayload:
    station_id: str
    nws_lid: str
    stage_ft: float
    discharge_cfs: float
    timestamp_utc: str
    flood_stage_status: str
    source: str = "usgs_nwis_iv"


class JohnTMyersTelemetryBridge:
    def __init__(self) -> None:
        self.usgs_endpoint = "https://waterservices.usgs.gov/nwis/iv/"
        self.station_id = "03322000"
        # Published category stages (ft) for UNWK2 — confirm on NWS AHPS before alerts
        self.action_stage_ft = 33.0
        self.minor_flood_ft = 37.0
        self.moderate_flood_ft = 49.0
        self.major_flood_ft = 60.0

    def _classify(self, stage_ft: float) -> str:
        if stage_ft >= self.major_flood_ft:
            return "MAJOR_FLOOD"
        if stage_ft >= self.moderate_flood_ft:
            return "MODERATE_FLOOD"
        if stage_ft >= self.minor_flood_ft:
            return "MINOR_FLOOD"
        if stage_ft >= self.action_stage_ft:
            return "ACTION_STAGE"
        return "NORMAL"

    def fetch_live_telemetry(self, timeout: float = 12.0) -> JohnTMyersTelemetryPayload:
        params = {
            "format": "json",
            "sites": self.station_id,
            "parameterCd": "00065,00060",
            "siteStatus": "all",
        }
        url = self.usgs_endpoint + "?" + urllib.parse.urlencode(params)
        try:
            with urllib.request.urlopen(url, timeout=timeout) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            stage_ft: Optional[float] = None
            discharge_cfs: Optional[float] = None
            for ts in data.get("value", {}).get("timeSeries", []):
                code = ts["variable"]["variableCode"][0]["value"]
                values = ts["values"][0]["value"]
                if not values:
                    continue
                latest = float(values[-1]["value"])
                if code == "00065":
                    stage_ft = latest
                elif code == "00060":
                    discharge_cfs = latest
            if stage_ft is None:
                raise ValueError("No gage height (00065) in NWIS response")
            if discharge_cfs is None:
                discharge_cfs = float("nan")
            payload = JohnTMyersTelemetryPayload(
                station_id=self.station_id,
                nws_lid="UNWK2",
                stage_ft=round(stage_ft, 2),
                discharge_cfs=round(discharge_cfs, 1) if discharge_cfs == discharge_cfs else -1.0,
                timestamp_utc=dt.datetime.now(dt.timezone.utc).isoformat(),
                flood_stage_status=self._classify(stage_ft),
                source="usgs_nwis_iv",
            )
            logger.info(
                "USGS %s stage=%.2f ft status=%s",
                self.station_id,
                payload.stage_ft,
                payload.flood_stage_status,
            )
            return payload
        except Exception as e:
            logger.error("USGS fetch failed: %s", e)
            # Explicit fallback — never silently claim live data
            return JohnTMyersTelemetryPayload(
                station_id=self.station_id,
                nws_lid="UNWK2",
                stage_ft=33.5,
                discharge_cfs=115000.0,
                timestamp_utc=dt.datetime.now(dt.timezone.utc).isoformat(),
                flood_stage_status="FALLBACK_NOT_LIVE",
                source="offline_fallback",
            )

    def as_dict(self) -> Dict[str, Any]:
        return asdict(self.fetch_live_telemetry())


if __name__ == "__main__":
    print(json.dumps(JohnTMyersTelemetryBridge().as_dict(), indent=2))
