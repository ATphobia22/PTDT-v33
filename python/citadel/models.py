from dataclasses import dataclass, field
from typing import List, Optional

@dataclass(frozen=True)
class HydraulicMetrics:
    surface_discharge_cms: float
    water_depth_m: float
    velocity_ms: float

@dataclass(frozen=True)
class GroundwaterMetrics:
    phreatic_head_m: float
    pore_pressure_kpa: float

@dataclass(frozen=True)
class GeotechnicalMetrics:
    factor_of_safety: float
    pore_water_pressure_ratio: float

@dataclass(frozen=True)
class SimulationRun:
    id: str
    status: str
    timestep_seconds: float
    max_steps: int

@dataclass(frozen=True)
class EvidencePackage:
    run_id: str
    timestamp_utc: str
    canonical_hash_sha256: str
    ecdsa_signature_der: str
    signer_public_key: str
    statutory_decision: str
