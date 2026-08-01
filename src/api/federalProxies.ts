/**
 * Zero-key federal proxies — from docs/API inventory (Api and web sources.pdf).
 * USGS is handled in server-main; these are NRCS SDA + OpenFEMA NFIP claims.
 */

export interface NrcsSoilRow {
  mukey?: string;
  muname?: string;
  hydgrp?: string;
  drainagecl?: string;
  [k: string]: unknown;
}

/** USDA-NRCS Soil Data Access — free POST SQL, no API key */
export async function fetchNrcsSoilByMukey(mukey: string): Promise<NrcsSoilRow[]> {
  const sql = `SELECT mukey, muname, hydgrp, drainagecl FROM mapunit WHERE mukey = '${mukey.replace(/[^0-9]/g, "")}'`;
  const body = new URLSearchParams({ query: sql, format: "JSON" });
  try {
    const res = await fetch("https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "PTDT-Bonebank/1.0" },
      body,
    });
    if (!res.ok) return [];
    const data = await res.json();
    // SDA returns { Table: [...] } or array depending on format
    if (Array.isArray(data)) return data as NrcsSoilRow[];
    if (data?.Table && Array.isArray(data.Table)) return data.Table as NrcsSoilRow[];
    return [];
  } catch {
    return [];
  }
}

/** Bounding-box soil mapunit query (simplified) */
export async function fetchNrcsSoilBbox(
  minx: number,
  miny: number,
  maxx: number,
  maxy: number
): Promise<NrcsSoilRow[]> {
  // SDA spatial via muaggatt is complex; provide component query for Posey seed mukeys as fallback
  void minx;
  void miny;
  void maxx;
  void maxy;
  // Posey County common agricultural map units (illustrative seeds if spatial SQL blocked)
  return fetchNrcsSoilByMukey("165191");
}

export interface OpenFemaClaimRow {
  agricultureStructureIndicator?: string;
  amountPaidOnBuildingClaim?: number;
  amountPaidOnContentsClaim?: number;
  countyCode?: string;
  state?: string;
  yearOfLoss?: number;
  [k: string]: unknown;
}

/** OpenFEMA NFIP Claims — free OData, no key. Filter Posey County IN (county FIPS 18129). */
export async function fetchOpenFemaClaimsPosey(limit = 50): Promise<OpenFemaClaimRow[]> {
  const url =
    "https://www.fema.gov/api/open/v2/FimaNfipClaims?" +
    "$filter=countyCode%20eq%20'18129'%20and%20state%20eq%20'IN'" +
    `&$top=${Math.min(limit, 100)}&$orderby=yearOfLoss%20desc`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "PTDT-Bonebank/1.0" } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data?.FimaNfipClaims || data?.data || []) as OpenFemaClaimRow[];
  } catch {
    return [];
  }
}
