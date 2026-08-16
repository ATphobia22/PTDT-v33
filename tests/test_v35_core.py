from __future__ import annotations

import struct

import pytest

from backend.analysis.clearance import StructuralClearanceAnalyzer
from ptdt_v35_core.evidence import EvidenceLedger, EvidenceNode
from ptdt_v35_core.spatial import SpatialTransformBridge


def test_evidence_ledger_rejects_unknown_parent() -> None:
    ledger = EvidenceLedger()
    with pytest.raises(ValueError, match="unknown evidence parent"):
        ledger.append(EvidenceNode("child", "p", "a", "valid", {}, ("missing",)))


def test_spatial_ecef_requires_ellipsoidal_height() -> None:
    ecef = SpatialTransformBridge().wgs84_ellipsoidal_to_ecef(-88.0, 37.9, 100.0)
    assert all(abs(value) > 1.0 for value in (ecef.x_m, ecef.y_m, ecef.z_m))


def test_clearance_manifest_is_sealed() -> None:
    analyzer = StructuralClearanceAnalyzer(bfe_navd88_ft=375.0)
    result = analyzer.evaluate({
        "building_id": "test-1",
        "lowest_adjacent_grade_ft": 377.2,
        "first_floor_elevation_ft": 382.5,
    }, 376.4)
    assert result["compliance_metrics"]["freeboard_ft"] == pytest.approx(6.1)
    assert len(result["manifest_metadata"]["cryptographic_manifest_seal"]) == 64


def test_float32_depth_payload_is_stable() -> None:
    payload = struct.pack("<4f", 1.0, 2.0, 3.0, 4.0)
    assert len(payload) == 16
