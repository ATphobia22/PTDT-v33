"""Sovereign API routers — spatial, datum, cinematic, invariants."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field, field_validator

from backend.core.v34_sovereign_constants import (
    AUTHORITY_HYDRO,
    AUTHORITY_PRESENTATION,
    BFE_NAVD88_FT,
    CRS,
    DATUM,
)
from backend.hydraulic.vertical_datum import (
    DatumToken,
    ElevationSample,
    VerticalDatumEnforcer,
)
from backend.spatial.normalization import ProjectedPoint, SpatialNormalizationEngine
from engine.cinematic_runtime.usd_hydra_pipeline import CinematicPipelineStatus

router = APIRouter(prefix="/api/v1", tags=["sovereign"])
_spatial = SpatialNormalizationEngine()
_datum = VerticalDatumEnforcer()


class ProjectedPointIn(BaseModel):
    easting_m: float
    northing_m: float
    elev_navd88_ft: float
    crs: str = CRS

    @field_validator("easting_m", "northing_m", "elev_navd88_ft")
    @classmethod
    def finite(cls, v: float) -> float:
        if v != v or v in (float("inf"), float("-inf")):
            raise ValueError("Must be finite.")
        return v


class ElevationIn(BaseModel):
    value_ft: float
    datum: DatumToken
    source: str = Field(min_length=1, max_length=256)

    @field_validator("value_ft")
    @classmethod
    def finite(cls, v: float) -> float:
        if v != v or v in (float("inf"), float("-inf")):
            raise ValueError("Must be finite.")
        return v


@router.get("/invariants")
def engineering_invariants() -> dict[str, Any]:
    return {
        "datum": DATUM,
        "crs": CRS,
        "bfe_navd88_ft": BFE_NAVD88_FT,
        "authority_hydro": AUTHORITY_HYDRO,
        "authority_presentation": AUTHORITY_PRESENTATION,
        "render_origin_e_m": _spatial.origin_e,
        "render_origin_n_m": _spatial.origin_n,
        "fail_closed": True,
    }


@router.post("/spatial/to-local")
def spatial_to_local(body: ProjectedPointIn) -> dict[str, Any]:
    try:
        local = _spatial.project_to_local(
            ProjectedPoint(
                easting_m=body.easting_m,
                northing_m=body.northing_m,
                elev_navd88_ft=body.elev_navd88_ft,
                crs=body.crs,
            )
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    return {
        "x_m": local.x_m,
        "y_m": local.y_m,
        "z_m": local.z_m,
        "crs_in": body.crs,
        "authority": AUTHORITY_PRESENTATION,
    }


@router.post("/datum/to-navd88")
def datum_to_navd88(body: ElevationIn) -> dict[str, Any]:
    sample = ElevationSample(
        value_ft=body.value_ft,
        datum=body.datum,
        source=body.source,
    )
    canon = _datum.to_navd88(sample)
    if canon.status == "REJECTED":
        raise HTTPException(status_code=422, detail="Elevation rejected.")
    return {
        "value_navd88_ft": canon.value_navd88_ft if canon.status == "VALID" else None,
        "status": canon.status,
        "conversion_applied": canon.conversion_applied,
        "source_datum": canon.source_datum.value,
        "authority_datum": DATUM,
    }


@router.post("/datum/freeboard-check")
def freeboard_check(body: ElevationIn) -> dict[str, Any]:
    try:
        stage = _datum.require_navd88(
            ElevationSample(
                value_ft=body.value_ft,
                datum=body.datum,
                source=body.source,
            )
        )
        return _datum.freeboard_check(stage)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/cinematic/status")
def cinematic_status() -> dict[str, Any]:
    return CinematicPipelineStatus().as_dict()
