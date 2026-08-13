"""Unit tests for Box3D sealed physics contract + state diff."""
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
from engine.cinematic_runtime.state_diff import (
    apply_diff,
    bodies_equal,
    diff_states,
    should_send_keyframe,
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


def test_seal_deterministic():
    bodies = [_body(entity_id="a"), _body(entity_id="b", x=2.0)]
    s1 = seal_state(5, "v33.0", bodies=bodies)
    s2 = seal_state(5, "v33.0", bodies=bodies)
    assert s1.state_cryptographic_seal == s2.state_cryptographic_seal


def test_diff_keyframe_when_previous_none():
    cur = seal_state(1, "v33.0", bodies=[_body(), _body(entity_id="b2", x=3.0)])
    d = diff_states(None, cur)
    assert d.from_sequence == -1
    assert len(d.added) == 2
    assert d.removed == [] and d.updated == []


def test_diff_update_remove_add():
    prev = seal_state(1, "v33.0", bodies=[_body(entity_id="a"), _body(entity_id="b")])
    cur = seal_state(
        2,
        "v33.0",
        bodies=[_body(entity_id="a", x=1.5), _body(entity_id="c", y=9.0)],
    )
    d = diff_states(prev, cur)
    assert {x.entity_id for x in d.updated} == {"a"}
    assert {x.entity_id for x in d.removed} == {"b"}
    assert {x.entity_id for x in d.added} == {"c"}
    assert d.to_seal == cur.state_cryptographic_seal


def test_diff_rejects_non_advancing_sequence():
    a = seal_state(3, "v33.0")
    b = seal_state(3, "v33.0")
    with pytest.raises(ValueError):
        diff_states(a, b)


def test_apply_diff_roundtrip():
    prev = seal_state(1, "v33.0", bodies=[_body(entity_id="a")])
    cur = seal_state(2, "v33.0", bodies=[_body(entity_id="a", z=4.0), _body(entity_id="b")])
    d = diff_states(prev, cur)
    rebuilt = apply_diff(prev, d)
    assert set(rebuilt) == {"a", "b"}
    assert bodies_equal(rebuilt["a"], cur.bodies[0])


def test_should_send_keyframe_on_high_churn():
    prev = seal_state(1, "v33.0", bodies=[_body(entity_id=f"e{i}") for i in range(10)])
    cur = seal_state(2, "v33.0", bodies=[_body(entity_id=f"e{i}", x=float(i)) for i in range(10)])
    d = diff_states(prev, cur)
    assert should_send_keyframe(d, body_count=10, change_ratio_threshold=0.45)
