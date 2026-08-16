from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from ptdt_v35_core.provenance import ProvenanceManifest, SourceRecord, TransformRecord
from ptdt_v35_core.scene_adapters import validate_all_adapters
from ptdt_v35_core.spatial_tile import SpatialTile


def build_spatial_tile(
    scene_state: Mapping[str, Any],
    sources: tuple[SourceRecord, ...],
    transforms: tuple[TransformRecord, ...],
) -> SpatialTile:
    required = ("frame_id", "crs", "vertical_datum", "render_origin", "timestamp_utc")
    missing = [key for key in required if key not in scene_state]
    if missing:
        raise ValueError(f"missing SceneState fields: {', '.join(missing)}")
    origin = scene_state["render_origin"]
    if not isinstance(origin, (list, tuple)) or len(origin) < 2:
        raise ValueError("SceneState render_origin must contain at least x/y")
    x, y = float(origin[0]), float(origin[1])
    layers = scene_state.get("layers", {})
    confidence = float(scene_state.get("confidence", 1.0))
    return SpatialTile(
        tile_id=str(scene_state["frame_id"]),
        version=1,
        crs=str(scene_state["crs"]),
        vertical_datum=str(scene_state["vertical_datum"]),
        epoch=str(scene_state["timestamp_utc"]),
        bounds=(x, y, x, y),
        confidence=confidence,
        provenance=ProvenanceManifest(sources=sources, transforms=transforms),
        layers=layers,
    )


def validate_spatial_tile(tile: SpatialTile) -> tuple[str, ...]:
    errors: list[str] = []
    if tile.crs != "EPSG:2966":
        errors.append("SceneState CRS must be EPSG:2966")
    if tile.vertical_datum != "NAVD88":
        errors.append("SceneState vertical datum must be NAVD88")
    if not tile.provenance.sources:
        errors.append("tile requires at least one provenance source")
    if tile.layers and not tile.provenance.transforms:
        errors.append("derived layers require at least one provenance transform")
    return tuple(errors)


def export_manifests(tile: SpatialTile) -> dict[str, dict[str, object]]:
    errors = validate_spatial_tile(tile)
    if errors:
        raise ValueError("; ".join(errors))
    return {
        name: {
            "adapter": manifest.adapter,
            "tile_id": manifest.tile_id,
            "content_sha256": manifest.content_sha256,
            "required_runtime": manifest.required_runtime,
            "keyless": manifest.keyless,
        }
        for name, manifest in validate_all_adapters(tile).items()
    }
