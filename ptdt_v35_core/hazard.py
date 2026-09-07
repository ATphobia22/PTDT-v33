from __future__ import annotations

import math
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class RoadHazard:
    elevation_m: float
    water_surface_m: float | None = None
    depth_m: float | None = None
    velocity_mps: float | None = None
    closed: bool = False
    uncertainty_m: float = 0.0

    def __post_init__(self) -> None:
        values = (self.elevation_m, self.water_surface_m, self.depth_m, self.velocity_mps, self.uncertainty_m)
        if any(v is not None and not math.isfinite(float(v)) for v in values):
            raise ValueError("hazard values must be finite")
        if self.uncertainty_m < 0:
            raise ValueError("uncertainty_m must be non-negative")
        if self.depth_m is not None and self.depth_m < 0:
            raise ValueError("depth_m must be non-negative")
        if self.velocity_mps is not None and self.velocity_mps < 0:
            raise ValueError("velocity_mps must be non-negative")

    @property
    def inferred_depth_m(self) -> float:
        if self.depth_m is not None:
            return self.depth_m
        if self.water_surface_m is None:
            return 0.0
        return max(0.0, self.water_surface_m - self.elevation_m)


@dataclass(frozen=True, slots=True)
class RouteCostInput:
    travel_time_s: float
    hazard: RoadHazard
    road_class_weight: float = 1.0

    def __post_init__(self) -> None:
        if not math.isfinite(self.travel_time_s) or self.travel_time_s < 0:
            raise ValueError("travel_time_s must be finite and non-negative")
        if not math.isfinite(self.road_class_weight) or self.road_class_weight <= 0:
            raise ValueError("road_class_weight must be finite and positive")


def validate_hazard(hazard: RoadHazard) -> None:
    if hazard.closed:
        return
    if hazard.inferred_depth_m < 0:
        raise ValueError("inferred depth cannot be negative")


def route_cost(value: RouteCostInput) -> float:
    validate_hazard(value.hazard)
    if value.hazard.closed:
        return math.inf
    depth = value.hazard.inferred_depth_m
    velocity = value.hazard.velocity_mps or 0.0
    uncertainty = value.hazard.uncertainty_m
    depth_penalty = 1.0 + min(depth / 0.30, 20.0) ** 2
    velocity_penalty = 1.0 + min(velocity / 2.0, 10.0) ** 2
    uncertainty_penalty = 1.0 + min(uncertainty / 1.0, 5.0)
    return value.travel_time_s * value.road_class_weight * depth_penalty * velocity_penalty * uncertainty_penalty
