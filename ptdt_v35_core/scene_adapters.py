from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass

from .spatial_tile import SpatialTile


@dataclass(frozen=True, slots=True)
class AdapterManifest:
    adapter: str
    tile_id: str
    content_sha256: str
    required_runtime: str
    keyless: bool = True


class SceneAdapter(ABC):
    name: str
    required_runtime: str

    @abstractmethod
    def validate(self, tile: SpatialTile) -> list[str]:
        raise NotImplementedError

    def manifest(self, tile: SpatialTile) -> AdapterManifest:
        errors = self.validate(tile)
        if errors:
            raise ValueError("; ".join(errors))
        return AdapterManifest(self.name, tile.tile_id, tile.content_sha256, self.required_runtime)


class _BaseAdapter(SceneAdapter):
    def validate(self, tile: SpatialTile) -> list[str]:
        errors: list[str] = []
        if not tile.crs:
            errors.append("missing CRS")
        if not tile.vertical_datum:
            errors.append("missing vertical datum")
        if not tile.provenance.sources:
            errors.append("missing provenance sources")
        if not tile.provenance.transforms and tile.layers:
            errors.append("derived layers require transform provenance")
        return errors


class MVTAdapter(_BaseAdapter):
    name = "mvt"
    required_runtime = "maplibre-or-mvt-client"


class I3SAdapter(_BaseAdapter):
    name = "i3s"
    required_runtime = "i3s-slpk-reader"


class USDAdapter(_BaseAdapter):
    name = "usd"
    required_runtime = "openusd"


class WebGPUAdapter(_BaseAdapter):
    name = "webgpu"
    required_runtime = "webgpu"


class UnityAdapter(_BaseAdapter):
    name = "unity"
    required_runtime = "unity-runtime-optional"


class UnrealAdapter(_BaseAdapter):
    name = "unreal"
    required_runtime = "unreal-runtime-optional"


def validate_all_adapters(tile: SpatialTile) -> dict[str, AdapterManifest]:
    adapters: tuple[SceneAdapter, ...] = (MVTAdapter(), I3SAdapter(), USDAdapter(), WebGPUAdapter(), UnityAdapter(), UnrealAdapter())
    return {adapter.name: adapter.manifest(tile) for adapter in adapters}
