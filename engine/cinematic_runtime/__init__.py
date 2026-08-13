"""Cinematic runtime: Box3D sealed physics, state diff, Redis/WS bridge."""
from .box3d_contract import (
    PHYSICS_SCHEMA_VERSION,
    Box3DPhysicsState,
    PhysicsBodyState,
    compute_state_seal,
    seal_state,
    verify_state_seal,
)
from .state_diff import (
    BodyChangeKind,
    BodyDelta,
    PhysicsStateDiff,
    apply_diff,
    bodies_equal,
    diff_states,
    should_send_keyframe,
)

__all__ = [
    "PHYSICS_SCHEMA_VERSION",
    "Box3DPhysicsState",
    "PhysicsBodyState",
    "compute_state_seal",
    "seal_state",
    "verify_state_seal",
    "BodyChangeKind",
    "BodyDelta",
    "PhysicsStateDiff",
    "apply_diff",
    "bodies_equal",
    "diff_states",
    "should_send_keyframe",
]
