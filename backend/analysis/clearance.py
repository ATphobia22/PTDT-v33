from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from hashlib import sha256
from typing import Any

import rfc8785


@dataclass(frozen=True, slots=True)
class ClearanceManifest:
    building_id: str
    structural_use: str
    lowest_adjacent_grade_ft: float
    first_floor_elevation_ft: float
    current_water_surface_ft: float
    freeboard_ft: float
    lag_clearance_above_bfe_ft: float
    threat_status: str
    policy_compliance_pass: bool

    def seal(self) -> str:
        return sha256(rfc8785.dumps(asdict(self))).hexdigest()


class StructuralClearanceAnalyzer:
    def __init__(self, *, bfe_navd88_ft: float, required_freeboard_ft: float = 2.2, required_lag_clearance_ft: float = 2.2) -> None:
        if required_freeboard_ft < 0 or required_lag_clearance_ft < 0:
            raise ValueError("clearance thresholds must be non-negative")
        self.bfe_navd88_ft = float(bfe_navd88_ft)
        self.required_freeboard_ft = float(required_freeboard_ft)
        self.required_lag_clearance_ft = float(required_lag_clearance_ft)

    def evaluate(self, building: dict[str, Any], current_wse_navd88_ft: float) -> dict[str, Any]:
        building_id = str(building.get("building_id", "UNKNOWN_NODE"))
        lag = float(building["lowest_adjacent_grade_ft"])
        ffe = float(building["first_floor_elevation_ft"])
        structural_use = str(building.get("structural_use", "unknown"))
        wse = float(current_wse_navd88_ft)
        freeboard = ffe - wse
        lag_clearance = lag - self.bfe_navd88_ft
        lag_policy_pass = lag_clearance >= self.required_lag_clearance_ft
        floor_policy_pass = freeboard >= self.required_freeboard_ft

        if freeboard <= 0.0:
            status = "CRITICAL_FIRST_FLOOR_SUBMERSION"
        elif wse > lag:
            status = "HYDROSTATIC_FOUNDATION_STRESS"
        elif not lag_policy_pass or not floor_policy_pass:
            status = "SUB_STANDARD_FREEBOARD_MARGIN"
        else:
            status = "SECURE_PASS_COMPLIANT"

        manifest = ClearanceManifest(
            building_id=building_id,
            structural_use=structural_use,
            lowest_adjacent_grade_ft=lag,
            first_floor_elevation_ft=ffe,
            current_water_surface_ft=wse,
            freeboard_ft=round(freeboard, 4),
            lag_clearance_above_bfe_ft=round(lag_clearance, 4),
            threat_status=status,
            policy_compliance_pass=status == "SECURE_PASS_COMPLIANT",
        )
        return {
            "manifest_metadata": {
                "execution_timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "cryptographic_manifest_seal": manifest.seal(),
                "authority_basis": "configured_project_policy",
                "required_lag_clearance_ft": self.required_lag_clearance_ft,
                "required_freeboard_ft": self.required_freeboard_ft,
            },
            "compliance_metrics": asdict(manifest),
        }
