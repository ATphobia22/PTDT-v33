/**
 * Anchor: 13101 Bonebank Road, Point Township, Posey County, Indiana
 * Section 35, T7S, R14W — NAVD88
 */

export const BONEBANK_SITE = {
  name: "13101 Bonebank Road",
  owner: "TUCKER",
  county: "Posey",
  state: "IN",
  city: "Mount Vernon",
  zip: "47620",
  section: "35",
  township: "T7S",
  range: "R14W",
  acreage: 2.06,
  taxPropertyClass: "511",
  /** Posey / project parcel identifiers */
  parcel_id: "65-09-35-200-001.000-009",
  stateParcelPrefix: "65-09",

  /** Survey-grade project coordinates (WGS84) from regulatory packages */
  lat: 37.9035,
  lon: -88.0007,
  center: [-88.0007, 37.9035] as [number, number],
  zoom: 16,
  bbox: [-88.012, 37.895, -87.99, 37.912] as [number, number, number, number],

  bfe_ft_navd88: 375.0,
  lag_ft_navd88: 377.2,
  ffe_ft_navd88: 382.5,
  clearance_ft: 2.2,

  usgs_gauge: "03378500",
  usgs_gauge_name: "Wabash River at New Harmony, IN",
  usgs_gauge_ohio: "03322000",
  usgs_gauge_ohio_name: "Ohio River at John T. Myers L&D",
  nws_lid_myers: "UNWK2",

  fema_community_number: "180194",
  fema_community_name: "Posey County & Unincorporated Areas",
  /** Primary LOMA checklist panel — always re-verify on FEMA MSC (alt cite 18129C0225D) */
  firm_panel: "18129C0215D",
  firm_panel_alt_cited: "18129C0225D",

  compensatory_storage_factor: 1.2,
  vertical_datum: "NAVD88" as const,
  horizontal_crs: "WGS84" as const,
} as const;

export type BonebankSite = typeof BONEBANK_SITE;

export const NEW_HARMONY_FLOOD_BANDS = {
  action_ft: 15.0,
  minor_ft: 16.0,
  moderate_ft: 20.0,
  major_ft: 25.0,
} as const;

export const MYERS_FLOOD_BANDS = {
  action_ft: 33.0,
  minor_ft: 37.0,
  moderate_ft: 49.0,
  major_ft: 60.0,
} as const;

export const FLOOD_SCENARIOS = {
  base_dry_ft: 3.0,
  current_seed_ft: 2.92,
  forecast_moderate_ft: 20.3,
} as const;
