"""PTDT → USD SceneState Generator (presentation only)."""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from hashlib import sha256
from typing import Any


@dataclass
class UsdPrimRef:
    path: str
    type_name: str
    asset_path: str | None = None
    translate: tuple[float, float, float] = (0.0, 0.0, 0.0)
    metadata: dict[str, Any] = field(default_factory=dict)


@dataclass
class PtdtSceneState:
    stage_up_axis: str = "Y"
    meters_per_unit: float = 1.0
    vertical_datum: str = "NAVD88"
    crs: str = "EPSG:2966"
    render_origin_xy: tuple[float, float] = (0.0, 0.0)
    prims: list[UsdPrimRef] = field(default_factory=list)
    pipeline_state_version: str = "v33.0"
    authority: str = "PRESENTATION"


class UsdSceneStateGenerator:
    def __init__(self, render_origin_xy: tuple[float, float] = (0.0, 0.0)) -> None:
        self.render_origin_xy = render_origin_xy

    def build_default_bonebank(self) -> PtdtSceneState:
        ox, oy = self.render_origin_xy
        prims = [
            UsdPrimRef(
                path="/World/Terrain",
                type_name="Mesh",
                asset_path="data/cog/bonebank_dem_navd88.tif",
                metadata={"role": "DEM", "vertical_datum": "NAVD88"},
            ),
            UsdPrimRef(
                path="/World/Hydraulics/WseOverlay",
                type_name="Xform",
                metadata={"role": "HEC-RAS-WSE", "stream": "ptdt:scene:hydraulics"},
            ),
            UsdPrimRef(
                path="/World/Buildings",
                type_name="Xform",
                asset_path="data/geo/bonebank_buildings.usd",
                metadata={"role": "OSM_extrusion"},
            ),
            UsdPrimRef(
                path="/World/Cameras/Cinematic_A",
                type_name="Camera",
                translate=(ox, 50.0, oy),
                metadata={"role": "cinematic"},
            ),
        ]
        return PtdtSceneState(render_origin_xy=self.render_origin_xy, prims=prims)

    def to_dict(self, state: PtdtSceneState) -> dict[str, Any]:
        return {
            "stageUpAxis": state.stage_up_axis,
            "metersPerUnit": state.meters_per_unit,
            "verticalDatum": state.vertical_datum,
            "crs": state.crs,
            "renderOriginXY": list(state.render_origin_xy),
            "pipelineStateVersion": state.pipeline_state_version,
            "authority": state.authority,
            "prims": [
                {
                    "path": p.path,
                    "type": p.type_name,
                    "asset": p.asset_path,
                    "translate": list(p.translate),
                    "metadata": p.metadata,
                }
                for p in state.prims
            ],
        }

    def to_usda(self, state: PtdtSceneState) -> str:
        lines = [
            "#usda 1.0",
            f'( doc = "PTDT SceneState {state.pipeline_state_version}" )',
            "",
            'def Xform "World" {',
        ]
        for p in state.prims:
            name = p.path.rstrip("/").split("/")[-1]
            lines.append(f'  def {p.type_name} "{name}" {{')
            tx, ty, tz = p.translate
            lines.append(f"    double3 xformOp:translate = ({tx}, {ty}, {tz})")
            lines.append('    uniform token[] xformOpOrder = ["xformOp:translate"]')
            if p.asset_path:
                lines.append(f"    # asset ref: {p.asset_path}")
            lines.append("  }")
        lines.append("}")
        lines.append("")
        return chr(10).join(lines)

    def seal(self, state: PtdtSceneState) -> str:
        body = json.dumps(self.to_dict(state), sort_keys=True, separators=(",", ":"))
        return sha256(body.encode("utf-8")).hexdigest()
