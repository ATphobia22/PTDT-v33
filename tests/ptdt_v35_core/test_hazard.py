import math

from ptdt_v35_core.hazard import RoadHazard, RouteCostInput, route_cost


def test_bfe_is_not_a_universal_closure_rule() -> None:
    hazard = RoadHazard(elevation_m=114.0, water_surface_m=113.9, uncertainty_m=0.1)
    assert math.isfinite(route_cost(RouteCostInput(10.0, hazard)))


def test_closed_road_is_infinite_cost() -> None:
    assert math.isinf(route_cost(RouteCostInput(10.0, RoadHazard(114.0, closed=True))))


def test_depth_and_velocity_increase_cost() -> None:
    dry = route_cost(RouteCostInput(10.0, RoadHazard(114.0)))
    wet = route_cost(RouteCostInput(10.0, RoadHazard(114.0, depth_m=0.2, velocity_mps=1.0)))
    assert wet > dry
