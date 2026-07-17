from abc import ABC, abstractmethod
from typing import Dict, Any, List
import asyncio
import logging
logger = logging.getLogger("ptdt.openmi")
class OpenMIAdapter(ABC):
    @property
    @abstractmethod
    def component_id(self) -> str: pass
    async def initialize(self, config: Dict) -> bool:
        try:
            return await self._initialize_impl(config)
        except Exception as e:
            logger.error(f"[{self.component_id}] Initialize failed: {str(e)}", exc_info=True)
            return False
    @abstractmethod
    async def _initialize_impl(self, config: Dict) -> bool: pass
    async def perform_time_step(self, dt: float) -> Dict[str, Any]:
        try:
            return await self._perform_time_step_impl(dt)
        except Exception as e:
            logger.error(f"[{self.component_id}] Time step failed: {str(e)}", exc_info=True)
            return {"error": str(e), "status": "FAILED"}
    @abstractmethod
    async def _perform_time_step_impl(self, dt: float) -> Dict[str, Any]: pass
    async def get_values(self, quantity_id: str, element_set_id: str) -> List[float]:
        try:
            return await self._get_values_impl(quantity_id, element_set_id)
        except Exception as e:
            logger.error(f"[{self.component_id}] GetValues failed: {str(e)}", exc_info=True)
            return []
    @abstractmethod
    async def _get_values_impl(self, quantity_id: str, element_set_id: str) -> List[float]: pass
    async def set_values(self, quantity_id: str, element_set_id: str, values: List[float]) -> bool:
        try:
            return await self._set_values_impl(quantity_id, element_set_id, values)
        except Exception as e:
            logger.error(f"[{self.component_id}] SetValues failed: {str(e)}", exc_info=True)
            return False
    @abstractmethod
    async def _set_values_impl(self, quantity_id: str, element_set_id: str, values: List[float]) -> bool: pass
    async def finish(self) -> bool:
        try:
            return await self._finish_impl()
        except Exception as e:
            logger.error(f"[{self.component_id}] Finish failed: {str(e)}", exc_info=True)
            return False
    @abstractmethod
    async def _finish_impl(self) -> bool: pass
