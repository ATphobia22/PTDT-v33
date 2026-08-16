"""HEC-RAS authoritative → Archimedes secondary physics only."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from engine.cinematic_runtime.archimedes_webgpu_coupler import ArchimedesWebGPUCoupler
from engine.cinematic_runtime.validated_hydraulic_state import (
    ValidatedHydraulicState,
    verify_hydraulic_state,
)


class SecondaryPhysicsState(BaseModel):
    model_config = ConfigDict(extra="forbid")

    hydraulic_seal: str = Field(min_length=64, max_length=128)
    hydraulic_status: str
    archimedes_uniform_seal: str = ""
    archimedes_float32: list[float] = Field(default_factory=list, max_length=16)
    diagnostics: dict[str, Any] = Field(default_factory=dict)
    authority: str = "SECONDARY_ARCHIMEDES"


class HecRasArchimedesCoupler:
    def __init__(self) -> None:
        self._arch = ArchimedesWebGPUCoupler()

    def couple(
        self,
        hydraulic: ValidatedHydraulicState,
        archimedes_dict: dict[str, Any] | None = None,
    ) -> SecondaryPhysicsState:
        if not verify_hydraulic_state(hydraulic):
            raise ValueError("ValidatedHydraulicState seal verification failed")
        if hydraulic.source_engine != "HEC-RAS":
            raise ValueError("Only HEC-RAS source_engine is accepted")
        uniforms = (
            self._arch.from_archimedes_dict(archimedes_dict)
            if archimedes_dict
            else self._arch.from_defaults()
        )
        pack = self._arch.pack_for_webgpu(uniforms)
        return SecondaryPhysicsState(
            hydraulic_seal=hydraulic.state_cryptographic_seal,
            hydraulic_status=hydraulic.status,
            archimedes_uniform_seal=pack["seal"],
            archimedes_float32=list(pack["float32"]),
            diagnostics={
                "cell_count": hydraulic.cell_count,
                "timestep_index": hydraulic.timestep_index,
                "note": "Archimedes did not modify WSE or flux",
            },
        )
