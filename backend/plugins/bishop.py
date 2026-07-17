import math
from typing import Dict, Any, List
import logging
from backend.plugins.base_openmi_adapter import OpenMIAdapter
from backend.utils.resilience import with_retry_backoff
logger = logging.getLogger("ptdt.openmi.bishop")

class BishopOpenMIAdapter(OpenMIAdapter):
    @property
    def component_id(self) -> str:
        return "BISHOP_SLOPE_v32"
    async def _initialize_impl(self, config: Dict) -> bool:
        self.cohesion_kpa = 14.5
        self.friction_angle_deg = 26.0
        self.unit_weight_kn_m3 = 19.0
        self.slope_angle_deg = 32.0
        self.pore_pressure_kpa = 12.0
        self.water_level_elevation_m = 108.0
        self.slices = [
            {"width": 2.0, "height": 3.2, "pore_pressure": 5.0, "alpha": -12.0},
            {"width": 2.0, "height": 4.5, "pore_pressure": 12.0, "alpha": 2.0},
            {"width": 2.0, "height": 5.8, "pore_pressure": 22.0, "alpha": 18.0},
            {"width": 2.0, "height": 4.8, "pore_pressure": 18.0, "alpha": 32.0},
            {"width": 2.0, "height": 2.5, "pore_pressure": 8.0, "alpha": 48.0}
        ]
        self.factor_of_safety = 1.5
        logger.info(f"[{self.component_id}] Initialized.")
        return True
    @with_retry_backoff(retries=3)
    async def _perform_time_step_impl(self, dt: float) -> Dict[str, Any]:
        fos = 1.5
        tolerance = 0.001
        max_iterations = 40
        phi_rad = math.radians(self.friction_angle_deg)
        new_fos = fos
        for _ in range(max_iterations):
            sum_numerator = 0.0
            sum_denominator = 0.0
            for s in self.slices:
                w = s["width"] * s["height"] * self.unit_weight_kn_m3
                alpha_rad = math.radians(s["alpha"])
                u = s["pore_pressure"] * s["width"]
                m_alpha = math.cos(alpha_rad) + (math.sin(alpha_rad) * math.tan(phi_rad)) / fos
                num = (self.cohesion_kpa * s["width"] + (w - u) * math.tan(phi_rad)) / m_alpha
                den = w * math.sin(alpha_rad)
                sum_numerator += num
                sum_denominator += den
            new_fos = sum_numerator / sum_denominator if sum_denominator != 0 else 0.5
            if abs(new_fos - fos) < tolerance:
                self.factor_of_safety = round(new_fos, 3)
                return {
                    "status": "CONVERGED",
                    "factor_of_safety": self.factor_of_safety,
                    "stable": self.factor_of_safety >= 1.30,
                    "fos": round(new_fos, 4),
                    "failure_imminent": new_fos < 1.0
                }
            fos = new_fos
        self.factor_of_safety = round(fos, 3)
        return {"status": "MAX_ITERATIONS_REACHED", "factor_of_safety": self.factor_of_safety}
    async def _get_values_impl(self, quantity_id: str, element_set_id: str) -> List[float]:
        if quantity_id == "FactorOfSafety":
            return [self.factor_of_safety]
        return []
    async def _set_values_impl(self, quantity_id: str, element_set_id: str, values: List[float]) -> bool:
        if quantity_id == "PoreWaterPressures" and len(values) == len(self.slices):
            for i, val in enumerate(values):
                self.slices[i]["pore_pressure"] = val
            return True
        elif quantity_id == "PorePressure":
            self.pore_pressure_kpa = float(values[0]) if values else 12.0
            return True
        elif quantity_id == "SurfaceWaterLevel":
            self.water_level_elevation_m = float(values[0]) if values else 108.0
            return True
        return False
    async def _finish_impl(self) -> bool:
        return True
