import { BONEBANK_SITE } from "../lib/siteConstants";

export interface GeoJSONFeature {
  type: "Feature";
  properties: Record<string, any> | null;
  geometry: {
    type: string;
    coordinates: unknown;
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export type BBox = [number, number, number, number]; // [xmin, ymin, xmax, ymax] WGS84

const EMPTY_FC: GeoJSONFeatureCollection = { type: "FeatureCollection", features: [] };

const DEFAULT_BUILDING_HEIGHT_M = 6.5; // ~21 ft single-story + roof
const METERS_PER_FOOT = 0.3048;

function isValidBBox(bbox: BBox): boolean {
  return (
    Array.isArray(bbox) &&
    bbox.length === 4 &&
    bbox.every((n) => typeof n === "number" && Number.isFinite(n)) &&
    bbox[0] < bbox[2] &&
    bbox[1] < bbox[3]
  );
}

/** Point-in-bbox test for Polygon/MultiPolygon centroids (simple envelope filter). */
function featureIntersectsBBox(f: GeoJSONFeature, bbox: BBox): boolean {
  const geom = f.geometry;
  if (!geom || !geom.coordinates) return false;

  const coords: number[][] = [];
  const walk = (c: unknown): void => {
    if (Array.isArray(c) && c.length >= 2 && typeof c[0] === "number") {
      coords.push(c as number[]);
    } else if (Array.isArray(c)) {
      c.forEach(walk);
    }
  };

  walk(geom.coordinates);
  if (coords.length === 0) return false;

  // Any vertex inside or envelope overlap
  for (const [x, y] of coords) {
    if (x >= bbox[0] && x <= bbox[2] && y >= bbox[1] && y <= bbox[3]) return true;
  }

  // Envelope overlap fallback
  const xs = coords.map((c) => c[0]);
  const ys = coords.map((c) => c[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return !(maxX < bbox[0] || minX > bbox[2] || maxY < bbox[1] || minY > bbox[3]);
}

function clipToBBox(
  fc: GeoJSONFeatureCollection,
  bbox: BBox
): GeoJSONFeatureCollection {
  if (!isValidBBox(bbox)) return EMPTY_FC;
  return {
    type: "FeatureCollection",
    features: fc.features.filter((f) => featureIntersectsBBox(f, bbox)),
  };
}

/** Normalize height (meters) for MapLibre fill-extrusion-height. */
export function normalizeBuildingHeight(props: Record<string, any> | null): number {
  if (!props) return DEFAULT_BUILDING_HEIGHT_M;

  // Overture / Microsoft common keys
  const h =
    props.height ??
    props.Height ??
    props.building_height ??
    props["building:height"] ??
    props.eaveheight ??
    props.EaveHeight;

  if (typeof h === "number" && Number.isFinite(h) && h > 0) {
    // Heuristic: values > 100 are almost certainly feet
    return h > 100 ? h * METERS_PER_FOOT : h;
  }

  if (typeof h === "string") {
    const parsed = parseFloat(h);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed > 100 ? parsed * METERS_PER_FOOT : parsed;
    }
  }

  const levels =
    props.levels ??
    props["building:levels"] ??
    props.BuildingLevels ??
    props.num_floors;

  if (typeof levels === "number" && levels > 0) {
    return levels * 3.2; // ~10.5 ft floor-to-floor
  }

  if (typeof levels === "string") {
    const n = parseFloat(levels);
    if (Number.isFinite(n) && n > 0) return n * 3.2;
  }

  return DEFAULT_BUILDING_HEIGHT_M;
}

function enrichHeights(fc: GeoJSONFeatureCollection): GeoJSONFeatureCollection {
  return {
    type: "FeatureCollection",
    features: fc.features.map((f) => ({
      ...f,
      properties: {
        ...(f.properties ?? {}),
        height_m: normalizeBuildingHeight(f.properties),
        source: (f.properties as any)?.source ?? "unknown",
      },
    })),
  };
}

/** Local offline sample for 13101 Bonebank Rd vicinity (deterministic CI / no-network). */
export function getLocalBonebankBuildings(): GeoJSONFeatureCollection {
  // Minimal representative footprints near BONEBANK_SITE center
  const [lon, lat] = BONEBANK_SITE.center;
  const d = 0.00035; // ~35 m

  const features: GeoJSONFeature[] = [
    {
      type: "Feature",
      properties: {
        id: "bonebank-primary",
        name: "13101 Bonebank Rd Primary Structure",
        height_m: 7.2,
        levels: 1,
        source: "local-sample",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lon - d * 1.2, lat - d * 0.8],
            [lon + d * 1.4, lat - d * 0.8],
            [lon + d * 1.4, lat + d * 0.9],
            [lon - d * 1.2, lat + d * 0.9],
            [lon - d * 1.2, lat - d * 0.8],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "bonebank-outbuilding",
        name: "Accessory Structure",
        height_m: 4.5,
        levels: 1,
        source: "local-sample",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lon + d * 1.8, lat - d * 0.4],
            [lon + d * 2.6, lat - d * 0.4],
            [lon + d * 2.6, lat + d * 0.3],
            [lon + d * 1.8, lat + d * 0.3],
            [lon + d * 1.8, lat - d * 0.4],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: {
        id: "bonebank-neighbor-n",
        name: "Neighbor North",
        height_m: 6.8,
        levels: 1,
        source: "local-sample",
      },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [lon - d * 0.9, lat + d * 2.1],
            [lon + d * 0.7, lat + d * 2.1],
            [lon + d * 0.7, lat + d * 3.2],
            [lon - d * 0.9, lat + d * 3.2],
            [lon - d * 0.9, lat + d * 2.1],
          ],
        ],
      },
    },
  ];

  return { type: "FeatureCollection", features };
}

