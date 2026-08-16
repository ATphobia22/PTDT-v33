import * as THREE from 'three';

export interface CRSContext {
  engineering_epsg: number;
  visualization_epsg: number;
  vertical_datum: string;
  bounds: { min_lon: number; max_lon: number; min_lat: number; max_lat: number };
}

export interface SiteAnchors {
  bfe_navd88_ft: number;
  lag_navd88_ft: number;
  lowest_in_point_ft: number;
}

export interface StructureProfile {
  id: string;
  aabb2D: [number, number, number, number]; // [minX, minY, maxX, maxY]
  ground_elev_navd88: number;
  lag_navd88_ft: number;
  properties: Record<string, any>;
  flooded: boolean;
  subsurfaceBreach: boolean;
  freeboardMarginFt: number;
  meshRef?: THREE.Mesh | null;
  alertCylinderRef?: THREE.Mesh | null;
  isInundated?: boolean;
  isSubsurfaceBreached?: boolean;
}

export interface TwinVersion1State {
  crs: CRSContext;
  anchors: SiteAnchors;
  structures: Map<string, StructureProfile>;
  activeHistoricalLayerId: string | null;
  historicalOpacity: number;
  oilWellBufferDistanceFt: number;
  systemAlertLevel: 'NOMINAL' | 'ALERT' | 'CRITICAL';
  telemetryLogs: string[];
}

export interface HydrologicCell {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  waterSurfaceElevNavd88: number;
}

export function createTwinVersion1State(): TwinVersion1State {
  return {
    crs: {
      engineering_epsg: 2966, // Standardized NAD83 Indiana West State Plane
      visualization_epsg: 4326,
      vertical_datum: "NAVD88",
      bounds: { min_lon: -88.09720, max_lon: -87.68837, min_lat: 37.77168, max_lat: 38.23030 }
    },
    anchors: {
      bfe_navd88_ft: 375.0,
      lag_navd88_ft: 377.2,
      lowest_in_point_ft: 320.0
    },
    structures: new Map(),
    activeHistoricalLayerId: null,
    historicalOpacity: 0.75,
    oilWellBufferDistanceFt: 200.0,
    systemAlertLevel: 'NOMINAL',
    telemetryLogs: ["Version 1 Twin Core System initialized. Standby for spatial binding pipeline..."]
  };
}

export function transformGeoToGridUnits(lon: number, lat: number): { x: number; y: number } {
  const localOriginLon = -87.9354;
  const localOriginLat = 38.1294;
  const ftPerDegreeLon = 286745.4;
  const ftPerDegreeLat = 364173.2;
  return {
    x: (lon - localOriginLon) * ftPerDegreeLon,
    y: (lat - localOriginLat) * ftPerDegreeLat
  };
}

export function projectGeodeticToStatePlane(lon: number, lat: number, crs: CRSContext): { x: number; y: number } {
  const localOriginLon = -87.9354; // default hardcode or from crs
  const localOriginLat = 38.1294;
  const ftPerDegreeLon = 286745.4;
  const ftPerDegreeLat = 364173.2;
  return {
    x: (lon - localOriginLon) * ftPerDegreeLon,
    y: (lat - localOriginLat) * ftPerDegreeLat
  };
}

