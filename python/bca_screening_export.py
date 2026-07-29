#!/usr/bin/env python3
"""
BCA *screening* JSON export.

Official FEMA BRIC/HMGP BCA must use the FEMA BCA Toolkit with PE/applicant inputs.
Numbers here are placeholders for structure only — mark SCREENING_ONLY.
"""
from __future__ import annotations

import json
from typing import Any, Dict


def build_bca_screening(
    project_cost_usd: float = 0.0,
    losses_avoided_usd: float = 0.0,
    structure_replacement_usd: float = 250000.0,
    contents_usd: float = 125000.0,
) -> Dict[str, Any]:
    bcr = (losses_avoided_usd / project_cost_usd) if project_cost_usd > 0 else 0.0
    return {
        "status": "SCREENING_ONLY",
        "project_id": "PTDT_BCA_SCREENING",
        "project_name": "13101 Bonebank Road resilience screening",
        "calculation_method": "Placeholder ratios — replace with FEMA BCA Toolkit outputs",
        "financial_metrics": {
            "total_project_cost_usd": project_cost_usd,
            "projected_losses_avoided_usd": losses_avoided_usd,
            "benefit_cost_ratio_bcr": round(bcr, 3),
            "structure_replacement_usd": structure_replacement_usd,
            "contents_replacement_usd": contents_usd,
        },
        "grant_stack_allocation": {
            "primary_program": "FEMA BRIC / HMGP (applicant selects)",
            "federal_share_percentage": 75.0,
            "note": "Match and eligibility determined by FEMA process, not this file",
        },
        "elevation_inputs_navd88": {
            "bfe_ft": 375.0,
            "lag_ft": 377.2,
            "clearance_ft": 2.2,
        },
        "disclaimer": (
            "Do not submit this JSON as an official BCA. "
            "Use FEMA BCA Toolkit and PE/cost documentation."
        ),
    }


if __name__ == "__main__":
    print(json.dumps(build_bca_screening(8500000, 20825000), indent=2))
