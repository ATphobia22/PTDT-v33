import logging
from typing import Dict, Any, List
from backend.plugins.base_openmi_adapter import OpenMIAdapter
from backend.utils.resilience import with_retry_backoff
logger = logging.getLogger("ptdt.openmi.hecras")

class HecRasOpenMIAdapter(OpenMIAdapter):
    @property
    def component_id(self) -> str:
        return "HEC_RAS_2D_v32"
    async def _initialize_impl(self, config: Dict) -> bool:
        self.config_path = config.get("config_path", "")
        self.channel_roughness_manning_n = 0.035
        self.inflow_rate_cms = [150.0]
        self.cross_sections_count = 12
        self.water_levels = [104.0 + (i * 0.25) for i in range(self.cross_sections_count)]
        logger.info(f"[{self.component_id}] Initialized channel geometry.")
        return True
    @with_retry_backoff(retries=3)
    async def _perform_time_step_impl(self, dt: float) -> Dict[str, Any]:
        total_inflow = sum(self.inflow_rate_cms)
        surge_factor = total_inflow * 0.005
        new_levels = []
        for i, base_elev in enumerate(self.water_levels):
            attenuation = (1.0 - (i / self.cross_sections_count) * 0.1)
            stage_rise = surge_factor * attenuation
            new_levels.append(round(base_elev + stage_rise, 4))
        self.water_levels = new_levels
        avg_gradient = 0.0002
        hydraulic_radius = 4.2
        velocity_mps = (1.0 / self.channel_roughness_manning_n) * (hydraulic_radius**(2/3)) * (avg_gradient**0.5)
        return {
            "status": "CONVERGED",
            "water_level": self.water_levels,
            "velocity_mps": round(velocity_mps, 2),
            "peak_stage_m": max(self.water_levels)
        }
    async def _get_values_impl(self, quantity_id: str, element_set_id: str) -> List[float]:
        if quantity_id == "WaterSurfaceElevation":
            return self.water_levels
        elif quantity_id == "AverageChannelVelocity":
            return [sum(self.water_levels) / len(self.water_levels) * 0.35]
        return []
    async def _set_values_impl(self, quantity_id: str, element_set_id: str, values: List[float]) -> bool:
        if quantity_id == "InflowDischarge" and values:
            self.inflow_rate_cms = [float(v) for v in values]
            return True
        return False
    async def _finish_impl(self) -> bool:
        logger.info(f"[{self.component_id}] Finished.")
        return True
