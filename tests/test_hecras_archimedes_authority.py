import pytest
from engine.cinematic_runtime.validated_hydraulic_state import (
    build_hydraulic_state,
    verify_hydraulic_state,
)
from engine.cinematic_runtime.hecras_archimedes_coupler import HecRasArchimedesCoupler


def test_seal_roundtrip():
    s = build_hydraulic_state(
        pipeline_state_version="v33.0",
        timestep_index=0,
        wse_1d_mm=[375000, 376000],
        status="OK",
        provenance={"plan": "p01"},
    )
    assert verify_hydraulic_state(s)
    assert s.crs == "EPSG:2966" and s.vertical_datum == "NAVD88"


def test_soft_fail_no_fabricated_wse():
    s = build_hydraulic_state(
        pipeline_state_version="v33.0",
        timestep_index=0,
        wse_1d_mm=[],
        status="SOFT_FAIL_NO_RASCMD",
    )
    assert s.cell_count == 0 and verify_hydraulic_state(s)
    with pytest.raises(ValueError):
        build_hydraulic_state(
            pipeline_state_version="v33.0",
            timestep_index=0,
            wse_1d_mm=[1],
            status="SOFT_FAIL_NO_RASCMD",
        )


def test_archimedes_secondary_only():
    h = build_hydraulic_state(
        pipeline_state_version="v33.0",
        timestep_index=1,
        wse_1d_mm=[370000],
        status="OK",
    )
    secondary = HecRasArchimedesCoupler().couple(h)
    assert secondary.authority == "SECONDARY_ARCHIMEDES"
    assert secondary.hydraulic_seal == h.state_cryptographic_seal
    assert "did not modify WSE" in secondary.diagnostics["note"]
