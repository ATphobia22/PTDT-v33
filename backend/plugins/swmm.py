import logging
from typing import Dict, Any, List
from backend.plugins.base_openmi_adapter import OpenMIAdapter
from backend.utils.resilience import with_retry_backoff
logger = logging.getLogger("ptdt.openmi.swmm")
class SwmmOpenMIAdapter(OpenMIAdapter):
    @property
    def component_id(self) -> str:
        return "SWMM_5_v32"
    async def _initialize_impl(self, config: Dict) -> bool:
        self.config_path = config.get("config_path", "")
        self.rain_intensity_mm_hr = 0.0
        self.catchment_area_m2 = 450000.0
        self.impervious_ratio = 0.45
        self.depression_storage_mm = 2.5
        self.discharge_nodes = [0.0, 0.0, 0.0]
        logger.info(f"[{self.component_id}] Initialized hydrology parameters.")
        return True
    @with_retry_backoff(retries=3)
    async def _perform_time_step_impl(self, dt: float) -> Dict[str, Any]:
        if self.rain_intensity_mm_hr < 0:
            raise ValueError("Precipitation volume cannot be negative.")
        net_intensity_mm_hr = max(0.0, self.rain_intensity_mm_hr - (self.depression_storage_mm / (dt / 3600.0)))
        intensity_m_s = (net_intensity_mm_hr / 1000.0) / 3600.0
        runoff_coefficient = 0.15 + (self.impervious_ratio * 0.75)
        peak_discharge_cms = runoff_coefficient * intensity_m_s * self.catchment_area_m2
        self.discharge_nodes = [
            round(peak_discharge_cms * 0.50, 4),
            round(peak_discharge_cms * 0.35, 4),
            round(peak_discharge_cms * 0.15, 4)
        ]
        return {
            "status": "CONVERGED",
            "outfall_discharge_cms": self.discharge_nodes,
            "total_runoff_volume_m3": sum(self.discharge_nodes) * dt
        }
    async def _get_values_impl(self, quantity_id: str, element_set_id: str) -> List[float]:
        if quantity_id == "NodeDischarge":
            return self.discharge_nodes
        elif quantity_id == "BulkCatchmentRunoff":
            return [sum(self.discharge_nodes)]
        return []
    async def _set_values_impl(self, quantity_id: str, element_set_id: str, values: List[float]) -> bool:
        if quantity_id == "PrecipitationIntensity" and values:
            self.rain_intensity_mm_hr = float(values[0])
            return True
        return False
    async def _finish_impl(self) -> bool:
        logger.info(f"[{self.component_id}] Cleared active catchment states.")
        return True
