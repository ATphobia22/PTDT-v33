/**
 * Agency-grade twin math — NAVD88 vertical framing, clearance, Manning, Horn sample.
 * For visualization and engineering context. Not a regulatory flood determination.
 */
import { BONEBANK_SITE } from "./siteConstants";
import { hornSlope, type ElevMatrix3 } from "./HornTerrainEngine";

export const FT_TO_M = 0.3048;
export const M_TO_FT = 1 / FT_TO_M;

/** Canonical site elevations (ft NAVD88) */
export const SITE_ELEV_FT = {
  bfe: BONEBANK_SITE.bfe_ft_navd88,
  lag: BONEBANK_SITE.lag_ft_navd88,
  clearance: BONEBANK_SITE.lag_ft_navd88 - BONEBANK_SITE.bfe_ft_navd88,
} as const;

/**
 * Twin local Z convention: BFE plane = 0 m
 * Positive Z = above BFE (toward LAG / freeboard).
 */
export function elevFtNavd88ToTwinZ_m(elevFt: number): number {
  return (elevFt - SITE_ELEV_FT.bfe) * FT_TO_M;
}

export function twinZ_mToElevFtNavd88(zM: number): number {
  return SITE_ELEV_FT.bfe + zM * M_TO_FT;
}

export function lagTwinZ_m(): number {
  return elevFtNavd88ToTwinZ_m(SITE_ELEV_FT.lag);
}

export function bfeTwinZ_m(): number {
  return 0;
}

/**
 * Heuristic gauge stage (ft) → site water-surface estimate (ft NAVD88).
 * Documented bridge only — production should use published rating + datum.
 */
export function estimateWaterSurfaceFtNavd88(
  stageFt: number | null | undefined,
  datumOffsetFt = 365.0
): number {
  if (stageFt == null || !Number.isFinite(stageFt)) {
    return SITE_ELEV_FT.bfe - 2.0;
  }
  return datumOffsetFt + stageFt;
}

export type FloodBand = "CLEAR" | "WATCH" | "WARNING" | "CRITICAL";

export function classifyFloodBand(waterSurfaceFt: number): FloodBand {
  const bfe = SITE_ELEV_FT.bfe;
  if (waterSurfaceFt >= bfe) return "CRITICAL";
  if (waterSurfaceFt >= bfe - 2.0) return "WARNING";
  if (waterSurfaceFt >= bfe - 5.0) return "WATCH";
  return "CLEAR";
}

export function clearanceFt(waterSurfaceFt: number, reference: "BFE" | "LAG" = "LAG"): number {
  const ref = reference === "LAG" ? SITE_ELEV_FT.lag : SITE_ELEV_FT.bfe;
  return ref - waterSurfaceFt;
}

/** Manning open-channel velocity (US customary → ft/s). n, R(ft), S(dimensionless). */
export function manningVelocityFps(n: number, hydraulicRadiusFt: number, slope: number): number {
  if (n <= 0 || hydraulicRadiusFt <= 0 || slope < 0) return 0;
  return (1.486 / n) * Math.pow(hydraulicRadiusFt, 2 / 3) * Math.sqrt(slope);
}

/**
 * Representative 3x3 elevation window (m) near site for Horn demo.
 * Mild floodplain gradient — not a surveyed DEM tile.
 */
export function sampleSiteElevMatrix_m(): ElevMatrix3 {
  const base = SITE_ELEV_FT.lag * FT_TO_M;
  return [
    [base + 0.12, base + 0.15, base + 0.18],
    [base + 0.08, base + 0.1, base + 0.14],
    [base + 0.02, base + 0.05, base + 0.09],
  ];
}

export function siteHornSlope(dxM = 10, dyM = 10) {
  return hornSlope(sampleSiteElevMatrix_m(), dxM, dyM);
}

export interface AgencyProofSnapshot {
  site: string;
  datum: "NAVD88";
  bfe_ft: number;
  lag_ft: number;
  clearance_lag_minus_bfe_ft: number;
  water_surface_ft: number | null;
  clearance_vs_lag_ft: number | null;
  band: FloodBand | null;
  horn: any;
  manning_fps_example: number;
  disclaimer: string;
  standards: string[];
}

export function buildAgencyProofSnapshot(waterSurfaceFt?: number | null): AgencyProofSnapshot {
  const ws = waterSurfaceFt ?? null;
  const horn = siteHornSlope();
  const manning = manningVelocityFps(0.045, 2.0, Math.max(horn.gradient, 0.00015));
  return {
    site: `${BONEBANK_SITE.name}, ${BONEBANK_SITE.county} County, ${BONEBANK_SITE.state}`,
    datum: "NAVD88",
    bfe_ft: SITE_ELEV_FT.bfe,
    lag_ft: SITE_ELEV_FT.lag,
    clearance_lag_minus_bfe_ft: SITE_ELEV_FT.clearance,
    water_surface_ft: ws,
    clearance_vs_lag_ft: ws != null ? clearanceFt(ws, "LAG") : null,
    band: ws != null ? classifyFloodBand(ws) : null,
    horn,
    manning_fps_example: Math.round(manning * 1000) / 1000,
    disclaimer:
      "Digital twin for situational awareness and engineering context only. Not a FEMA FIRM determination, LOMR, or IDNR regulatory product. Confirm BFE/floodplain on official INFIP / MSC sources.",
    standards: [
      "NAVD88 vertical datum",
      "Horn (1981) slope operator",
      "Manning equation (n=0.045 floodplain sample)",
      "FEMA NFIP BFE framing",
      "USGS NWIS stage (03378500) when live",
    ],
  };
}

export default {
  FT_TO_M,
  SITE_ELEV_FT,
  elevFtNavd88ToTwinZ_m,
  lagTwinZ_m,
  estimateWaterSurfaceFtNavd88,
  classifyFloodBand,
  clearanceFt,
  manningVelocityFps,
  siteHornSlope,
  buildAgencyProofSnapshot,
};
