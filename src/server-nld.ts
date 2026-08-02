import { Express, Request, Response } from "express";
import { BONEBANK_SITE } from "./lib/siteConstants";

const NLD_FS =
  "https://geospatial.sec.usace.army.mil/dls/rest/services/NLD/Public/FeatureServer";

/** Query NLD public layer 0 (or specified) within bbox; zero-key USACE geospatial. */
export function registerNldRoutes(app: Express): void {
  app.get("/api/nld/service", async (_req: Request, res: Response) => {
    try {
      const r = await fetch(`${NLD_FS}?f=json`, {
        headers: { "User-Agent": "PTDT-Bonebank/1.0" },
      });
      if (!r.ok) return res.status(502).json({ error: "NLD service metadata failed", status: r.status });
      const data = await r.json();
      res.json({
        source: NLD_FS,
        layers: (data.layers || []).map((l: { id: number; name: string }) => ({
          id: l.id,
          name: l.name,
        })),
        note: "Public USACE National Levee Database FeatureServer",
      });
    } catch (e) {
      res.status(502).json({ error: String(e) });
    }
  });

  app.get("/api/nld/levees", async (req: Request, res: Response) => {
    const bboxParam = String(req.query.bbox || "");
    const layerId = String(req.query.layer ?? "0");
    const [minLon, minLat, maxLon, maxLat] = bboxParam
      ? bboxParam.split(",").map(Number)
      : BONEBANK_SITE.bbox;

    if (![minLon, minLat, maxLon, maxLat].every((n) => Number.isFinite(n))) {
      return res.status(400).json({ error: "bbox must be minLon,minLat,maxLon,maxLat" });
    }

    const geometry = JSON.stringify({
      xmin: minLon,
      ymin: minLat,
      xmax: maxLon,
      ymax: maxLat,
      spatialReference: { wkid: 4326 },
    });

    const qs = new URLSearchParams({
      where: "1=1",
      geometry,
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "*",
      returnGeometry: "true",
      outSR: "4326",
      f: "geojson",
      resultRecordCount: String(Math.min(Number(req.query.limit) || 50, 200)),
    });

    const url = `${NLD_FS}/${layerId}/query?${qs}`;

    try {
      const r = await fetch(url, { headers: { "User-Agent": "PTDT-Bonebank/1.0" } });
      if (!r.ok) {
        const text = await r.text();
        return res.status(502).json({ error: "NLD query failed", status: r.status, body: text.slice(0, 500) });
      }
      const geojson = await r.json();
      res.json({
        source: "USACE NLD Public FeatureServer",
        layerId,
        bbox: [minLon, minLat, maxLon, maxLat],
        featureCount: Array.isArray(geojson.features) ? geojson.features.length : 0,
        disclaimer:
          "NLD features near AOI do not certify local protection or Archimedes design compliance.",
        geojson,
      });
    } catch (e) {
      res.status(502).json({ error: String(e) });
    }
  });
}
