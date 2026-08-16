from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class TriStateComplianceState:
    state: str
    stage_ft: float
    bfe_ft: float
    modeled_rise_ft: float
    max_allowable_rise_ft: float
    reason: str


class TriStateLegalComplianceGovernor:
    """Deterministic project-policy evaluator; not a substitute for legal advice or agency review."""

    def __init__(self, bfe_ft: float = 375.0, max_allowable_rise_ft: float = 0.14) -> None:
        self.bfe_ft = float(bfe_ft)
        self.max_allowable_rise_ft = float(max_allowable_rise_ft)

    def evaluate_tri_state_compliance(self, hydraulic_state: Any, stage_ft: float) -> TriStateComplianceState:
        modeled_rise = max(0.0, float(stage_ft) - self.bfe_ft)
        if modeled_rise <= self.max_allowable_rise_ft:
            state, reason = "PASS", "modeled rise is within configured project threshold"
        elif modeled_rise <= self.max_allowable_rise_ft * 2.0:
            state, reason = "CONDITIONAL", "modeled rise exceeds configured threshold and requires engineering review"
        else:
            state, reason = "FAIL", "modeled rise materially exceeds configured threshold"
        return TriStateComplianceState(state, float(stage_ft), self.bfe_ft, modeled_rise, self.max_allowable_rise_ft, reason)

    @staticmethod
    def to_api_dict(state: TriStateComplianceState) -> dict[str, Any]:
        return asdict(state)
