#!/usr/bin/env python3
"""Official Python client for PTDT sovereign node — zero-key public routes need no Bearer."""
from __future__ import annotations

from typing import Any, Dict, Optional

import httpx


class TuckerClient:
    def __init__(self, base_url: str = "http://localhost:3000", api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key  # optional; not required for /api/health, usgs, federal proxies
        self._client = httpx.Client(timeout=30.0)

    def _headers(self) -> dict:
        h = {"Accept": "application/json"}
        if self.api_key:
            h["Authorization"] = f"Bearer {self.api_key}"
        return h

    def health(self) -> Dict[str, Any]:
        r = self._client.get(f"{self.base_url}/api/health", headers=self._headers())
        r.raise_for_status()
        return r.json()

    def usgs_telemetry(self) -> Dict[str, Any]:
        r = self._client.get(f"{self.base_url}/api/usgs-telemetry", headers=self._headers())
        r.raise_for_status()
        return r.json()

    def run_simulation(self, stage_ft: float, discharge_cfs: float = 0.0) -> Dict[str, Any]:
        r = self._client.post(
            f"{self.base_url}/api/v1/twin/simulate",
            json={"usgs_stage_ft": stage_ft, "discharge_cfs": discharge_cfs},
            headers=self._headers(),
        )
        r.raise_for_status()
        return r.json()

    def nrcs_soil(self, mukey: str = "165191") -> Dict[str, Any]:
        r = self._client.get(
            f"{self.base_url}/api/nrcs-soil",
            params={"mukey": mukey},
            headers=self._headers(),
        )
        r.raise_for_status()
        return r.json()

    def openfema_claims(self, limit: int = 25) -> Dict[str, Any]:
        r = self._client.get(
            f"{self.base_url}/api/openfema-claims",
            params={"limit": limit},
            headers=self._headers(),
        )
        r.raise_for_status()
        return r.json()


if __name__ == "__main__":
    c = TuckerClient()
    print(c.health())