export function registerFootprintsFromGeoJson(state: TwinVersion1State, geojson: any): void {
  if (!geojson || geojson.type !== "FeatureCollection" || !geojson.features) {
    state.telemetryLogs.push("[ERROR] Invalid features schema encountered.");
    return;
  }

  geojson.features.forEach((feat: any) => {
    const { id, properties, geometry } = feat;
    if (!geometry || (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon")) return;

    const key = id || properties?.parcel_id || properties?.REGRID_ID || `str_${Math.random().toString(36).substr(2, 5)}`;
    const coordinateRings = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
    if (!coordinateRings || coordinateRings.length === 0 || coordinateRings[0].length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    coordinateRings[0].forEach((coord: number[]) => {
      const pt = transformGeoToGridUnits(coord[0], coord[1]);
      if (pt.x < minX) minX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y > maxY) maxY = pt.y;
    });

    const lag = properties?.lag_navd88_ft || state.anchors.lag_navd88_ft;
    const profile: StructureProfile = {
      id: String(key),
      aabb2D: [minX, minY, maxX, maxY],
      ground_elev_navd88: properties?.ground_elev_navd88 || (lag - 0.25),
      lag_navd88_ft: lag,
      properties: properties || {},
      flooded: false,
      subsurfaceBreach: false,
      freeboardMarginFt: lag - state.anchors.bfe_navd88_ft
    };

    state.structures.set(profile.id, profile);
  });

  state.telemetryLogs.push(`Registry Synchronized: Ingested ${state.structures.size} authoritative features.`);
}

export function evaluateHydrologicIntersections(state: TwinVersion1State, floodCells: HydrologicCell[]): void {
  let floodCount = 0;
  state.structures.forEach((structure) => {
    let floodedState = false;
    const [sMinX, sMinY, sMaxX, sMaxY] = structure.aabb2D;
    for (const cell of floodCells) {
      const isOverlapping = sMinX <= cell.maxX && sMaxX >= cell.minX && sMinY <= cell.maxY && sMaxY >= cell.minY;
      if (isOverlapping && cell.waterSurfaceElevNavd88 > structure.ground_elev_navd88) {
        floodedState = true;
        break;
      }
    }
    structure.flooded = floodedState;
    if (floodedState) floodCount++;
  });
  
  state.telemetryLogs.push("AABB Hydrologic collision framework sweep completed.");
  evaluateSystemRiskState(state);
}

export function evaluateSubsurfaceProximity(state: TwinVersion1State, oilWellsArray: any[]): void {
  if (!oilWellsArray || oilWellsArray.length === 0) return;

  state.structures.forEach((structure) => {
    let breached = false;
    const centerX = (structure.aabb2D[0] + structure.aabb2D[2]) / 2;
    const centerY = (structure.aabb2D[1] + structure.aabb2D[3]) / 2;

    for (const well of oilWellsArray) {
      const wellCoord = transformGeoToGridUnits(well.longitude, well.latitude);
      const distanceFeet = Math.sqrt(Math.pow(centerX - wellCoord.x, 2) + Math.pow(centerY - wellCoord.y, 2));
      if (distanceFeet <= state.oilWellBufferDistanceFt) {
        breached = true;
        break;
      }
    }
    structure.subsurfaceBreach = breached;
  });

  state.telemetryLogs.push("IDNR Subsurface protection proximity verification matrix refreshed.");
  evaluateSystemRiskState(state);
}

function evaluateSystemRiskState(state: TwinVersion1State): void {
  let floodCount = 0;
  let wellCount = 0;

  state.structures.forEach((s) => {
    if (s.flooded) floodCount++;
    if (s.subsurfaceBreach) wellCount++;
  });

  if (floodCount > 0) state.systemAlertLevel = 'CRITICAL';
  else if (wellCount > 0) state.systemAlertLevel = 'ALERT';
  else state.systemAlertLevel = 'NOMINAL';
}

export interface GamePresentationState {
  crs: CRSContext;
  structures: Map<string, StructureProfile>;
  wells: Map<string, any>;
  floodGrid: Map<string, any>;
  activeHistoricalLayerId: string | null;
  globalHistoricalOpacity: number;
  simulationTimeScale: number;
  isStormActive: boolean;
  activeWaterStageGageRead: number;
  systemThreatMatrixLevel: 'NOMINAL' | 'ELEVATED' | 'CRITICAL';
  telemetryStream: string[];
}

export function createTripleAEngineState(): GamePresentationState {
  return {
    crs: {
      engineering_epsg: 2966,
      visualization_epsg: 4326,
      vertical_datum: "NAVD88",
      bounds: { min_lon: -88.09720, max_lon: -87.68837, min_lat: 37.77168, max_lat: 38.23030 }
    },
    structures: new Map(),
    wells: new Map(),
    floodGrid: new Map(),
    activeHistoricalLayerId: null,
    globalHistoricalOpacity: 0.80,
    simulationTimeScale: 1.0,
    isStormActive: true,
    activeWaterStageGageRead: 14.2,
    systemThreatMatrixLevel: 'NOMINAL',
    telemetryStream: [
      "AAA Tactical Engineering Suite Alpha Boot Completed.",
      "EPSG:2966 Projection Engine locked to Point Township / Bonebank grid matrix."
    ]
  };
}
