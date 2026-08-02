/**
 * Canonical Bonebank / Point Township anchors.
 * Single source of truth for HUD, GIS, terrain fuse, and Archimedes.
 */

export const BONEBANK_SITE = {
  name: "13101 Bonebank Road",
  county: "Posey",
  state: "IN",
  section: "35",
  township: "T7S",
  range: "R14W",
  /** WGS84 — site-scale anchor (refine with survey/Think GIS when locked) */
  lat: 37.9035,
  lon: -88.0007,
  center: [-88.0007, 37.9035] as [number, number],
  zoom: 16,
  /** Approximate site AOI [xmin, ymin, xmax, ymax] WGS84 */
  bbox: [-88.02, 37.89, -87.985, 37.92] as [number, number, number, number],
  /** State parcel number style (verify against Posey GIS / Think GIS) */
  parcel_id: "65-09-35-200-001.000-009",
  acres: 2.06,
  owner: "TUCKER",
  /** FEMA community / panel (confirm against current FIRM) */
  fema_community: "180194",
  firm_panel: "18129C0215D",
  vertical_datum: "NAVD88",
  /** Base flood elevation (ft NAVD88) */
  bfe_ft_navd88: 375.0,
  /** Lowest adjacent grade reference (ft NAVD88) */
  lag_ft_navd88: 377.2,
  /** Finished floor elevation reference (ft NAVD88) when used */
  ffe_ft_navd88: 382.5,
  clearance_ft: 2.2,
  compensatory_factor: 1.2,
  usgs_primary: "03378500",
  usgs_secondary: "03322000",
} as const;

export type BonebankSite = typeof BONEBANK_SITE;

export function clearanceFt(): number {
  return BONEBANK_SITE.lag_ft_navd88 - BONEBANK_SITE.bfe_ft_navd88;
}
