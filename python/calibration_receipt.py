#!/usr/bin/env python3
"""
Calibration error receipt vs observed USGS stage.

Project gate: document relative error. This is NOT a court determination under FRE 702.
"""
from __future__ import annotations

import datetime as dt
import hashlib
import json
from dataclasses import asdict, dataclass
from typing import Any, Dict


@dataclass(frozen=True)
class CalibrationReceipt:
    methodology: str
    peer_reviewed_solver_reference: str
    observed_stage_ft: float
    modeled_stage_ft: float
    error_rate_percentage: float
    project_error_gate_pct: float
    within_project_gate: bool
    content_sha256: str
    note: str


def relative_error_pct(observed: float, modeled: float) -> float:
    if observed == 0:
        return 0.0
    return round(abs(modeled - observed) / abs(observed) * 100.0, 4)


def generate_calibration_receipt(
    observed_stage_ft: float,
    modeled_stage_ft: float,
    project_error_gate_pct: float = 5.0,
) -> CalibrationReceipt:
    err = relative_error_pct(observed_stage_ft, modeled_stage_ft)
    payload = {
        "node": "13101_BONEBANK_RD",
        "datum": "NAVD88",
        "observed_stage_ft": observed_stage_ft,
        "modeled_stage_ft": modeled_stage_ft,
        "error_rate_pct": err,
        "timestamp": dt.datetime.now(dt.timezone.utc).isoformat(),
    }
    sha = hashlib.sha256(json.dumps(payload, sort_keys=True).encode()).hexdigest()
    return CalibrationReceipt(
        methodology="Project screening / optional HEC-RAS 2D comparison",
        peer_reviewed_solver_reference="USACE HEC-RAS (when model-of-record is used)",
        observed_stage_ft=observed_stage_ft,
        modeled_stage_ft=modeled_stage_ft,
        error_rate_percentage=err,
        project_error_gate_pct=project_error_gate_pct,
        within_project_gate=err < project_error_gate_pct,
        content_sha256=sha,
        note=(
            "within_project_gate is an internal QA threshold only; "
            "it does not constitute Daubert admissibility or agency approval."
        ),
    )


def as_dict(observed: float, modeled: float) -> Dict[str, Any]:
    return asdict(generate_calibration_receipt(observed, modeled))


if __name__ == "__main__":
    print(json.dumps(as_dict(20.0, 20.4), indent=2))
