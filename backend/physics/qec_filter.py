# backend/physics/qec_filter.py
"""Telemetry quality gate — classical only (no quantum / stim / pymatching).

Previous experimental QEC surface-code path was removed as non-physical for USGS hydrology.
"""
from __future__ import annotations

from typing import Any, Dict, Optional


def decode_sensor_noise(
    observed_stage_ft: Optional[float] = None,
    prior_stage_ft: Optional[float] = None,
    max_jump_ft: float = 5.0,
) -> Dict[str, Any]:
    """Simple classical QC for stage spikes before DAG ingest."""
    if observed_stage_ft is None:
        return {
            "status": "NO_OBSERVATION",
            "method": "classical_spike_gate",
            "note": "No stage provided; skip QC.",
        }
    if prior_stage_ft is None:
        return {
            "status": "ACCEPTED_FIRST",
            "observed_stage_ft": observed_stage_ft,
            "method": "classical_spike_gate",
        }
    jump = abs(observed_stage_ft - prior_stage_ft)
    ok = jump <= max_jump_ft
    return {
        "status": "ACCEPTED" if ok else "FLAGGED_SPIKE",
        "observed_stage_ft": observed_stage_ft,
        "prior_stage_ft": prior_stage_ft,
        "jump_ft": round(jump, 3),
        "max_jump_ft": max_jump_ft,
        "method": "classical_spike_gate",
        "note": "Not a substitute for USGS published QC flags.",
    }
