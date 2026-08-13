"""NAVD88 vertical-datum enforcement — fail-closed for all elevation paths."""
from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from typing import Any

from backend.core.v34_sovereign_constants import (
    BFE_NAVD88_FT,
    BERM_CREST_NAVD88_FT,
    DATUM,
    FREEBOARD_VECTOR_FT,
    HOUSE_FLOOR_NAVD88_FT,
    LAG_NAVD88_FT,
    NOT_EVALUATED,
)


class DatumToken(str, Enum):
    NAVD88 = "NAVD88"
    NGVD29 = "NGVD29"
    UNKNOWN = "UNKNOWN"
    LOCAL_ARBITRARY = "LOCAL_ARBITRARY"


NGVD29_TO_NAVD88_SHIFT_FT: float = -0.46


@dataclass(frozen=True, slots=True)
class ElevationSample:
    value_ft: float
    datum: DatumToken
    source: str
    units: str = "ft"


@dataclass(frozen=True, slots=True)
class CanonicalElevation:
    value_navd88_ft: float
    source_datum: DatumToken
    conversion_applied: bool
    status: str


class VerticalDatumEnforcer:
    """Converts and validates elevations to NAVD88 before hydro/regulatory use."""

    locked_bfe = BFE_NAVD88_FT
    locked_lag = LAG_NAVD88_FT
    locked_berm = BERM_CREST_NAVD88_FT
    locked_floor = HOUSE_FLOOR_NAVD88_FT
    freeboard_vector = FREEBOARD_VECTOR_FT
    authority_datum = DATUM

    def to_navd88(self, sample: ElevationSample) -> CanonicalElevation:
        if sample.units.lower() not in {"ft", "feet"}:
            return CanonicalElevation(
                value_navd88_ft=float("nan"),
                source_datum=sample.datum,
                conversion_applied=False,
                status="REJECTED",
            )
        if sample.value_ft != sample.value_ft:
            return CanonicalElevation(
                value_navd88_ft=float("nan"),
                source_datum=sample.datum,
                conversion_applied=False,
                status="REJECTED",
            )

        if sample.datum == DatumToken.NAVD88:
            return CanonicalElevation(
                value_navd88_ft=sample.value_ft,
                source_datum=sample.datum,
                conversion_applied=False,
                status="VALID",
            )
        if sample.datum == DatumToken.NGVD29:
            return CanonicalElevation(
                value_navd88_ft=sample.value_ft + NGVD29_TO_NAVD88_SHIFT_FT,
                source_datum=sample.datum,
                conversion_applied=True,
                status="VALID",
            )
        return CanonicalElevation(
            value_navd88_ft=float("nan"),
            source_datum=sample.datum,
            conversion_applied=False,
            status=NOT_EVALUATED,
        )

    def require_navd88(self, sample: ElevationSample) -> float:
        canon = self.to_navd88(sample)
        if canon.status != "VALID":
            raise ValueError(
                f"Elevation not enforceable to NAVD88 (status={canon.status}, "
                f"datum={sample.datum}, source={sample.source})."
            )
        return canon.value_navd88_ft

    def freeboard_check(self, stage_navd88_ft: float) -> dict[str, Any]:
        if stage_navd88_ft != stage_navd88_ft:
            raise ValueError("Stage must be finite NAVD88 feet.")
        lag_margin = self.locked_lag - stage_navd88_ft
        berm_margin = self.locked_berm - stage_navd88_ft
        floor_margin = self.locked_floor - stage_navd88_ft
        return {
            "datum": self.authority_datum,
            "stage_navd88_ft": stage_navd88_ft,
            "bfe_ft": self.locked_bfe,
            "lag_margin_ft": lag_margin,
            "berm_margin_ft": berm_margin,
            "floor_margin_ft": floor_margin,
            "freeboard_vector_ft": self.freeboard_vector,
            "lag_satisfied": lag_margin >= 0.0,
            "berm_satisfied": berm_margin >= 0.0,
        }
