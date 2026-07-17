import logging
from typing import Dict, Any, List

logger = logging.getLogger("ptdt.cognitive.router")

class CapitalAllocationRouter:
    def __init__(self, baseline_resilience_pool_usd: float = 5000000.0):
        self.capital_pool = baseline_resilience_pool_usd

    def optimize_allocations(self, vulnerability_profiles: List[Dict[str, Any]]) -> Dict[str, Any]:
        total_risk_weight = 0.0
        for p in vulnerability_profiles:
            raw_liability = p.get("liability_usd", 100000.0)
            freeboard_deficiency = max(0.1, 2.0 - p.get("freeboard_clearance_ft", 2.0))
            p["calculated_risk_weight"] = raw_liability * freeboard_deficiency
            total_risk_weight += p["calculated_risk_weight"]
        allocations = {}
        for p in vulnerability_profiles:
            project_id = p["project_id"]
            if total_risk_weight > 0:
                fraction = p["calculated_risk_weight"] / total_risk_weight
                apportioned_amount = self.capital_pool * fraction
            else:
                apportioned_amount = 0.0
            allocations[project_id] = {
                "match_funding_awarded_usd": round(apportioned_amount, 2),
                "leverage_ratio": round(apportioned_amount / max(1.0, p.get("local_match_available_usd", 1.0)), 2)
            }
        return {
            "total_capital_pool_routed": self.capital_pool,
            "project_funding_allocations": allocations
        }
