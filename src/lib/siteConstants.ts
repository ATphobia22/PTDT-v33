/**
 * Anchor site: 13101 Bonebank Road, Point Township, Posey County, Indiana
 * Section 35, T7S, R14W — NAVD88 primary vertical datum
 *
 * Provenance (docs):
 * - Think GIS / Posey parcel (owner TUCKER, 2.0 ac, class 511)
 * - LOMA Package Checklist: LAG 377.2 / BFE 375.0 / Community 180194 / FIRM 18129C0215D
 * - NAVD88 Architecture: FFE 382.5 ft; reject NGVD29 (~3 ft systematic shift)
 * - IDNR Floodway checklist: compensatory storage V_cut >= 1.20 * V_fill (312 IAC 10)
 * - Indiana Floodplain Standards: dual layer NFHL(FEMA) + BAFM(IDNR) + INFIP/FARA
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
  acreage: 2.0,
  taxPropertyClass: "511",
  /** Partial state parcel id from Think GIS */
  stateParcelPrefix: "65-19",

  lat: 37.83,
  lon: -88.02,
  center: [-88.02, 37.83] as [number, number],
  zoom: 16,
  bbox: [-88.035, 37.82, -88.005, 37.84] as [number, number, number, number],

  /** FEMA / INFIP baseline BFE (ft NAVD88) */
  bfe_ft_navd88: 375.0,
  /** Lowest adjacent grade (ft NAVD88) — certified LiDAR path */
  lag_ft_navd88: 377.2,
  /** Lowest finished floor elevation (ft NAVD88) — NAVD88 Architecture doc */
  ffe_ft_navd88: 382.5,
  /** LAG - BFE */
  clearance_ft: 2.2,

  /** Primary Wabash calibration gauge */
  usgs_gauge: "03378500",
  usgs_gauge_name: "Wabash River at New Harmony, IN",
  /** Ohio River / Myers Lock — dual-gauge Tri-State network */
  usgs_gauge_ohio: "03322000",
  usgs_gauge_ohio_name: "Ohio River at John T. Myers L&D",
  nws_lid_myers: "UNWK2",

  /** FEMA community & panel (LOMA checklist) */
  fema_community_number: "180194",
  fema_community_name: "Posey County & Unincorporated Areas",
  firm_panel: "18129C0215D",

  /** IDNR 312 IAC 10 compensatory cut/fill factor */
  compensatory_storage_factor: 1.2,

  vertical_datum: "NAVD88" as const,
  horizontal_crs: "WGS84" as const,
} as const;

export type BonebankSite = typeof BONEBANK_SITE;

/** Approximate NWS flood categories — USGS 03378500 (New Harmony) */
export const NEW_HARMONY_FLOOD_BANDS = {
  action_ft: 15.0,
  minor_ft: 16.0,
  moderate_ft: 20.0,
  major_ft: 25.0,
} as const;

/** Approximate NWS categories — USGS 03322000 / UNWK2 (John T. Myers) */
export const MYERS_FLOOD_BANDS = {
  action_ft: 33.0,
  minor_ft: 37.0,
  moderate_ft: 49.0,
  major_ft: 60.0,
} as const;

/** Scenario stages for BASE / CURRENT / FORECAST strip (gage height ft @ 03378500) */
export const FLOOD_SCENARIOS = {
  base_dry_ft: 3.0,
  /** Replaced at runtime by live USGS when available */
  current_seed_ft: 2.92,
  /** Illustrative moderate-event forecast for decision support UI only */
  forecast_moderate_ft: 20.3,
} as const;
