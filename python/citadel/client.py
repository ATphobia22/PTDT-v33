import time
import json
import requests
from typing import Generator
from citadel.models import SimulationRun, EvidencePackage, HydraulicMetrics

class CitadelClientError(Exception):
    pass

class CitadelClient:
    def __init__(self, base_url: str, api_key: str, max_retries: int = 5):
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        self.max_retries = max_retries

    def _request(self, method: str, path: str, json_data: dict = None) -> dict:
        url = f"{self.base_url}{path}"
        backoff = 0.5
        for attempt in range(self.max_retries):
            try:
                response = requests.request(method, url, headers=self.headers, json=json_data)
                if response.status_code == 200:
                    return response.json()
                if response.status_code not in [500, 502, 503, 504]:
                    raise CitadelClientError(f"HTTP Error {response.status_code}: {response.text}")
            except requests.exceptions.RequestException as e:
                if attempt == self.max_retries - 1:
                    raise CitadelClientError(f"Failed to connect to PTDT Gateway: {str(e)}")
            time.sleep(backoff)
            backoff *= 2
        raise CitadelClientError("Request timed out over retry backoff matrix.")

    def run_scenario(self, scenario: str, mesh: str = "point_township_v32") -> SimulationRun:
        payload = {"scenario": scenario, "mesh": mesh}
        res = self._request("POST", "/api/v1/twin/run", json_data=payload)
        return SimulationRun(**res)

    def generate_package(self, run_id: str) -> EvidencePackage:
        res = self._request("POST", f"/api/v1/evidence/package/{run_id}")
        return EvidencePackage(**res)

    def stream_telemetry(self, run_id: str) -> Generator[dict, None, None]:
        url = f"{self.base_url}/api/v1/twin/stream?run_id={run_id}"
        response = requests.get(url, headers={"Authorization": self.headers["Authorization"]}, stream=True)
        if response.status_code != 200:
            raise CitadelClientError(f"Failed to establish telemetry stream: {response.text}")
        for line in response.iter_lines():
            if line:
                decoded_line = line.decode('utf-8')
                if decoded_line.startswith("data:"):
                    yield json.loads(decoded_line[5:])
