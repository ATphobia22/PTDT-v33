from ptdt_v35_core.reality_capture import (
    CameraObservation,
    GaussianSceneDescriptor,
    PointObservation,
    classify_point,
    filter_invalid_points,
)

HASH = "a" * 64


def test_camera_observation_accepts_seven_dof_pose() -> None:
    CameraObservation("obs", "2026-08-16T00:00:00Z", "rgb", (0, 0, 0, 0, 0, 0, 1), HASH, 0.9)


def test_temporal_gaussian_requires_end_epoch() -> None:
    try:
        GaussianSceneDescriptor("temporal", "2026-08-16", HASH, 0.8)
    except ValueError:
        return
    raise AssertionError("temporal Gaussian without end epoch accepted")


def test_below_bfe_points_are_not_implicitly_discarded() -> None:
    point = PointObservation(0, 0, -10, class_code=2)
    assert classify_point(point) == "ground"
    assert filter_invalid_points([point]) == [point]
