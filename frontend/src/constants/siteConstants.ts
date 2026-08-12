/** Locked sovereign constants — single source of truth. NAVD88 only. */
export const BONEBANK_SITE = {
  name: '13101 Bonebank Road',
  county: 'Posey',
  state: 'IN',
  section: '35',
  township: 'T7S',
  range: 'R14W',
  lat: 37.9035,
  lon: -88.0007,
  center: [-88.0007, 37.9035] as [number, number],
  zoom: 16,
  bbox: [-88.035, 37.820, -87.970, 37.870] as [number, number, number, number],
  bfe_ft_navd88: 375.0,
  lag_ft_navd88: 377.2,
  berm_crest_ft_navd88: 379.8,
  house_floor_ft_navd88: 378.45,
  freeboard_vector_ft: 4.8,
  compensatory_storage_factor: 1.2,
  bcr: 1.41,
  crs: 'EPSG:2966 (IN West State Plane US Ft) / NAVD88',
  usgs_station: '03378500 (Wabash River at New Harmony, IN)',
  authority_presentation: 'Presentation plate only — never hydraulic',
  authority_hydro: 'Archimedes + HEC-RAS exclusive',
} as const;

export const JURISDICTION_RULES = {
  INDIANA: {
    name: 'Indiana DNR & FEMA Region V',
    code: 'IDNR 312 IAC 10-5 / 44 CFR Part 70',
    no_rise_threshold_ft: 0.0,
    compensatory_ratio: 1.2,
    freeboard_req_ft: 2.0,
  },
  ILLINOIS: {
    name: 'Illinois DNR Office of Water Resources',
    code: '17 Ill. Adm. Code Part 3700 / Part 3708',
    no_rise_threshold_ft: 0.1,
    compensatory_ratio: 1.0,
    freeboard_req_ft: 1.0,
  },
  KENTUCKY: {
    name: 'Kentucky Energy & Environment Cabinet',
    code: '401 KAR 4:060 Floodplain Management',
    no_rise_threshold_ft: 0.0,
    compensatory_ratio: 1.0,
    freeboard_req_ft: 1.0,
  },
} as const;

/** Indiana statewide imagery / elevation service endpoints (no API keys). */
export const INDIANA_GIS_SERVICES = {
  imagery_wmts: 'https://imagery.indianamap.org/arcgis/rest/services/Imagery/Indiana_Current_Imagery/MapServer/WMTS/1.0.0/WMTSCapabilities.xml',
  elevation_wms: 'https://elevation.indianamap.org/arcgis/rest/services/Elevation/Indiana_Elevation_2016_2020/ImageServer',
  flood_xs_rest: 'https://maps.indiana.edu/arcgis/rest/services/Hydrology/Flood_Cross_Sections_Effective/MapServer',
  usgs_24k_index: '/data/geo/24K_USGS_Quadrangle_Boundaries.csv',
  cog_dem: '/data/cog/bonebank_dem_navd88.tif',
  cog_ortho: '/data/cog/bonebank_ortho_2023.tif',
  cog_flood_100yr: '/data/cog/ras_100yr_depth.tif',
} as const;
