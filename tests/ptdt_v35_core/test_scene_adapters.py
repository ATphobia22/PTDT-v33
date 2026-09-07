from ptdt_v35_core.provenance import ProvenanceManifest, SourceRecord, TransformRecord
from ptdt_v35_core.scene_adapters import validate_all_adapters
from ptdt_v35_core.spatial_tile import SpatialTile


def test_all_adapters_emit_keyless_manifests() -> None:
    digest = "a" * 64
    manifest = ProvenanceManifest(
        (SourceRecord("s", "survey", sha256=digest),),
        (TransformRecord("t", "derive", (digest,), "b" * 64, {}),),
    )
    tile = SpatialTile("tile", 1, "EPSG:2966", "NAVD88", (0.0, 0.0, 1.0, 1.0), manifest, 1.0, layers={"mesh": {}})
    result = validate_all_adapters(tile)
    assert set(result) == {"mvt", "i3s", "usd", "webgpu", "unity", "unreal"}
    assert all(item.keyless for item in result.values())
