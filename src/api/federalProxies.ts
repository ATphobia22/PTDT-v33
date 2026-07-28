/**
 * Federal data proxies: USDA-NRCS Soil Data Access + OpenFEMA NFIP claims.
 * Registered from server.ts so Vite/browser clients use same-origin routes.
 */
import type { Express, Request, Response } from "express";

const UA = "PTDT-v33-Tri-State-Twin (admin@pointtownship.gov)";

const POSEY_SOIL_FALLBACK = [
  {
    mukey: "LOCAL-POSEY",
    muname: "Wabash floodplain complex (offline)",
    hydgrpdcd: "C/D",
    drainagecl: "Somewhat poorly drained",
  },
];

export function registerFederalProxies(app: Express): void {
  // USDA-NRCS Soil Data Access (SSURGO tabular)
  app.get("/api/nrcs-soil", async (req: Request, res: Response) => {
    const state = String(req.query.state || "IN").toUpperCase().slice(0, 2);
    const limit = Math.min(Math.max(parseInt(String(req.query.limit || "25"), 10) || 25, 1), 100);

    // Conservative SSURGO query — Indiana survey symbols
    const sql = `
SELECT TOP ${limit}
  mu.mukey, mu.muname
FROM mapunit mu
INNER JOIN legend l ON mu.lkey = l.lkey
WHERE l.areasymbol LIKE '${state}%'
ORDER BY mu.mukey
`.trim();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);
      const body = new URLSearchParams({
        query: sql,
        format: "json+columnname",
      });
      const response = await fetch(
        "https://SDMDataAccess.sc.egov.usda.gov/Tabular/post.rest",
        {
          method: "POST",
          headers: {
            "User-Agent": UA,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
          signal: controller.signal,
        }
      );
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`SDA status ${response.status}`);
      }
      const data = await response.json();
      const rows = normalizeSdaJson(data);
      if (!rows.length) throw new Error("SDA returned no rows");
      res.json({
        success: true,
        source: "NRCS_SDA_LIVE",
        state,
        count: rows.length,
        rows,
      });
    } catch (err: any) {
      console.log("[NRCS SDA] fallback:", err?.message || err);
      res.json({
        success: true,
        source: "LOCAL_SOIL_FALLBACK",
        state,
        count: POSEY_SOIL_FALLBACK.length,
        rows: POSEY_SOIL_FALLBACK,
      });
    }
  });

  // OpenFEMA NFIP claims (no API key; 1000/page server-side)
  app.get("/api/openfema-claims", async (req: Request, res: Response) => {
    const state = String(req.query.state || "IN").toUpperCase().slice(0, 2);
    const yearFrom = parseInt(String(req.query.yearFrom || "2000"), 10) || 2000;
    const top = Math.min(Math.max(parseInt(String(req.query.top || "50"), 10) || 50, 1), 1000);

    const filter = `(state eq '${state}') and (yearOfLoss ge ${yearFrom})`;
    const url =
      `https://www.fema.gov/api/open/v2/FimaNfipClaims` +
      `?$filter=${encodeURIComponent(filter)}&$top=${top}&$inlinecount=allpages`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`OpenFEMA status ${response.status}`);
      const json: any = await response.json();
      // OpenFEMA wraps collection under FimaNfipClaims or similar key
      const key = Object.keys(json).find(
        (k) => Array.isArray(json[k]) && k.toLowerCase().includes("claim")
      );
      const data: any[] = key ? json[key] : Array.isArray(json) ? json : [];
      res.json({
        success: true,
        source: "OPENFEMA_LIVE",
        state,
        yearFrom,
        count: data.length,
        data,
        meta: { metadata: json.metadata || null },
      });
    } catch (err: any) {
      console.log("[OpenFEMA] fallback:", err?.message || err);
      res.json({
        success: true,
        source: "LOCAL_NFIP_FALLBACK",
        state,
        yearFrom,
        count: 0,
        data: [],
        meta: { note: "OpenFEMA unreachable" },
      });
    }
  });
}

function normalizeSdaJson(data: unknown): Record<string, unknown>[] {
  if (Array.isArray(data) && data.length && typeof data[0] === "object" && !Array.isArray(data[0])) {
    return data as Record<string, unknown>[];
  }
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    for (const key of ["Table", "table", "rows", "data"]) {
      if (Array.isArray(obj[key])) return normalizeSdaJson(obj[key]);
    }
  }
  if (Array.isArray(data) && data.length >= 2 && Array.isArray(data[0])) {
    const headers = (data[0] as unknown[]).map(String);
    const out: Record<string, unknown>[] = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!Array.isArray(row)) continue;
      const rec: Record<string, unknown> = {};
      headers.forEach((h, j) => {
        rec[h] = row[j];
      });
      out.push(rec);
    }
    return out;
  }
  return [];
}
