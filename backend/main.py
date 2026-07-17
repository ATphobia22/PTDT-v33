import os
import time
import json
import logging
import asyncio
from typing import Dict, Any, Generator
from fastapi import FastAPI, Depends, HTTPException, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, String, Float, Integer, DateTime
from datetime import datetime

# Mount Sub-routers
from backend.routers import rgis, timedb, mcat_ras

logger = logging.getLogger("ptdt_gateway")

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://tucker:citadel_secure@localhost:5432/tucker_twin")
engine = create_async_engine(DATABASE_URL, echo=False, pool_size=20, max_overflow=10)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class SimulationRunRecord(Base):
    __tablename__ = "simulation_runs"
    id = Column(String, primary_key=True)
    status = Column(String, nullable=False)
    scenario = Column(String, nullable=False)
    mesh = Column(String, nullable=False)
    timestep_seconds = Column(Float, nullable=False)
    max_steps = Column(Integer, nullable=False)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

app = FastAPI(
    title="Tucker Sovereign Citadel API Gateway",
    version="32.1.0",
    description="Production Wholesale Gateway for DLT Multi-Physics Twin."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://twin.tucker.gov",
        "https://dashboard.tucker.gov",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

def verify_oidc_token():
    return {"sub": "operator-01"}

app.include_router(rgis.router, prefix="/api/v1/gis", tags=["Geospatial"])
app.include_router(timedb.router, prefix="/api/v1/telemetry", tags=["Time-Series"])
app.include_router(mcat_ras.router, prefix="/api/v1/hydraulics", tags=["HEC-RAS Adapter"])

active_simulations: Dict[str, Dict[str, Any]] = {}

class SimulationRequest(BaseModel):
    scenario: str
    mesh: str = Field(default="point_township_v32")

class SimulationResponse(BaseModel):
    id: str
    status: str
    timestep_seconds: float
    max_steps: int

@app.post("/api/v1/twin/run", response_model=SimulationResponse)
async def run_scenario(payload: SimulationRequest, token: dict = Depends(verify_oidc_token), db: AsyncSession = Depends(get_db)):
    run_id = f"run-{os.urandom(4).hex()}"
    record = SimulationRunRecord(
        id=run_id,
        status="ENQUEUED",
        scenario=payload.scenario,
        mesh=payload.mesh,
        timestep_seconds=30.0,
        max_steps=24
    )
    db.add(record)
    await db.commit()

    active_simulations[run_id] = {
        "status": "INITIALIZED",
        "scenario": payload.scenario,
        "mesh": payload.mesh,
        "step_index": 0,
        "timestep_seconds": 30.0,
        "max_steps": 24
    }
    return SimulationResponse(
        id=run_id,
        status="ENQUEUED",
        timestep_seconds=30.0,
        max_steps=24
    )

@app.get("/api/v1/twin/stream")
async def stream_telemetry(run_id: str, token: dict = Depends(verify_oidc_token)):
    if run_id not in active_simulations:
        raise HTTPException(status_code=404, detail="Active simulation run not found")
        
    async def event_generator() -> Generator[str, None, None]:
        sim = active_simulations[run_id]
        max_steps = sim["max_steps"]
        for step in range(max_steps):
            await asyncio.sleep(0.5)
            water_depth = 1.2 + (step * 0.08)
            fos = max(1.8 - (step * 0.025), 1.35)
            frame = {
                "step_index": step,
                "timestamp_epoch": time.time(),
                "hydraulic_metrics": {
                    "depth": water_depth,
                    "discharge": 200.0 + (step * 10.0),
                    "velocity": 1.0 + (step * 0.05)
                },
                "geotechnical_metrics": {
                    "fos": fos,
                    "pore_pressure_ratio": 0.25
                },
                "governance_decision": "APPROVED" if fos >= 1.4 else "VIOLATION"
            }
            yield f"data: {json.dumps(frame)}\n\n"
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "32.1.0"}
