from typing import Dict, Any, List

class FEMAHazusComplianceEngine:
    """
    FEMA Hazus-MH spatial flood hazard loss and structural compliance engine.
    Computes flood safety index margins based on simulated depths and IDNR levee structural thresholds.
    """
    def __init__(self, target_county: str = "Posey"):
        self.target_county = target_county
        self.hazus_depth_threshold_ft = 12.0  # FEMA warning threshold
        
    def evaluate_scenario_compliance(self, sim_record: Dict[str, Any]) -> Dict[str, Any]:
        """Evaluates a hydraulic simulation run against FEMA regulatory compliance models."""
        peak_depth_ft = sim_record.get("peak_water_depth_ft", 0.0)
        max_vel_fps = sim_record.get("max_velocity_fps", 0.0)
        
        # Calculate dynamic Hydrodynamic Risk Factor (Depth * Velocity)
        risk_factor = peak_depth_ft * max_vel_fps
        
        # Determine hazard safety bounds
        if peak_depth_ft <= 6.0:
            rating = "LOW_RISK"
            score_multiplier = 1.0
        elif peak_depth_ft < self.hazus_depth_threshold_ft:
            rating = "MODERATE_RISK"
            score_multiplier = 0.85
        else:
            rating = "CRITICAL_HAZARD"
            score_multiplier = 0.40
            
        # Compute compliance safety margin
        safety_margin_ft = self.hazus_depth_threshold_ft - peak_depth_ft
        is_compliant = bool(safety_margin_ft > 0.0)
        
        # Final safety index out of 100
        safety_score = max(0.0, min(100.0, (1.0 - (peak_depth_ft / 18.0)) * 100.0 * score_multiplier))
        
        return {
            "scenario_name": sim_record.get("scenario_name", "Unknown Scenario"),
            "is_compliant": is_compliant,
            "safety_margin_ft": float(f"{safety_margin_ft:.4f}"),
            "hazard_classification": rating,
            "hydrodynamic_risk_factor": float(f"{risk_factor:.2f}"),
            "safety_score_percentage": float(f"{safety_score:.1f}"),
            "mitigation_required": not is_compliant
        }
        
    def aggregate_regional_score(self, evaluation_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Aggregates multiple simulated scenarios into a comprehensive county safety portfolio."""
        if not evaluation_list:
            return {
                "overall_regional_score": 100.0,
                "status": "SECURE",
                "total_runs": 0,
                "actionable_breaches": 0
            }
            
        total_runs = len(evaluation_list)
        compliant_runs = sum(1 for e in evaluation_list if e["is_compliant"])
        total_score = sum(e["safety_score_percentage"] for e in evaluation_list)
        
        mean_score = total_score / total_runs
        breaches = total_runs - compliant_runs
        
        if breaches == 0:
            status = "FULLY_COMPLIANT"
        elif breaches <= 1:
            status = "WARNING_STANDBY"
        else:
            status = "ACTION_REQUIRED"
            
        return {
            "overall_regional_score": float(f"{mean_score:.1f}"),
            "status": status,
            "total_runs": total_runs,
            "actionable_breaches": breaches,
            "safety_rating_tier": "TIER_1_TRI_STATE" if mean_score >= 90.0 else "TIER_2_STABILIZED"
        }
