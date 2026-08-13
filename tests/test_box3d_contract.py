"""Unit tests for Box3D sealed physics contract."""
from __future__ import annotations

import pytest
from pydantic import ValidationError

from engine.cinematic_runtime.box3d_contract import (
    PHYSICS_SCHEMA_VERSION,
    Box3DPhysicsState,
    PhysicsBodyState,
    compute_state_seal,
    seal_state,
    verify_state_seal,
)


def _body(**kwargs) -> PhysicsBodyState:
    base = dict(
        entity_id="debris-001",
        x=0.0, y=0.0, z=0.0,
        qx=0.0, qy=0.0, qz=0.0, qw=1.0,
        vx=0.0, vy=0.0, vz=0.0,
        angular_x=0.0, angular_y=0.0, angular_z=0.0,
    )
    base.update(kwargs)
    return PhysicsBodyState(**base)


def test_seal_roundtrip_empty_bodies():
    state = seal_state(sequence=1, pipeline_state_version="v33.0")
    assert state.schema_version == PHYSICS_SCHEMA_VERSION
    assert len(state.state_cryptographic_seal) == 64
    assert verify_state_seal(state)


def test_seal_changes_with_body():
    a = seal_state(1, "v33.0", bodies=[_body()])
    b = seal_state(1, "v33.0", bodies=[_body(x=1.0)])
    assert a.state_cryptographic_seal != b.state_cryptographic_seal
    assert verify_state_seal(a) and verify_state_seal(b)


def test_tamper_fails_verify():
    state = seal_state(2, "v33.0", bodies=[_body()])
    tampered = state.model_copy(update={"sequence": 99})
    assert not verify_state_seal(tampered)


def test_reject_nan():
    with pytest.raises(ValidationError):
        _body(x=float("nan"))


def test_reject_inf():
    with pytest.raises(ValidationError):
        _body(vx=float("inf"))


def test_reject_wrong_schema():
    sealed = seal_state(0, "v33.0")
    with pytest.raises(ValidationError):
        Box3DPhysicsState(
            schema_version=99,
            sequence=0,
            pipeline_state_version="v33.0",
            state_cryptographic_seal=sealed.state_cryptographic_seal,
            bodies=[],
        )


def test_canonical_excludes_seal_field():
    state = seal_state(3, "v33.0")
    assert compute_state_seal(state) == state.state_cryptographic_seal
