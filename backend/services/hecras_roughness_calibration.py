"""
Orchestrate HEC-RAS roughness calibration workflow.

Native RAS 'Automated Roughness Calibration' still requires the GUI/engine;
this module prepares inputs, invokes rascmd when present, and scores
computed vs observed stages for factor updates (external loop).
"""
from __future__ import annotations

import json
import math
from dataclasses import dataclass, field, asdict
from pathlib import Path
from typing import Optional

from backend.services.hecras_rascmd import run_rascmd_compute, RasCmdResult


@dataclass
class StageObservation:
    station_id: str
    time_hours: list[float]
    stage_ft: list[float]


@dataclass
class FlowRoughnessZone:
    flow_cfs: float
    factor: float = 1.0


@dataclass
class CalibrationReach:
    name: str
    base_n_channel: float
    base_n_overbank: float
    zones: list[FlowRoughnessZone] = field(default_factory=list)
    observation: Optional[StageObservation] = None


@dataclass
class CalibrationPlan:
    project_path: str
    reaches: list[CalibrationReach]
    mode: str = "sequential"  # sequential | global
    rmse_tolerance_ft: float = 0.25
    max_iterations: int = 20
    seed_n_floodplain: float = 0.045


@dataclass(frozen=True)
class CalibrationScore:
    reach: str
    rmse_ft: float
    n_points: int
    status: str


def rmse(computed: list[float], observed: list[float]) -> float:
    if not computed or not observed or len(computed) != len(observed):
        return float("inf")
    err = [(c - o) ** 2 for c, o in zip(computed, observed)]
    return math.sqrt(sum(err) / len(err))


def score_reach(reach: str, computed_stages: list[float], observed: StageObservation) -> CalibrationScore:
    r = rmse(computed_stages, observed.stage_ft)
    status = "OK" if r <= 0.25 else "NEEDS_ADJUST"
    return CalibrationScore(reach=reach, rmse_ft=round(r, 4), n_points=len(observed.stage_ft), status=status)


def effective_n(base_n: float, factor: float) -> float:
    return base_n * factor


def suggest_factor_update(
    current_factor: float,
    computed_peak_ft: float,
    observed_peak_ft: float,
    *,
    gain: float = 0.15,
    min_factor: float = 0.5,
    max_factor: float = 2.0,
) -> float:
    """
    Heuristic: if computed WS too high, reduce n factor; if too low, increase.
    Native RAS optimizer supersedes this when available inside the engine.
    """
    delta = computed_peak_ft - observed_peak_ft
    # Higher n → higher WS in backwater-dominated reaches (sign convention)
    new_f = current_factor * (1.0 + gain * math.tanh(delta))
    return max(min_factor, min(max_factor, new_f))


def export_plan_json(plan: CalibrationPlan, path: str | Path) -> Path:
    p = Path(path)
    payload = {
        "project_path": plan.project_path,
        "mode": plan.mode,
        "rmse_tolerance_ft": plan.rmse_tolerance_ft,
        "max_iterations": plan.max_iterations,
        "seed_n_floodplain": plan.seed_n_floodplain,
        "reaches": [
            {
                "name": r.name,
                "base_n_channel": r.base_n_channel,
                "base_n_overbank": r.base_n_overbank,
                "zones": [asdict(z) for z in r.zones],
                "observation": asdict(r.observation) if r.observation else None,
            }
            for r in plan.reaches
        ],
    }
    p.write_text(json.dumps(payload, indent=2))
    return p


def run_calibration_iteration(plan: CalibrationPlan) -> dict:
    """
    One outer iteration: soft-fail RAS compute + return status envelope.
    Does not invent hydrographs — caller supplies computed stages for scoring.
    """
    ras: RasCmdResult = run_rascmd_compute(plan.project_path, silent=True)
    return {
        "ras": asdict(ras),
        "mode": plan.mode,
        "note": (
            "If ras.status == SKIPPED, use RAS Mapper Automated Roughness Calibration "
            "or supply computed stage series externally for suggest_factor_update."
        ),
        "seed_n_floodplain": plan.seed_n_floodplain,
    }


def bonebank_default_plan(project_path: str = "") -> CalibrationPlan:
    """Seed plan for Point Township / Wabash calibration narrative."""
    return CalibrationPlan(
        project_path=project_path or "models/hecras/bonebank.prj",
        mode="sequential",
        seed_n_floodplain=0.045,
        reaches=[
            CalibrationReach(
                name="Wabash_NewHarmony_approach",
                base_n_channel=0.035,
                base_n_overbank=0.045,
                zones=[
                    FlowRoughnessZone(flow_cfs=5000, factor=1.0),
                    FlowRoughnessZone(flow_cfs=25000, factor=1.0),
                    FlowRoughnessZone(flow_cfs=80000, factor=1.0),
                ],
            )
        ],
    )
