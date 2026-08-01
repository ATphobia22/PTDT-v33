import * as THREE from 'three';

export interface GeoJSONFeature {
  type: string;
  properties: Record<string, any>;
  geometry: {
    type: string;
    coordinates: any;
  };
}

export interface GeoJSONFeatureCollection {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export async function fetchFemaFloodZones(bbox: [number, number, number, number]): Promise<GeoJSONFeatureCollection> {
  const url = `/api/fema-flood-zones`;
  const params = new URLSearchParams({
    bbox: bbox.join(',')
  });

  try {
    const res = await fetch(`${url}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch FEMA data');
    return await res.json();
  } catch (error) {
    console.error("FEMA API Error:", error);
    return { type: "FeatureCollection", features: [] };
  }
}

export async function fetchIndianaHistoricSites(bbox: [number, number, number, number]): Promise<GeoJSONFeatureCollection> {
  const url = `/api/historic-sites`;
  const params = new URLSearchParams({
    bbox: bbox.join(',')
  });

  try {
    const res = await fetch(`${url}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch INMap data');
    return await res.json();
  } catch (error) {
    console.error("INMap API Error:", error);
    return { type: "FeatureCollection", features: [] };
  }
}

export async function fetchDnrFloodplain(bbox: [number, number, number, number]): Promise<GeoJSONFeatureCollection> {
  const url = `/api/dnr-floodplain`;
  const params = new URLSearchParams({
    bbox: bbox.join(',')
  });

  try {
    const res = await fetch(`${url}?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch Indiana DNR floodplain');
    return await res.json();
  } catch (error) {
    console.error("DNR Floodplain API Error:", error);
    return { type: "FeatureCollection", features: [] };
  }
}

export async function fetchNwsAlerts(): Promise<any> {
  const url = `/api/nws-alerts`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch NWS alerts');
    return await res.json();
  } catch (error) {
    console.error("NWS API Error:", error);
    return { type: "FeatureCollection", features: [] };
  }
}

/** Building footprints — local Bonebank sample + /api/gis/buildings proxy */
export async function fetchBuildings(bbox: [number, number, number, number]): Promise<GeoJSONFeatureCollection> {
  const params = new URLSearchParams({
    xmin: String(bbox[0]),
    ymin: String(bbox[1]),
    xmax: String(bbox[2]),
    ymax: String(bbox[3]),
  });
  try {
    const res = await fetch(`/api/gis/buildings?${params}`);
    if (!res.ok) throw new Error('Failed to fetch buildings');
    return await res.json();
  } catch (error) {
    console.error("Buildings API Error:", error);
    return { type: "FeatureCollection", features: [] };
  }
}

export async function fetchParcels(bbox: [number, number, number, number]): Promise<GeoJSONFeatureCollection> {
  const params = new URLSearchParams({
    xmin: String(bbox[0]),
    ymin: String(bbox[1]),
    xmax: String(bbox[2]),
    ymax: String(bbox[3]),
  });
  try {
    const res = await fetch(`/api/gis/parcels?${params}`);
    if (!res.ok) throw new Error('Failed to fetch parcels');
    return await res.json();
  } catch (error) {
    console.error("Parcels API Error:", error);
    return { type: "FeatureCollection", features: [] };
  }
}

export async function fetchBafm(bbox: [number, number, number, number]): Promise<GeoJSONFeatureCollection> {
  const params = new URLSearchParams({
    xmin: String(bbox[0]),
    ymin: String(bbox[1]),
    xmax: String(bbox[2]),
    ymax: String(bbox[3]),
  });
  try {
    const res = await fetch(`/api/gis/bafm?${params}`);
    if (!res.ok) throw new Error('Failed to fetch BAFM');
    return await res.json();
  } catch (error) {
    console.error("BAFM API Error:", error);
    return { type: "FeatureCollection", features: [] };
  }
}
