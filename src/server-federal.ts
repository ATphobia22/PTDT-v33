import { Express, Request, Response } from "express";
import { fetchNrcsSoilByMukey, fetchOpenFemaClaimsPosey } from "./api/federalProxies";

export function registerFederalProxyRoutes(app: Express): void {
  app.get("/api/nrcs-soil", async (req: Request, res: Response) => {
    const mukey = String(req.query.mukey || "165191");
    const rows = await fetchNrcsSoilByMukey(mukey);
    res.json({
      source: "USDA-NRCS Soil Data Access",
      auth: "none",
      mukey,
      count: rows.length,
      rows,
    });
  });

  app.get("/api/openfema-claims", async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit) || 50, 100);
    const rows = await fetchOpenFemaClaimsPosey(limit);
    res.json({
      source: "OpenFEMA FimaNfipClaims",
      auth: "none",
      filter: "countyCode eq 18129 and state eq IN",
      count: rows.length,
      rows,
    });
  });
}
