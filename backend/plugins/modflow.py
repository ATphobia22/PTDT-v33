import logging
import numpy as np
from typing import Dict, Any, List
from backend.plugins.base_openmi_adapter import OpenMIAdapter
from backend.utils.resilience import with_retry_backoff
logger = logging.getLogger("ptdt.openmi.modflow")

class ModflowOpenMIAdapter(OpenMIAdapter):
    @property
    def component_id(self) -> str:
        return "MODFLOW_6_v32"
    async def _initialize_impl(self, config: Dict) -> bool:
        self.rows = config.get("grid_rows", 50)
        self.cols = config.get("grid_cols", 50)
        self.hydraulic_conductivity = config.get("k_m_day", 15.0)
        self.specific_yield = config.get("sy", 0.2)
        self.heads = np.full((self.rows, self.cols), config.get("initial_head_m", 102.5), dtype=float)
        self.recharge_rate = 0.0002
        self.external_head_boundary = 108.0
        logger.info(f"[{self.component_id}] Initialized.")
        return True
    @with_retry_backoff(retries=3)
    async def _perform_time_step_impl(self, dt: float) -> Dict[str, Any]:
        h_new = self.heads.copy()
        dx, dy = 10.0, 10.0
        for i in range(1, self.rows - 1):
            for j in range(1, self.cols - 1):
                t_right = self.hydraulic_conductivity * 0.5 * (self.heads[i, j] + self.heads[i, j+1])
                t_left = self.hydraulic_conductivity * 0.5 * (self.heads[i, j] + self.heads[i, j-1])
                t_up = self.hydraulic_conductivity * 0.5 * (self.heads[i, j] + self.heads[i-1, j])
                t_down = self.hydraulic_conductivity * 0.5 * (self.heads[i, j] + self.heads[i+1, j])
                flux_x = (t_right * (self.heads[i, j+1] - self.heads[i, j]) / dx - t_left * (self.heads[i, j] - self.heads[i, j-1]) / dx) / dx
                flux_y = (t_up * (self.heads[i-1, j] - self.heads[i, j]) / dy - t_down * (self.heads[i, j] - self.heads[i+1, j]) / dy) / dy
                dt_days = dt / 86400.0
                dh = (dt_days / self.specific_yield) * (flux_x + flux_y + self.recharge_rate)
                h_new[i, j] = max(95.0, min(150.0, self.heads[i, j] + dh))
        self.heads = h_new
        avg_head = float(np.mean(self.heads))
        pore_pressure_kpa = 1000.0 * 9.81 * max(0.0, self.external_head_boundary - 105.0) / 1000.0
        head_gradient = (self.external_head_boundary - 104.0) / 22.0
        flux = self.hydraulic_conductivity * head_gradient * 22.0 * 10.0
        return {
            "status": "CONVERGED",
            "average_hydraulic_head_m": round(avg_head, 4),
            "pore_pressure_kpa": [pore_pressure_kpa],
            "flux_volume_m3": flux * dt
        }
    async def _get_values_impl(self, quantity_id: str, element_set_id: str) -> List[float]:
        if quantity_id == "HydraulicHead":
            return [float(np.mean(self.heads))]
        elif quantity_id == "GroundwaterTableElevation":
            return self.heads.flatten().tolist()
        return []
    async def _set_values_impl(self, quantity_id: str, element_set_id: str, values: List[float]) -> bool:
        if quantity_id == "SurfaceInfiltration" and len(values) > 0:
            self.recharge_rate = float(values[0])
            return True
        elif quantity_id == "SurfaceHead":
            self.external_head_boundary = float(values[0]) if values else 108.0
            return True
        return False
    async def _finish_impl(self) -> bool:
        return True
