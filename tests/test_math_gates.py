"""Deterministic math gates for CI — no network required."""
from __future__ import annotations

import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "python"))

from volumetric_calc import VolumetricAccumulationEngine  # noqa: E402
from spatial_envelope import build_spatial_envelope, in_indiana  # noqa: E402
from calibration_receipt import relative_error_pct  # noqa: E402


def manning_velocity(depth_ft: float, n: float = 0.045, s: float = 0.00015) -> float:
    if depth_ft <= 0:
        return 0.0
    d = max(0.1, depth_ft)
    return (1.486 / n) * (d ** (2.0 / 3.0)) * (s ** 0.5)


def test_manning_positive_and_subcritical_at_2ft():
    v = manning_velocity(2.0)
    assert 0.5 < v < 1.0


def test_cut_fill_1_20():
    eng = VolumetricAccumulationEngine()
    r = eng.verify_cut_fill_compliance(5000.0, 6500.0, safety_factor=1.20)
    assert r["project_1_20x_met"] is True
    assert r["storage_increases"] is True


def test_spatial_envelope_contains_center():
    assert in_indiana(37.92, -87.95)
    env = build_spatial_envelope(37.92, -87.95, 1.0)
    assert env["xmin"] < -87.95 < env["xmax"]
    assert env["ymin"] < 37.92 < env["ymax"]


def test_relative_error():
    assert relative_error_pct(20.0, 20.0) == 0.0
    assert math.isclose(relative_error_pct(20.0, 21.0), 5.0)
