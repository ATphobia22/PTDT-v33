import type { Express, Request, Response } from "express";
import {
  BONEBANK_SITE,
} from "./lib/siteConstants";
import {
  EPQS_BASE,
  TERRAIN_DISCLAIMER,
  encodeMapboxTerrainRgb,
  encodeTerrarium,
  decodeMapboxTerrainRgb,
  decodeTerrarium,
  type FusedElevation,
} from "./lib/sovereignTerrain";

async function queryEpqs(
  lon: number,
  lat: number,
  units: "Feet" | "Meters" = "Feet"
): Promise<{ elevation: number | null; raw: unknown }> {
  const url = `${EPQS_BASE}?x=${lon}&y=${lat}&units=${units}&wkid=4326`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "PTDT-Bonebank-Twin" },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`EPQS ${res.status}`);
    const raw: any = await res.json();
    // v1 shape: { value, location: { x, y }, ... } or nested USGS legacy
    let elevation: number | null = null;
    if (typeof raw?.value === "number") elevation = raw.value;
    else if (raw?.USGS_Elevation_Point_Query_Service?.Elevation_Query?.Elevation != null) {
      const e = parseFloat(raw.USGS_Elevation_Point_Query_Service.Elevation_Query.Elevation);
      elevation = Number.isFinite(e) ? e : null;
    }
    if (elevation === -1000000 || elevation === -999999) elevation = null; // no data sentinels
    return { elevation, raw };
  } catch (e) {
    clearTimeout(t);
    throw e;
  }
}

async function queryNcatOrtho(
  lat: number,
  lon: number,
  heightFt: number,
  inDatum = "navd88",
  outDatum = "navd88"
): Promise<{ out_height_ft: number | null; shift_ft: number | null; raw?: unknown; error?: string }> {
  // Identity transform still documents uncertainty; useful when converting NGVD29→NAVD88
  const heightM = heightFt * 0.3048;
  const url = `https://geodesy.noaa.gov/api/ncat/llh?lat=${lat}&lon=${lon}&in_datum=${inDatum}&out_datum=${outDatum}&in_ortho_ht=${heightM}&f=json`;
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, {
      headers: { "User-Agent": "PTDT-Bonebank-Twin" },
      signal: controller.signal,
    });
    clearTimeout(t);
    if (!res.ok) throw new Error(`NCAT ${res.status}`);
    const data: any = await res.json();
    const outM = parseFloat(data.outOrthoHt ?? "");
    const shiftM = parseFloat(data.vertShift ?? "0");
    return {
      out_height_ft: Number.isFinite(outM) ? outM / 0.3048 : null,
      shift_ft: Number.isFinite(shiftM) ? shiftM / 0.3048 : null,
      raw: data,
    };
  } catch (e: any) {
    return { out_height_ft: null, shift_ft: null, error: String(e.message || e) };
  }
}

