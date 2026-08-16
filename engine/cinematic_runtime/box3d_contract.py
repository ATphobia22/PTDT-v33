"""PTDT Box3D physics state contract — schema-aligned with Unity envelope."""
from __future__ import annotations

from hashlib import sha256
from typing import Final

from pydantic import BaseModel, ConfigDict, Field, field_validator

PHYSICS_SCHEMA_VERSION: Final[int] = 1


class PhysicsBodyState(BaseModel):
    model_config = ConfigDict(extra="forbid")

    entity_id: str = Field(min_length=1, max_length=256)
    x: float
    y: float
    z: float
    qx: float
    qy: float
    qz: float
    qw: float
    vx: float
    vy: float
    vz: float
    angular_x: float
    angular_y: float
    angular_z: float

    @field_validator(
        "x", "y", "z", "qx", "qy", "qz", "qw",
        "vx", "vy", "vz", "angular_x", "angular_y", "angular_z",
    )
    @classmethod
    def validate_finite(cls, value: float) -> float:
        if value != value:
            raise ValueError("Physics value must not be NaN.")
        if value in (float("inf"), float("-inf")):
            raise ValueError("Physics value must be finite.")
        return value


class Box3DPhysicsState(BaseModel):
    model_config = ConfigDict(extra="forbid")

    schema_version: int = Field(default=PHYSICS_SCHEMA_VERSION, ge=1)
    sequence: int = Field(ge=0)
    pipeline_state_version: str = Field(min_length=1, max_length=256)
    state_cryptographic_seal: str = Field(min_length=64, max_length=128)
    bodies: list[PhysicsBodyState] = Field(default_factory=list, max_length=100_000)

    @field_validator("schema_version")
    @classmethod
    def validate_schema_version(cls, value: int) -> int:
        if value != PHYSICS_SCHEMA_VERSION:
            raise ValueError(f"Unsupported physics schema version: {value}")
        return value


def canonical_physics_bytes(state: Box3DPhysicsState) -> bytes:
    import json

    payload = state.model_dump(mode="json", exclude={"state_cryptographic_seal"})
    return json.dumps(
        payload, ensure_ascii=False, sort_keys=True, separators=(",", ":")
    ).encode("utf-8")


def compute_state_seal(state: Box3DPhysicsState) -> str:
    return sha256(canonical_physics_bytes(state)).hexdigest()


def verify_state_seal(state: Box3DPhysicsState) -> bool:
    return compute_state_seal(state) == state.state_cryptographic_seal
