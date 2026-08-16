"""ValidatedHydraulicState — HEC-RAS authoritative. Archimedes must not write WSE/flux."""
from __future__ import annotations

import json
from hashlib import sha256
from typing import Any, Final, Literal

from pydantic import BaseModel, ConfigDict, Field

CRS: Final[str] = "EPSG:2966"
DATUM: Final[str] = "NAVD88"
HYDRAULIC_SCHEMA_VERSION: Final[int] = 1


class ValidatedHydraulicState(BaseModel):
    model_config = ConfigDict(extra="forbid", frozen=True)

    schema_version: int = Field(default=HYDRAULIC_SCHEMA_VERSION, ge=1)
    source_engine: Literal["HEC-RAS"] = "HEC-RAS"
    pipeline_state_version: str = Field(min_length=1, max_length=256)
    timestep_index: int = Field(ge=0)
    crs: Literal["EPSG:2966"] = "EPSG:2966"
    vertical_datum: Literal["NAVD88"] = "NAVD88"
    units: Literal["ft", "m"] = "ft"
    wse_1d_mm: list[int] = Field(default_factory=list, max_length=2_000_000)
    cell_count: int = Field(ge=0, default=0)
    provenance: dict[str, Any] = Field(default_factory=dict)
    status: Literal["OK", "SOFT_FAIL_NO_RASCMD", "SOFT_FAIL_NO_HDF", "REJECTED"] = "OK"
    state_cryptographic_seal: str = Field(default="", max_length=128)

    def payload_for_seal(self) -> dict[str, Any]:
        return {
            "schema_version": self.schema_version,
            "source_engine": self.source_engine,
            "pipeline_state_version": self.pipeline_state_version,
            "timestep_index": self.timestep_index,
            "crs": self.crs,
            "vertical_datum": self.vertical_datum,
            "units": self.units,
            "wse_1d_mm": self.wse_1d_mm,
            "cell_count": self.cell_count,
            "provenance": self.provenance,
            "status": self.status,
        }


def seal_hydraulic_state(state: ValidatedHydraulicState) -> str:
    raw = json.dumps(
        state.payload_for_seal(), sort_keys=True, separators=(",", ":"), ensure_ascii=False
    )
    return sha256(raw.encode("utf-8")).hexdigest()


def verify_hydraulic_state(state: ValidatedHydraulicState) -> bool:
    if not state.state_cryptographic_seal:
        return False
    return state.state_cryptographic_seal == seal_hydraulic_state(state)


def build_hydraulic_state(
    *,
    pipeline_state_version: str,
    timestep_index: int,
    wse_1d_mm: list[int] | None = None,
    provenance: dict[str, Any] | None = None,
    status: Literal["OK", "SOFT_FAIL_NO_RASCMD", "SOFT_FAIL_NO_HDF", "REJECTED"] = "OK",
    units: Literal["ft", "m"] = "ft",
) -> ValidatedHydraulicState:
    wse = list(wse_1d_mm or [])
    if status.startswith("SOFT_FAIL") and wse:
        raise ValueError("SOFT_FAIL states must not carry fabricated WSE arrays")
    draft = ValidatedHydraulicState(
        pipeline_state_version=pipeline_state_version,
        timestep_index=timestep_index,
        wse_1d_mm=wse,
        cell_count=len(wse),
        provenance=dict(provenance or {}),
        status=status,
        units=units,
        state_cryptographic_seal="",
    )
    seal = seal_hydraulic_state(draft)
    return draft.model_copy(update={"state_cryptographic_seal": seal})
