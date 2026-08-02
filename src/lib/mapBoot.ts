/**
 * One-call MapLibre boot for Bonebank: Terrarium terrain + local building extrusions.
 * Use after map 'load' event.
 */
import type { Map as MaplibreMap } from "maplibre-gl";
import {
  ensureTerrariumTerrain,
  addBonebankBuildingExtrusions,
  flyToBonebank,
} from "./mapTerrainAndBuildings";
import { BONEBANK_SITE } from "./siteConstants";

export async function bootBonebankMapLayers(
  map: MaplibreMap,
  opts?: { fly?: boolean; exaggeration?: number }
): Promise<{ buildings: number }> {
  ensureTerrariumTerrain(map, { exaggeration: opts?.exaggeration ?? 1.35 });
  let buildings = 0;
  try {
    buildings = await addBonebankBuildingExtrusions(map);
  } catch (e) {
    console.warn("[mapBoot] buildings layer skipped", e);
  }
  if (opts?.fly !== false) {
    flyToBonebank(map);
  }
  return { buildings };
}

export function bonebankCamera(): {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
} {
  return {
    center: BONEBANK_SITE.center,
    zoom: BONEBANK_SITE.zoom,
    pitch: 58,
    bearing: 28,
  };
}