export function registerTerrainRoutes(app: Express): void {
  /** Point elevation from USGS EPQS (3DEP). */
  app.get("/api/terrain/epqs", async (req: Request, res: Response) => {
    const lat = parseFloat(String(req.query.lat ?? BONEBANK_SITE.lat));
    const lon = parseFloat(String(req.query.lon ?? BONEBANK_SITE.lon));
    const units = String(req.query.units || "Feet") === "Meters" ? "Meters" : "Feet";
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: "lat and lon required" });
    }
    try {
      const { elevation, raw } = await queryEpqs(lon, lat, units);
      res.json({
        success: elevation != null,
        lat,
        lon,
        elevation,
        units,
        source: "USGS_EPQS_3DEP",
        as_of: new Date().toISOString(),
        disclaimer: TERRAIN_DISCLAIMER,
        raw_keys: raw && typeof raw === "object" ? Object.keys(raw as object) : [],
      });
    } catch (e: any) {
      res.status(502).json({
        success: false,
        error: String(e.message || e),
        disclaimer: TERRAIN_DISCLAIMER,
      });
    }
  });

  /**
   * Fusion: EPQS sample + site BFE/LAG + optional NCAT.
   * Does not replace survey LAG; reports comparison only.
   */
  app.get("/api/terrain/fuse", async (req: Request, res: Response) => {
    const lat = parseFloat(String(req.query.lat ?? BONEBANK_SITE.lat));
    const lon = parseFloat(String(req.query.lon ?? BONEBANK_SITE.lon));
    const wantNcat = String(req.query.ncat || "0") === "1";
    const inDatum = String(req.query.in_datum || "navd88");
    const outDatum = String(req.query.out_datum || "navd88");

    let epqs_ft: number | null = null;
    let epqs_m: number | null = null;
    try {
      const feet = await queryEpqs(lon, lat, "Feet");
      epqs_ft = feet.elevation;
      if (epqs_ft != null) epqs_m = epqs_ft * 0.3048;
    } catch {
      /* leave null */
    }

    let ncat = {
      requested: wantNcat,
      shift_ft: null as number | null,
      out_height_ft: null as number | null,
      note: wantNcat ? "NCAT queried" : "NCAT not requested (pass ncat=1)",
    };

    if (wantNcat && epqs_ft != null) {
      const n = await queryNcatOrtho(lat, lon, epqs_ft, inDatum, outDatum);
      ncat = {
        requested: true,
        shift_ft: n.shift_ft,
        out_height_ft: n.out_height_ft,
        note: n.error ? `NCAT error: ${n.error}` : "NCAT response (verify on NGS for official use)",
      };
    }

    const clearance =
      epqs_ft != null ? epqs_ft - BONEBANK_SITE.bfe_ft_navd88 : null;

    const body: FusedElevation & { success: boolean; disclaimer: string } = {
      success: true,
      lat,
      lon,
      epqs_ft,
      epqs_m,
      site_lag_ft: BONEBANK_SITE.lag_ft_navd88,
      site_bfe_ft: BONEBANK_SITE.bfe_ft_navd88,
      clearance_vs_bfe_ft: clearance,
      ncat,
      fusion_note:
        "EPQS is context only. Regulatory LAG/BFE are BONEBANK_SITE constants. " +
        "Clearance here is EPQS_ground − BFE, not a LOMA determination.",
      regulatory_anchor: BONEBANK_SITE,
      disclaimer: TERRAIN_DISCLAIMER,
    };
    res.json(body);
  });

  /** Encode/decode helpers for custom DEM tile pipelines (offline). */
  app.post("/api/terrain/encode", (req: Request, res: Response) => {
    const height_m = Number(req.body?.height_m);
    const encoding = String(req.body?.encoding || "mapbox") as "mapbox" | "terrarium";
    if (!Number.isFinite(height_m)) {
      return res.status(400).json({ error: "height_m required" });
    }
    const rgb =
      encoding === "terrarium"
        ? encodeTerrarium(height_m)
        : encodeMapboxTerrainRgb(height_m);
    const roundTrip =
      encoding === "terrarium"
        ? decodeTerrarium(rgb[0], rgb[1], rgb[2])
        : decodeMapboxTerrainRgb(rgb[0], rgb[1], rgb[2]);
    res.json({
      encoding,
      height_m,
      rgb,
      round_trip_m: roundTrip,
      note: "Use for offline Terrain-RGB / Terrarium tile generation only",
    });
  });

  /** MapLibre-ready terrain source descriptor (client can apply). */
  app.get("/api/terrain/maplibre-config", (_req, res) => {
    res.json({
      dem: {
        id: "terrain-dem",
        type: "raster-dem",
        tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
        encoding: "terrarium",
        tileSize: 256,
        maxzoom: 15,
        attribution: "AWS Terrain Tiles / Mapzen Terrarium",
      },
      setTerrain: { source: "terrain-dem", exaggeration: 1.35 },
      buildings: {
        endpoint: `/api/gis/buildings?bbox=${BONEBANK_SITE.bbox.join(",")}`,
        layer_id: "bonebank-buildings-extrusion",
        type: "fill-extrusion",
      },
      site: BONEBANK_SITE,
      disclaimer: TERRAIN_DISCLAIMER,
    });
  });
}
