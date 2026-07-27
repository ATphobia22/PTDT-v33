"""
NAVD 88 Datum Consistency — Hard Checks (open source)
Blocks legacy NGVD 29 and unlabeled datums before regulatory package emission.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple

ALLOWED_DATUMS = {"NAVD88", "NAVD 88", "NAVD_88", "navd88", "navd 88"}
BLOCKED_DATUMS = {"NGVD29", "NGVD 29", "NGVD_29", "ngvd29", "ngvd 29", "MSL", ""}


def normalize_datum(value: Optional[str]) -> str:
    if value is None:
        return ""
    return str(value).strip().upper().replace("_", " ").replace("-", " ")


def is_navd88(value: Optional[str]) -> bool:
    n = normalize_datum(value)
    return n in {"NAVD88", "NAVD 88"}


def is_blocked_datum(value: Optional[str]) -> bool:
    n = normalize_datum(value)
    if not n:
        return True
    if n in {"NGVD29", "NGVD 29"}:
        return True
    if n == "MSL":  # ambiguous without NAVD88 qualifier
        return True
    return False


def validate_elevation_payload(payload: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Pre-submission hard check.
    Returns (ok, list_of_errors).
    """
    errors: List[str] = []

    datum = payload.get("vertical_datum") or payload.get("datum") or ""
    if is_blocked_datum(datum):
        errors.append(
            f"DATUM_REJECTED: '{datum}' is not allowed. "
            "Use NAVD88 only. NGVD29 / unlabeled MSL can cause multi-foot vertical error "
            "and FEMA technical rejection. Convert via local FIS or NGS NCAT."
        )
    elif not is_navd88(datum):
        errors.append(
            f"DATUM_UNKNOWN: '{datum}' is not recognized as NAVD88. "
            "Set vertical_datum to 'NAVD88'."
        )

    lag = payload.get("lowest_adjacent_grade_ft") or payload.get("lag_ft")
    bfe = payload.get("base_flood_elevation_ft") or payload.get("bfe_ft")
    if lag is not None and bfe is not None:
        try:
            lag_f = float(lag)
            bfe_f = float(bfe)
            if lag_f < bfe_f:
                errors.append(
                    f"ELEVATION_TEST: LAG {lag_f} ft < BFE {bfe_f} ft — "
                    "pure LOMA path requires LAG >= BFE on natural grade."
                )
        except (TypeError, ValueError):
            errors.append("ELEVATION_PARSE: LAG/BFE must be numeric feet.")

    return (len(errors) == 0, errors)


def assert_navd88_or_raise(payload: Dict[str, Any]) -> None:
    ok, errors = validate_elevation_payload(payload)
    if not ok:
        raise ValueError("NAVD88 hard check failed: " + " | ".join(errors))


if __name__ == "__main__":
    # Self-test
    good = {"vertical_datum": "NAVD88", "lag_ft": 377.2, "bfe_ft": 375.0}
    bad = {"vertical_datum": "NGVD29", "lag_ft": 377.2, "bfe_ft": 375.0}
    print("good", validate_elevation_payload(good))
    print("bad", validate_elevation_payload(bad))
