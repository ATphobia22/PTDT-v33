import { Express, Request, Response } from "express";
import {
  getLocalBonebankBuildings,
  normalizeBuildingHeight,
  GeoJSONFeatureCollection,
  BBox,
} from "./services/buildingsService";
import { BONEBANK_SITE } from "./lib/siteConstants";

const EMPTY_FC: GeoJSONFeatureCollection = { type: "FeatureCollection", features: [] };

function parseBBox(q: any): BBox | null {
  const xmin = parseFloat(String(q.xmin ?? q.minLon ?? ""));
  const ymin = parseFloat(String(q.ymin ?? q.minLat ?? ""));
  const xmax = parseFloat(String(q.xmax ?? q.maxLon ?? ""));
  const ymax = parseFloat(String(q.ymax ?? q.maxLat ?? ""));

  if ([xmin, ymin, xmax, ymax].every((n) => Number.isFinite(n)) && xmin < xmax && ymin < ymax) {
    return [xmin, ymin, xmax, ymax];
  }

  if (typeof q.bbox === "string") {
    const parts = q.bbox.split(",").map(parseFloat);
    if (parts.length === 4 && parts.every(Number.isFinite) && parts[0] < parts[2] && parts[1] < parts[3]) {
      return parts as BBox;
    }
  }

  return null;
}

async function ncatTransform(lat: number, lon: number, orthoHt: number, inVert: string, outVert: string) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    orthoHt: String(orthoHt),
    inVertDatum: inVert,
    outVertDatum: outVert,
  });

  const url = `https://geodesy.noaa.gov/api/ncat/llh?${params}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`NCAT HTTP ${res.status}`);
  return res.json();
}

function poseyOfflineFallback(lat: number, lon: number, orthoHt: number) {
  return {
    destLat: lat,
    destLon: lon,
    destOrthoHt: orthoHt,
    srcVertDatum: "NAVD88",
    destVertDatum: "NAVD88",
    offline: true,
    note: "Posey County offline fallback — NCAT unreachable; treating input as NAVD88",
  };
}

export function registerGisRoutes(app: Express): void {
  app.get("/api/gis/ncat", async (req: Request, res: Response) => {
    const lat = parseFloat(String(req.query.lat ?? BONEBANK_SITE.lat));
    const lon = parseFloat(String(req.query.lon ?? BONEBANK_SITE.lon));
    const orthoHt = parseFloat(String(req.query.orthoHt ?? req.query.ht ?? BONEBANK_SITE.lag_ft_navd88));
    const inVert = String(req.query.inVertDatum ?? "NAVD88");
    const outVert = String(req.query.outVertDatum ?? "NAVD88");

    if (![lat, lon, orthoHt].every(Number.isFinite)) {
      return res.status(400).json({ error: "lat, lon, orthoHt required" });
    }

    try {
      const data = await ncatTransform(lat, lon, orthoHt, inVert, outVert);
      return res.json({ ...data, offline: false, source: "NGS-NCAT" });
    } catch (err) {
      console.warn("[NCAT] remote failed, using Posey offline fallback", err);
      return res.json(poseyOfflineFallback(lat, lon, orthoHt));
    }
  });

  app.get("/api/gis/parcels", async (req: Request, res: Response) => {
    const bbox = parseBBox(req.query) ?? BONEBANK_SITE.bbox;
    const [xmin, ymin, xmax, ymax] = bbox;

    const geometry = JSON.stringify({
      xmin,
      ymin,
      xmax,
      ymax,
      spatialReference: { wkid: 4326 },
    });

    const params = new URLSearchParams({
      f: "geojson",
      where: "1=1",
      geometry,
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      outSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "*",
      returnGeometry: "true",
    });

    const candidates = [
      `https://gisdata.in.gov/server/rest/services/Hosted/Land_Parcels/FeatureServer/0/query?${params}`,
      `https://maps.indiana.edu/arcgis/rest/services/Infrastructure/Land_Parcels/MapServer/0/query?${params}`,
    ];

    for (const url of candidates) {
      try {
        const r = await fetch(url);
        if (!r.ok) continue;
        const data = await r.json();
        if (data?.features) {
          return res.json(data);
        }
      } catch {
      }
    }

    return res.json(EMPTY_FC);
  });

  app.get("/api/gis/bafm", async (req: Request, res: Response) => {
    const bbox = parseBBox(req.query) ?? BONEBANK_SITE.bbox;
    const [xmin, ymin, xmax, ymax] = bbox;

    const geometry = JSON.stringify({
      xmin,
      ymin,
      xmax,
      ymax,
      spatialReference: { wkid: 4326 },
    });

    const params = new URLSearchParams({
      f: "geojson",
      where: "1=1",
      geometry,
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      outSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "*",
      returnGeometry: "true",
    });

    const url = `https://gisdata.in.gov/server/rest/services/Hosted/Best_Available_Floodplain_Mapping/FeatureServer/0/query?${params}`;

    try {
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        if (data?.features) return res.json(data);
      }
    } catch (err) {
      console.warn("[BAFM] remote failed", err);
    }

    return res.json(EMPTY_FC);
  });

  app.get("/api/gis/buildings", async (req: Request, res: Response) => {
    const bbox = parseBBox(req.query) ?? BONEBANK_SITE.bbox;

    const local = getLocalBonebankBuildings();
    const enriched = {
      type: "FeatureCollection" as const,
      features: local.features.map((f) => ({
        ...f,
        properties: {
          ...(f.properties ?? {}),
          height_m: normalizeBuildingHeight(f.properties),
        },
      })),
    };

    return res.json({
      ...enriched,
      bbox,
      site: BONEBANK_SITE.name,
      source: "local-bonebank-sample",
    });
  });

  app.get("/api/gis/buildings/overture", async (req: Request, res: Response) => {
    const bbox = parseBBox(req.query);
    if (!bbox) {
      return res.status(400).json({ error: "bbox (xmin,ymin,xmax,ymax) required" });
    }
    return res.json(EMPTY_FC);
  });

  app.get("/api/gis/state-legislative-districts", async (req: Request, res: Response) => {
    const bbox = parseBBox(req.query) ?? BONEBANK_SITE.bbox;
    const [xmin, ymin, xmax, ymax] = bbox;
    const geometry = JSON.stringify({
      xmin,
      ymin,
      xmax,
      ymax,
      spatialReference: { wkid: 4326 },
    });
    const params = new URLSearchParams({
      f: "geojson",
      where: "1=1",
      geometry,
      geometryType: "esriGeometryEnvelope",
      inSR: "4326",
      outSR: "4326",
      spatialRel: "esriSpatialRelIntersects",
      outFields: "*",
      returnGeometry: "true",
    });

    const url = `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Legislative/MapServer/0/query?${params}`;
    try {
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        if (data?.features) return res.json(data);
      }
    } catch (err) {
      console.warn("[TIGERweb] remote failed", err);
    }
    return res.json(EMPTY_FC);
  });

  app.get("/api/gis/site", (_req: Request, res: Response) => {
    res.json(BONEBANK_SITE);
  });
}
