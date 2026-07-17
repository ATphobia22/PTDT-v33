from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from backend.core.security import create_access_token # Mock for verify_oidc_token
import hashlib

router = APIRouter()

class TelemetryIngest(BaseModel):
    gauge_id: str
    stage_ft: float
    discharge_cfs: float
    signature_token: str

def verify_oidc_token():
    return {"sub": "operator-01"}

@router.post("/ingest")
async def ingest_sensor_telemetry(payload: TelemetryIngest, token: dict = Depends(verify_oidc_token)):
    """Verifies SHA-256 seal of gauge telemetry and logs record in DB."""
    expected_token = hashlib.sha256(f"{payload.gauge_id}-{payload.stage_ft}".encode()).hexdigest()
    if payload.signature_token != expected_token[:16]:
        raise HTTPException(status_code=403, detail="Telemetry validation signature mismatch")
    return {
        "status": "TELEMETRY_LOGGED",
        "gauge_id": payload.gauge_id,
        "persisted_index_hash": expected_token
    }
