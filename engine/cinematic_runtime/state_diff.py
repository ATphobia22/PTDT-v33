"""Physics state diffing for bandwidth-efficient Unity/WebGPU sync.

Full sealed envelopes remain the forensic source of truth. Diffs are
transport optimizations only — receivers must still verify sequence order
and may request a full keyframe on mismatch.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Iterable

from .box3d_contract import Box3DPhysicsState, PhysicsBodyState

POS_EPS = 1e-4
QUAT_EPS = 1e-5
VEL_EPS = 1e-4
ANG_EPS = 1e-4


class BodyChangeKind(str, Enum):
    ADDED = "added"
    REMOVED = "removed"
    UPDATED = "updated"
    UNCHANGED = "unchanged"


@dataclass(frozen=True)
class BodyDelta:
    entity_id: str
    kind: BodyChangeKind
    body: PhysicsBodyState | None = None


@dataclass(frozen=True)
class PhysicsStateDiff:
    from_sequence: int
    to_sequence: int
    pipeline_state_version: str
    to_seal: str
    added: list[BodyDelta] = field(default_factory=list)
    removed: list[BodyDelta] = field(default_factory=list)
    updated: list[BodyDelta] = field(default_factory=list)
    unchanged_count: int = 0

    @property
    def body_change_count(self) -> int:
        return len(self.added) + len(self.removed) + len(self.updated)

    @property
    def is_empty(self) -> bool:
        return self.body_change_count == 0


def _near(a: float, b: float, eps: float) -> bool:
    return abs(a - b) <= eps


def bodies_equal(a: PhysicsBodyState, b: PhysicsBodyState) -> bool:
    if a.entity_id != b.entity_id:
        return False
    return (
        _near(a.x, b.x, POS_EPS)
        and _near(a.y, b.y, POS_EPS)
        and _near(a.z, b.z, POS_EPS)
        and _near(a.qx, b.qx, QUAT_EPS)
        and _near(a.qy, b.qy, QUAT_EPS)
        and _near(a.qz, b.qz, QUAT_EPS)
        and _near(a.qw, b.qw, QUAT_EPS)
        and _near(a.vx, b.vx, VEL_EPS)
        and _near(a.vy, b.vy, VEL_EPS)
        and _near(a.vz, b.vz, VEL_EPS)
        and _near(a.angular_x, b.angular_x, ANG_EPS)
        and _near(a.angular_y, b.angular_y, ANG_EPS)
        and _near(a.angular_z, b.angular_z, ANG_EPS)
    )


def index_bodies(bodies: Iterable[PhysicsBodyState]) -> dict[str, PhysicsBodyState]:
    out: dict[str, PhysicsBodyState] = {}
    for body in bodies:
        if body.entity_id in out:
            raise ValueError(f"Duplicate entity_id in envelope: {body.entity_id}")
        out[body.entity_id] = body
    return out


def diff_states(
    previous: Box3DPhysicsState | None,
    current: Box3DPhysicsState,
) -> PhysicsStateDiff:
    if previous is not None and current.sequence <= previous.sequence:
        raise ValueError(
            f"Diff requires advancing sequence (prev={previous.sequence}, cur={current.sequence})"
        )

    prev_map = index_bodies(previous.bodies) if previous is not None else {}
    cur_map = index_bodies(current.bodies)

    added: list[BodyDelta] = []
    removed: list[BodyDelta] = []
    updated: list[BodyDelta] = []
    unchanged = 0

    for eid, body in cur_map.items():
        if eid not in prev_map:
            added.append(BodyDelta(eid, BodyChangeKind.ADDED, body))
        elif bodies_equal(prev_map[eid], body):
            unchanged += 1
        else:
            updated.append(BodyDelta(eid, BodyChangeKind.UPDATED, body))

    for eid in prev_map:
        if eid not in cur_map:
            removed.append(BodyDelta(eid, BodyChangeKind.REMOVED, None))

    return PhysicsStateDiff(
        from_sequence=previous.sequence if previous is not None else -1,
        to_sequence=current.sequence,
        pipeline_state_version=current.pipeline_state_version,
        to_seal=current.state_cryptographic_seal,
        added=added,
        removed=removed,
        updated=updated,
        unchanged_count=unchanged,
    )


def apply_diff(
    previous: Box3DPhysicsState | None,
    delta: PhysicsStateDiff,
) -> dict[str, PhysicsBodyState]:
    bodies = index_bodies(previous.bodies) if previous is not None else {}
    for d in delta.removed:
        bodies.pop(d.entity_id, None)
    for d in delta.added + delta.updated:
        if d.body is None:
            raise ValueError(f"Missing body payload for {d.kind} {d.entity_id}")
        bodies[d.entity_id] = d.body
    return bodies


def should_send_keyframe(
    delta: PhysicsStateDiff,
    *,
    body_count: int,
    change_ratio_threshold: float = 0.45,
    max_diff_bodies: int = 2048,
) -> bool:
    if body_count <= 0:
        return True
    if delta.body_change_count >= max_diff_bodies:
        return True
    return (delta.body_change_count / body_count) >= change_ratio_threshold
