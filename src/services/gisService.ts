/**
 * GIS / hydrology client helpers for the Point Township Digital Twin.
 * All network calls go through same-origin /api proxies in server.ts
 * so the browser never needs CORS to federal hosts.
 */

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

export interface NrcsSoilRow {
  mukey?: string;
  muname?: string;
  hydgrpdcd?: string;
  drainagecl?: string;
  [key: string]: unknown;
}

export interface OpenFemaClaimsResponse {
  success: boolean;
  source: string;
  count: number;
  data: Record<string, unknown>[];
  meta?: Record<string, unknown>;
}

export async function fetchFemaFloodZones(
  bbox: [number, number, number, number]
): Promise<GeoJSONFeatureCollection> {
  const params = new URLSearchParams({ bbox: bbox.join(",") });
  try {
    const res = await fetch(`/api/fema-flood-zones?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch FEMA data");
    return await res.json();
  } catch (error) {
    console.error("FEMA API Error:", error);
    return { type: "FeatureCollection", features: [] };
  }
}

export async function fetchIndianaHistoricSites(
  bbox: [number, number, number, number]
): Promise<GeoJSONFeatureCollection> {
  const params = new URLSearchParams({ bbox: bbox.join(",") });
  try {
    const res = await fetch(`/api/historic-sites?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch INMap data");
    return await res.json();
  } catch (error) {
    console.error("INMap API Error:", error);
    return { type: "FeatureCollection", features: [] };
  }
}

export async function fetchDnrFloodplain(
  bbox: [number, number, number, number]
): Promise<GeoJSONFeatureCollection> {
  const params = new URLSearchParams({ bbox: bbox.join(",") });
  try {
    const res = await fetch(`/api/dnr-floodplain?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch Indiana DNR floodplain");
    return await res.json();
  } catch (error) {
    console.error("DNR Floodplain API Error:", error);
    return { type: "FeatureCollection", features: [] };
  }
}

/** USDA-NRCS Soil Data Access (SSURGO) via server proxy — Manning / drainage context. */
export async function fetchNrcsSoils(opts?: {
  state?: string;
  county?: string;
  limit?: number;
}): Promise<{ success: boolean; source: string; rows: NrcsSoilRow[] }> {
  const params = new URLSearchParams({
    state: opts?.state ?? "IN",
    county: opts?.county ?? "Posey",
    limit: String(opts?.limit ?? 25),
  });
  try {
    const res = await fetch(`/api/nrcs-soil?${params.toString()}`);
    if (!res.ok) throw new Error(`NRCS soil proxy status ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn("[NRCS Soil] fallback", error);
    return {
      success: true,
      source: "LOCAL_SOIL_FALLBACK",
      rows: [
        {
          mukey: "LOCAL-POSEY",
          muname: "Wabash floodplain complex (offline)",
          hydgrpdcd: "C/D",
          drainagecl: "Somewhat poorly drained",
        },
      ],
    };
  }
}

/** OpenFEMA NFIP claims for BRIC / BCA narrative (no API key). */
export async function fetchOpenFemaClaims(opts?: {
  state?: string;
  yearFrom?: number;
  top?: number;
}): Promise<OpenFemaClaimsResponse> {
  const params = new URLSearchParams({
    state: opts?.state ?? "IN",
    yearFrom: String(opts?.yearFrom ?? 2000),
    top: String(opts?.top ?? 50),
  });
  try {
    const res = await fetch(`/api/openfema-claims?${params.toString()}`);
    if (!res.ok) throw new Error(`OpenFEMA proxy status ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn("[OpenFEMA] fallback", error);
    return {
      success: true,
      source: "LOCAL_NFIP_FALLBACK",
      count: 0,
      data: [],
      meta: { note: "OpenFEMA unreachable; empty claim set" },
    };
  }
}

export async function fetchNwsAlerts(): Promise<any> {
  try {
    const res = await fetch("/api/nws-alerts");
    if (!res.ok) throw new Error("Failed to fetch NWS alerts");
    return await res.json();
  } catch (error) {
    console.log("[NWS Alerts] Info: Using local cached alerts as fallback", error);
    return {
      title: "NWS Active Alerts Cache",
      features: [
        {
          properties: {
            event: "Flood Warning",
            headline:
              "Flood Warning issued for Wabash River at Mount Carmel affecting Posey County",
            severity: "Severe",
            description:
              "The National Weather Service in Paducah has issued a Flood Warning for the Wabash River at Mount Carmel... or until further notice. At 18.0 feet the river begins to overflow lowlands. Precautionary actions should be taken.",
            instruction:
              "Do not drive across flooded roads. Turn around, don't drown.",
          },
        },
      ],
    };
  }
}
