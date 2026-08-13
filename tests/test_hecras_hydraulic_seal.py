"""Seal tests for hydraulic stream coupler (no HDF required)."""
from __future__ import annotations

from backend.services.hecras_hydraulic_stream_coupler import (
    HECRASHydraulicCoupler,
    verify_hydraulic_seal,
)


def test_seal_stable_and_tamper_detect():
    payload = {
        "schema_version": 1,
        "sequence": 0,
        "source": "HEC-RAS-2D",
        "flow_area": "2D_TriState",
        "vertical_datum": "NAVD88",
        "units": "ft",
        "cell_count": 3,
        "wse_milli": [375000, 376500, -9999],
        "timestamp_unix": 1.0,
    }
    payload["state_cryptographic_seal"] = HECRASHydraulicCoupler._compute_seal(payload)
    assert verify_hydraulic_seal(payload)
    payload["sequence"] = 99
    assert not verify_hydraulic_seal(payload)


def test_seal_excludes_seal_field():
    p = {"a": 1, "state_cryptographic_seal": "x"}
    s1 = HECRASHydraulicCoupler._compute_seal(p)
    s2 = HECRASHydraulicCoupler._compute_seal({"a": 1})
    assert s1 == s2
