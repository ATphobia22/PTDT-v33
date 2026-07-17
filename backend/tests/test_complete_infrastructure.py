import pytest
from fastapi.testclient import TestClient
from backend.main import app
import hashlib

client = TestClient(app)
auth_headers = {"Authorization": "Bearer citadel_token_sec_6b19a06d_f09c"}

def test_api_gateway_handshake():
    response = client.get("/health")
    assert response.status_code == 200

def test_run_scenario_execution():
    response = client.post(
        "/api/v1/twin/run",
        json={"scenario": "100-year-flood", "mesh": "point_township_v32"},
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"].startswith("run-")
    assert data["status"] == "RUNNING"

def test_telemetry_pipeline_ingest():
    payload_hash = hashlib.sha256(b"USGS_03377500-15.5").hexdigest()[:16]
    response = client.post(
        "/api/v1/telemetry/ingest",
        json={
            "gauge_id": "USGS_03377500",
            "stage_ft": 15.5,
            "discharge_cfs": 4200.0,
            "signature_token": payload_hash
        },
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["status"] == "TELEMETRY_LOGGED"

def test_gis_mesh_intersection_cleanup():
    response = client.get(
        "/api/v1/gis/validate-mesh-intersection",
        params={"wkt_polygon": "POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))"},
        headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["geometry_status"] == "VALIDATED_AND_REPAIRED"
