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

function isValidBBox(bbox: BBox): boolean {
  return (
    Array.isArray(bbox) &&
    bbox.length === 4 &&
    bbox.every((n) => typeof n === "number" && Number.isFinite(n))
  );
}

async function fetchGeoJson(url: string, label: string): Promise<GeoJSONFeatureCollection> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${label} HTTP ${res.status}`);
    const data = (await res.json()) as GeoJSONFeatureCollection;
    if (!data || data.type !== "FeatureCollection" || !Array.isArray(data.features)) {
      return EMPTY_FC;
    }
    return data;
  } catch (error) {
    console.error(`${label} Error:`, error);
    return EMPTY_FC;
  }
}

export async function fetchFemaFloodZones(bbox: BBox): Promise<GeoJSONFeatureCollection> {
  if (!isValidBBox(bbox)) return EMPTY_FC;
  const params = new URLSearchParams({ bbox: bbox.join(",") });
  return fetchGeoJson(`/api/fema-flood-zones?${params}`, "FEMA");
}

export async function fetchParcels(bbox: BBox): Promise<GeoJSONFeatureCollection> {
  if (!isValidBBox(bbox)) return EMPTY_FC;
  const [xmin, ymin, xmax, ymax] = bbox;
  const params = new URLSearchParams({
    xmin: String(xmin),
    ymin: String(ymin),
    xmax: String(xmax),
    ymax: String(ymax),
  });
  return fetchGeoJson(`/api/gis/parcels?${params}`, "Parcels");
}

export async function fetchBafm(bbox: BBox): Promise<GeoJSONFeatureCollection> {
  if (!isValidBBox(bbox)) return EMPTY_FC;
  const [xmin, ymin, xmax, ymax] = bbox;
  const params = new URLSearchParams({
    xmin: String(xmin),
    ymin: String(ymin),
    xmax: String(xmax),
    ymax: String(ymax),
  });
  return fetchGeoJson(`/api/gis/bafm?${params}`, "BAFM");
}

export async function fetchBuildings(bbox: BBox): Promise<GeoJSONFeatureCollection> {
  if (!isValidBBox(bbox)) return EMPTY_FC;
  const [xmin, ymin, xmax, ymax] = bbox;
  const params = new URLSearchParams({
    xmin: String(xmin),
    ymin: String(ymin),
    xmax: String(xmax),
    ymax: String(ymax),
  });
  return fetchGeoJson(`/api/gis/buildings?${params}`, "Buildings");
}

export async function fetchIndianaHistoricSites(bbox: BBox): Promise<GeoJSONFeatureCollection> {
  if (!isValidBBox(bbox)) return EMPTY_FC;
  const params = new URLSearchParams({ bbox: bbox.join(",") });
  return fetchGeoJson(`/api/historic-sites?${params}`, "HistoricSites");
}

export async function fetchDnrFloodplain(bbox: BBox): Promise<GeoJSONFeatureCollection> {
  if (!isValidBBox(bbox)) return EMPTY_FC;
  const params = new URLSearchParams({ bbox: bbox.join(",") });
  return fetchGeoJson(`/api/dnr-floodplain?${params}`, "DNRFloodplain");
}
