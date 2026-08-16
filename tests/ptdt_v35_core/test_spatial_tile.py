from ptdt_v35_core.provenance import ProvenanceManifest, SourceRecord, TransformRecord
from ptdt_v35_core.spatial_tile import SpatialTile


def manifest() -> ProvenanceManifest:
    source = SourceRecord("lidar-1", "lidar", sha256="a" * 64)
    transform = TransformRecord("t1", "normalize", ("a" * 64,), "b" * 64, {"datum": "NAVD88"})
    return ProvenanceManifest((source,), (transform,))


def test_spatial_tile_hash_is_deterministic() -> None:
    tile = SpatialTile("z15-1", 1, "EPSG:2966", "NAVD88", (1.0, 2.0, 3.0, 4.0), manifest(), 0.95, "2026-08-16T00:00:00Z", {"terrain": {"type": "dem"}})
    assert tile.content_sha256 == SpatialTile.from_mapping(tile.to_mapping(), tile.provenance).content_sha256


def test_invalid_confidence_rejected() -> None:
    try:
        SpatialTile("x", 1, "EPSG:2966", "NAVD88", (0.0, 0.0, 1.0, 1.0), manifest(), 1.1)
    except ValueError:
        return
    raise AssertionError("invalid confidence accepted")
