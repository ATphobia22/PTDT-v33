/**
 * Anchor site: 13101 Bonebank Road, Point Township, Posey County, Indiana
 * Section 35, T7S, R14W — NAVD88 primary vertical datum
 */

export const BONEBANK_SITE = {
  name: "13101 Bonebank Road",
  county: "Posey",
  state: "IN",
  section: "35",
  township: "T7S",
  range: "R14W",
  lat: 37.83,
  lon: -88.02,
  /** Default map center (WGS84) */
  center: [-88.02, 37.83] as [number, number],
  /** Default zoom for site-scale view */
  zoom: 16,
  /** Approximate site bounding box [xmin, ymin, xmax, ymax] WGS84 */
  bbox: [-88.035, 37.82, -88.005, 37.84] as [number, number, number, number],
  /** Base flood elevation (ft NAVD88) — ArchimedesEngine canonical */
  bfe_ft_navd88: 375.0,
  /** Lowest adjacent grade reference (ft NAVD88) */
  lag_ft_navd88: 377.2,
} as const;

export type BonebankSite = typeof BONEBANK_SITE;
