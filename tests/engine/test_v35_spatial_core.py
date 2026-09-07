from engine.v35_spatial_core import build_spatial_tile, export_manifests, validate_spatial_tile
from ptdt_v35_core.provenance import SourceRecord, TransformRecord


def test_scene_state_to_spatial_tile_and_manifests() -> None:
    digest = "a" * 64
    tile = build_spatial_tile(
        {
            "frame_id": "frame-1",
            "crs": "EPSG:2966",
            "vertical_datum": "NAVD88",
            "render_origin": [100.0, 200.0, 0.0],
            "timestamp_utc": "2026-08-16T00:00:00Z",
            "confidence": 0.9,
            "layers": {"terrain": {"type": "dem"}},
        },
        (SourceRecord("survey-1", "survey", sha256=digest),),
        (TransformRecord("transform-1", "tile-derive", (digest,), "b" * 64, {}),),
    )
    assert validate_spatial_tile(tile) == ()
    manifests = export_manifests(tile)
    assert manifests["i3s"]["keyless"] is True
    assert manifests["usd"]["tile_id"] == "frame-1"
