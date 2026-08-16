import hashlib

from ptdt_v35_core.evidence import EvidenceLedger, EvidenceNode
from ptdt_v35_core.spatial import SpatialTransformBridge


def test_evidence_chain_is_deterministic():
    ledger = EvidenceLedger()
    root = EvidenceNode("root", "test", "test", "valid", {"b": 2, "a": 1})
    ledger.append(root)
    child = EvidenceNode("child", "test", "test", "valid", {"x": 3}, ("root",))
    ledger.append(child)
    ledger.verify()
    assert len(root.payload_hash) == 64
    assert hashlib.sha256(root.canonical_bytes()).hexdigest() == root.payload_hash

def test_spatial_round_trip_anchor_shape():
    bridge = SpatialTransformBridge()
    ecef = bridge.wgs84_ellipsoidal_to_ecef(-88.0007, 37.9035, 100.0)
    assert all(abs(v) > 1.0 for v in (ecef.x_m, ecef.y_m, ecef.z_m))
    x, y = bridge.slippy_tile(-88.0007, 37.9035, 15)
    assert 0 <= x < 2**15 and 0 <= y < 2**15
