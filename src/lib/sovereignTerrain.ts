/**
 * PTDT Sovereign Terrain Module
 * - Mapbox Terrain-RGB / Terrarium decode
 * - Optional custom Terrain-RGB encode (for offline tile generation)
 * - Elevation fusion types: EPQS + site anchors + NCAT shifts
 *
 * Regulatory note: EPQS/3DEP and Terrarium are NOT survey-grade LOMA elevations.
 * BONEBANK_SITE.bfe/lag remain the locked regulatory anchors.
 */

import { BONEBANK_SITE } from "./siteConstants";

export type DemEncoding = "mapbox" | "terrarium" | "custom";

/** Mapbox Terrain-RGB: h = -10000 + (R*65536 + G*256 + B) * 0.1 */
export function decodeMapboxTerrainRgb(r: number, g: number, b: number): number {
  return -10000 + (r * 256 * 256 + g * 256 + b) * 0.1;
}

/** Terrarium: h = R*256 + G + B/256 - 32768 */
export function decodeTerrarium(r: number, g: number, b: number): number {
  return r * 256 + g + b / 256 - 32768;
}

/**
 * Encode meters → Mapbox Terrain-RGB (for offline tile pipelines).
 * Inverse of decodeMapboxTerrainRgb.
 */
export function encodeMapboxTerrainRgb(heightM: number): [number, number, number] {
  const n = Math.round((heightM + 10000) / 0.1);
  const clamped = Math.max(0, Math.min(0xffffff, n));
  const r = (clamped >> 16) & 0xff;
  const g = (clamped >> 8) & 0xff;
  const b = clamped & 0xff;
  return [r, g, b];
}

/** Encode meters → Terrarium RGB. */
export function encodeTerrarium(heightM: number): [number, number, number] {
  const v = heightM + 32768;
  const r = Math.floor(v / 256);
  const g = Math.floor(v % 256);
  const b = Math.round((v - Math.floor(v)) * 256);
  return [
    Math.max(0, Math.min(255, r)),
    Math.max(0, Math.min(255, g)),
    Math.max(0, Math.min(255, b)),
  ];
}

export interface ElevationSample {
  lat: number;
  lon: number;
  elevation_ft: number | null;
  elevation_m: number | null;
  source: string;
  units: "Feet" | "Meters";
  as_of: string;
  disclaimer: string;
}

export interface FusedElevation {
  lat: number;
  lon: number;
  epqs_ft: number | null;
  epqs_m: number | null;
  site_lag_ft: number;
  site_bfe_ft: number;
  clearance_vs_bfe_ft: number | null;
  ncat: {
    requested: boolean;
    shift_ft: number | null;
    out_height_ft: number | null;
    note: string;
  };
  fusion_note: string;
  regulatory_anchor: typeof BONEBANK_SITE;
}

export const EPQS_BASE = "https://epqs.nationalmap.gov/v1/json";

export function bonebankDefaultPoint(): { lat: number; lon: number } {
  return { lat: BONEBANK_SITE.lat, lon: BONEBANK_SITE.lon };
}

export const TERRAIN_DISCLAIMER =
  "EPQS/3DEP and Terrarium DEM elevations are interpolated public data, not certified survey. " +
  "Do not use for LOMA/No-Rise without PE and field survey. BFE/LAG anchors are site constants.";
