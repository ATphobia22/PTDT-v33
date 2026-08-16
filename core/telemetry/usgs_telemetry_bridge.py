from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

import requests


class StateDataHarvestBridge:
    """Live USGS NWIS instantaneous-value bridge.

    The station used by the John T. Myers endpoint must be explicitly configured
    with PTDT_MYERS_USGS_STATION; no station identity is guessed.
    """

    def __init__(self, timeout_s: float = 10.0) -> None:
        self.timeout_s = timeout_s
        self.station_id = os.environ.get("PTDT_MYERS_USGS_STATION")
        self.base_url = "https://waterservices.usgs.gov/nwis/iv/"

    def _fetch_stage(self, station_id: str) -> float:
        response = requests.get(
            self.base_url,
            params={"format": "json", "sites": station_id, "parameterCd": "00065", "siteStatus": "all"},
            timeout=self.timeout_s,
        )
        response.raise_for_status()
        series = response.json()["value"]["timeSeries"]
        if not series:
            raise LookupError(f"USGS station {station_id} returned no stage series")
        values = series[0]["values"][0]["value"]
        if not values:
            raise LookupError(f"USGS station {station_id} returned no observations")
        return float(values[-1]["value"])

    def fetch_john_t_myers(self) -> dict[str, Any]:
        if not self.station_id:
            raise RuntimeError("PTDT_MYERS_USGS_STATION is required; station identity must be authoritative")
        stage = self._fetch_stage(self.station_id)
        return {
            "station": self.station_id,
            "stage_ft": stage,
            "observed_utc": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
            "source": "USGS NWIS instantaneous values",
            "datum": "station-reported; verify vertical datum before engineering use",
        }

    def fetch_usgs_river_stage(self, station_id: str) -> float:
        if not station_id.isdigit():
            raise ValueError("USGS station_id must be numeric")
        return self._fetch_stage(station_id)
