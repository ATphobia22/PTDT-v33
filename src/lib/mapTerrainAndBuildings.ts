/**
 * MapLibre terrain (Terrarium DEM) + building fill-extrusion helpers.
 * Integrates with /api/terrain/* sovereign terrain module.
 */

import type { Map as MaplibreMap } from "maplibre-gl";
import { BONEBANK_SITE } from "./siteConstants";

export const TERRARIUM_TILES =
  "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";

export function ensureTerrariumTerrain(
  map: MaplibreMap,
  opts?: { exaggeration?: number; maxzoom?: number }
): void {
  const exaggeration = opts?.exaggeration ?? 1.35;
  const maxzoom = opts?.maxzoom ?? 15;

  if (!map.getSource("terrain-dem")) {
    map.addSource("terrain-dem", {
      type: "raster-dem",
      tiles: [TERRARIUM_TILES],
      encoding: "terrarium",
      tileSize: 256,
      maxzoom,
      attribution: "Terrain: AWS Terrain Tiles / Mapzen Terrarium (public)",
    });
  }

  if (!map.getLayer("terrain-hillshade")) {
    try {
      map.addLayer({
        id: "terrain-hillshade",
        type: "hillshade",
        source: "terrain-dem",
        paint: {
          "hillshade-exaggeration": 0.45,
          "hillshade-shadow-color": "#0f172a",
          "hillshade-highlight-color": "#e2e8f0",
        },
      });
    } catch {
      /* */
    }
  }

  map.setTerrain({ source: "terrain-dem", exaggeration });
}

export function clearTerrain(map: MaplibreMap): void {
  try {
    map.setTerrain(null as any);
  } catch {
    /* */
  }
}

export async function addBonebankBuildingExtrusions(
  map: MaplibreMap,
  opts?: { heightMultiplier?: number; opacity?: number }
): Promise<number> {
  const heightMultiplier = opts?.heightMultiplier ?? 1;
  const opacity = opts?.opacity ?? 0.85;

  const res = await fetch(
    `/api/gis/buildings?bbox=${BONEBANK_SITE.bbox.join(",")}`
  );
  if (!res.ok) throw new Error(`buildings ${res.status}`);
  const fc = await res.json();

  if (map.getSource("bonebank-buildings")) {
    (map.getSource("bonebank-buildings") as any).setData(fc);
  } else {
    map.addSource("bonebank-buildings", { type: "geojson", data: fc });
  }

  if (!map.getLayer("bonebank-buildings-extrusion")) {
    map.addLayer({
      id: "bonebank-buildings-extrusion",
      type: "fill-extrusion",
      source: "bonebank-buildings",
      minzoom: 12,
      paint: {
        "fill-extrusion-color": [
          "interpolate",
          ["linear"],
          ["coalesce", ["get", "height_m"], 6.5],
          0,
          "#1e293b",
          8,
          "#334155",
          20,
          "#64748b",
        ],
        "fill-extrusion-height": [
          "*",
          ["coalesce", ["get", "height_m"], 6.5],
          heightMultiplier,
        ],
        "fill-extrusion-base": 0,
        "fill-extrusion-opacity": opacity,
      },
    });
  }

  return Array.isArray(fc.features) ? fc.features.length : 0;
}

/** Apply terrain + Bonebank buildings; optional EPQS fuse probe. */
export async function integrateBonebankTerrainAndBuildings(
  map: MaplibreMap
): Promise<{ buildings: number; fuse?: unknown }> {
  ensureTerrariumTerrain(map);
  const buildings = await addBonebankBuildingExtrusions(map).catch(() => 0);
  map.flyTo({
    center: BONEBANK_SITE.center,
    zoom: BONEBANK_SITE.zoom,
    pitch: 60,
    bearing: 28,
    duration: 2000,
  });
  let fuse: unknown;
  try {
    const r = await fetch(
      `/api/terrain/fuse?lat=${BONEBANK_SITE.lat}&lon=${BONEBANK_SITE.lon}`
    );
    if (r.ok) fuse = await r.json();
  } catch {
    /* */
  }
  return { buildings, fuse };
}

export function flyToBonebank(map: MaplibreMap): void {
  map.flyTo({
    center: BONEBANK_SITE.center,
    zoom: BONEBANK_SITE.zoom,
    pitch: 60,
    bearing: 28,
    duration: 2500,
  });
}
