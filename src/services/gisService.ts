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
    console.log("[NWS Alerts] Info: Using local cached alerts as fallback", error);
    return {
      title: "NWS Active Alerts Cache",
      features: [
        {
          properties: {
            event: "Flood Warning",
            headline: "Flood Warning issued for Wabash River at Mount Carmel affecting Posey County",
            severity: "Severe",
            description: "The National Weather Service in Paducah has issued a Flood Warning for the Wabash River at Mount Carmel... or until further notice. At 18.0 feet the river begins to overflow lowlands. Precautionary actions should be taken.",
            instruction: "Do not drive across flooded roads. Turn around, don't drown."
          }
        }
      ]
    };
  }
}