/**
 * Microsoft USBuildingFootprints — Indiana statewide GeoJSON is large.
 * We never download the full state file at runtime; instead we rely on a
 * pre-clipped site sample or a server-side proxy that streams a bbox filter.
 * Public release: https://github.com/microsoft/USBuildingFootprints
 */
const MS_INDIANA_CLIP_URL =
  process.env.MS_BUILDINGS_CLIP_URL ??
  "/data/buildings/indiana_bonebank_clip.geojson";

async function fetchMicrosoftClip(bbox: BBox): Promise<GeoJSONFeatureCollection> {
  try {
    const res = await fetch(MS_INDIANA_CLIP_URL);
    if (!res.ok) throw new Error(`Microsoft clip HTTP ${res.status}`);
    const data = (await res.json()) as GeoJSONFeatureCollection;
    if (!data?.features) return EMPTY_FC;
    return enrichHeights(clipToBBox(data, bbox));
  } catch (err) {
    console.warn("[buildingsService] Microsoft clip unavailable:", err);
    return EMPTY_FC;
  }
}

/**
 * Overture Maps buildings — prefer server proxy that queries PMTiles / GeoParquet
 * by bbox. Client never needs an API key.
 */
async function fetchOvertureBuildings(bbox: BBox): Promise<GeoJSONFeatureCollection> {
  if (!isValidBBox(bbox)) return EMPTY_FC;
  const params = new URLSearchParams({
    xmin: String(bbox[0]),
    ymin: String(bbox[1]),
    xmax: String(bbox[2]),
    ymax: String(bbox[3]),
  });

  try {
    const res = await fetch(`/api/gis/buildings/overture?${params}`);
    if (!res.ok) throw new Error(`Overture proxy HTTP ${res.status}`);
    const data = (await res.json()) as GeoJSONFeatureCollection;
    if (!data?.features) return EMPTY_FC;
    return enrichHeights(data);
  } catch (err) {
    console.warn("[buildingsService] Overture proxy unavailable:", err);
    return EMPTY_FC;
  }
}

/**
 * Primary entry: resolve buildings for a bbox.
 * Falls back to local Bonebank sample when remote sources are empty / offline.
 */
export async function fetchBuildings(
  bbox: BBox = BONEBANK_SITE.bbox
): Promise<GeoJSONFeatureCollection> {
  if (!isValidBBox(bbox)) {
    return enrichHeights(getLocalBonebankBuildings());
  }

  // Prefer Overture (has height attributes more often)
  const overture = await fetchOvertureBuildings(bbox);
  if (overture.features.length > 0) {
    return overture;
  }

  // Microsoft clip
  const ms = await fetchMicrosoftClip(bbox);
  if (ms.features.length > 0) {
    return ms;
  }

  // Deterministic offline sample
  return enrichHeights(clipToBBox(getLocalBonebankBuildings(), bbox));
}

/** Convenience for the canonical site. */
export async function fetchBonebankBuildings(): Promise<GeoJSONFeatureCollection> {
  return fetchBuildings(BONEBANK_SITE.bbox);
}
