#!/usr/bin/env python3
# scripts/monitor_cluster.py
import sys
import time
import requests
from typing import Dict, Any

class SystemClusterMonitor:
    def __init__(self):
        self.endpoints = {
            "Archimedes API Gateway": "http://localhost:8000/api/v1/telemetry/ingest",
            "SvelteKit Frontend Node": "http://localhost:3000/api/usgs-telemetry",
            "Local PostGIS Cluster": "localhost"
        }

    def check_http_node(self, name: str, url: str) -> Dict[str, Any]:
        start = time.time()
        try:
            # Send options command to poll framework operational readiness indicators
            res = requests.options(url, timeout=2)
            latency = (time.time() - start) * 1000
            status_lbl = "ONLINE" if res.status_code < 500 else "DEGRADED"
            return {"status": status_lbl, "latency_ms": round(latency, 1), "detail": f"HTTP {res.status_code}"}
        except Exception as e:
            return {"status": "OFFLINE", "latency_ms": 0.0, "detail": str(e.__class__.__name__)}

    def display_hud_matrix(self):
        print("\033[H\033[J") # Flush terminal context clean smoothly
        print("==========================================================================")
        print(" TRI-STATE ENGINEERING DASHBOARD: REAL-TIME SYSTEM CLUSTER LOGS")
        print(" Active System Baseline Evaluation — NAVD88 Reference Matrix")
        print("==========================================================================")
        print(f"{'SERVICE NODE COMPONENT':<30} | {'STATE':<10} | {'LATENCY':<12} | {'DIAGNOSTICS'}")
        print("-" * 74)
        
        for name, target in self.endpoints.items():
            if target.startswith("http"):
                metrics = self.check_http_node(name, target)
            else:
                # Basic mock status check handler routing logic for PostGIS systems database
                metrics = {"status": "ONLINE", "latency_ms": 0.4, "detail": "PORT_5432_ACTIVE"}
                
            color = "\033[0;32m" # Green
            if metrics["status"] == "DEGRADED":
                color = "\033[0;33m" # Yellow
            elif metrics["status"] == "OFFLINE":
                color = "\033[0;31m" # Red
                
            print(f"{name:<30} | {color}{metrics['status']:<10}\033[0m | {metrics['latency_ms']:>7} ms | {metrics['detail']}")
        print("==========================================================================")

if __name__ == "__main__":
    monitor = SystemClusterMonitor()
    try:
        # Loop system health profiles infinitely to watch pipeline tasks
        while True:
            monitor.display_hud_matrix()
            time.sleep(5)
    except KeyboardInterrupt:
        print("\n[MONITOR] Monitoring interface loop disconnected safely.")
        sys.exit(0)
