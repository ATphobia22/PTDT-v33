import math

import pytest

from ptdt_v35_core.evidence import EvidenceLedger, EvidenceNode
from ptdt_v35_core.spatial import SpatialTransformBridge


def test_evidence_rejects_non_finite_nested_values() -> None:
    with pytest.raises(ValueError, match="non-finite"):
        EvidenceNode(
            "bad",
            "test",
            "test",
            "valid",
            {"nested": {"elevation": math.nan}},
        )


def test_evidence_snapshot_is_not_mutable() -> None:
    ledger = EvidenceLedger()
    ledger.append(EvidenceNode("root", "test", "test", "valid", {"value": 1}))

    snapshot = ledger.snapshot()
    assert snapshot["root"].payload["value"] == 1
    with pytest.raises(TypeError):
        snapshot["root"] = ledger.get("root")


def test_spatial_rejects_non_finite_coordinates() -> None:
    bridge = SpatialTransformBridge()

    with pytest.raises(ValueError, match="finite"):
        bridge.epsg2966_to_wgs84(math.inf, 1.0)

    with pytest.raises(ValueError, match="finite"):
        bridge.wgs84_ellipsoidal_to_ecef(-88.0, 37.0, math.nan)
