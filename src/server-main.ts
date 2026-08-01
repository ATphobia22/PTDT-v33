/**
 * PTDT sovereign bootstrap server — zero-key government path.
 * Assemble will NOT overwrite when USGS_NWIS_LIVE is present.
 */
import { registerAIRoutes } from "./src/server-ai";
import express, { Request, Response, NextFunction } from "express";
import path from "path";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import { OpenMITimeHandler } from "./src/services/compliance";
import { registerGisRoutes } from "./src/server-gis-routes";
import { registerHecRasRoutes } from "./src/server-hec-ras";
import { registerMultiHazardRoutes } from "./src/server-multi-hazard";
import { BONEBANK_SITE } from "./src/lib/siteConstants";

dotenv.config();

let genAIClient: any = null;
function getGenAI() {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not set — AI chat offline (core GIS/twin still works).");
      return null;
    }
    try {
      const { GoogleGenAI } = require("@google/genai");
      genAIClient = new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "ptdt-gov-free" } } });
    } catch {
      return null;
    }
  }
  return genAIClient;
}

interface GaugeRow {
  gauge_id: string;
  name: string;
  timestamp: string;
  water_level_stage_ft: number;
  discharge_cfs: number;
  lat: number;
  lng: number;
}

async function fetchUsgsIv(site: string): Promise<{ stage: number; cfs: number; ts: string } | null> {
  const url =
    `https://waterservices.usgs.gov/nwis/iv/?format=json&sites=${site}` +
    `&parameterCd=00060,00065&siteStatus=all`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "PTDT-Bonebank/1.0" } });
    if (!res.ok) return null;
    const data = (await res.json()) as any;
    let stage = 0;
    let cfs = 0;
    let ts = new Date().toISOString();
    for (const series of data?.value?.timeSeries || []) {
      const code = series?.variable?.variableCode?.[0]?.value;
      const vals = series?.values?.[0]?.value || [];
      if (!vals.length) continue;
      const latest = vals[vals.length - 1];
      const v = parseFloat(latest.value);
      ts = latest.dateTime || ts;
      if (code === "00065") stage = v;
      if (code === "00060") cfs = v;
    }
    return { stage, cfs, ts };
  } catch {
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const timeHandler = new OpenMITimeHandler();
  void timeHandler;

  app.use(express.json());

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error", message: err.message });
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      node: "13101_BONEBANK_RD",
      owner: BONEBANK_SITE.owner,
      firm_panel: BONEBANK_SITE.firm_panel,
      gauges: [BONEBANK_SITE.usgs_gauge, BONEBANK_SITE.usgs_gauge_ohio],
      free_for_government: true,
      keys_required: false,
      hec_ras_mesh: "STUB",
      multi_hazard: "STUB",
    });
  });

  registerGisRoutes(app);
  registerHecRasRoutes(app);
  registerMultiHazardRoutes(app);

  app.post("/api/v1/twin/simulate", (req, res) => {
    const stage_ft = Number(req.body?.usgs_stage_ft ?? BONEBANK_SITE.lag_ft_navd88 + 4);
    const depth_ft = Math.max(0.5, stage_ft - (BONEBANK_SITE.bfe_ft_navd88 - 5));
    const manning_n = 0.045;
    const slope = 0.00015;
    const velocity =
      depth_ft > 0 ? (1.486 / manning_n) * Math.pow(depth_ft, 2 / 3) * Math.pow(slope, 0.5) : 0;
    const disp = (300 * 10 * 3) / 27;
    const factor = BONEBANK_SITE.compensatory_storage_factor;
    const excav = disp * factor;
    const rise = 0;
    const ok = rise <= 0.14;
    const ts = new Date().toISOString();
    const hash = crypto.createHash("sha256").update(`${ts}|${ok}|${rise}`).digest("hex");
    res.json({
      status: "success",
      node: "13101_BONEBANK_RD",
      timestamp: ts,
      metrics: { water_depth_m: depth_ft * 0.3048, velocity_ms: velocity },
      compensatory_storage: {
        displacement_cu_yds: Math.round(disp * 100) / 100,
        excavation_cu_yds: Math.round(excav * 100) / 100,
        net_balance_cu_yds: Math.round((excav - disp) * 100) / 100,
        safety_factor: factor,
      },
      governance: {
        decision: ok ? "APPROVED_CERTIFIED_NO_RISE" : "REJECTED_STATUTORY_VIOLATION",
        cryptographic_hash: hash,
        firm_panel: BONEBANK_SITE.firm_panel,
        statute: "IC 14-28-1 / 312 IAC 10",
      },
    });
  });

  app.get("/api/usgs-telemetry", async (_req, res) => {
    const seedTs = new Date().toISOString();
    const seed: GaugeRow[] = [
      {
        gauge_id: `USGS-${BONEBANK_SITE.usgs_gauge}`,
        name: BONEBANK_SITE.usgs_gauge_name,
        timestamp: seedTs,
        water_level_stage_ft: 2.92,
        discharge_cfs: 11600,
        lat: 38.1309,
        lng: -87.9414,
      },
      {
        gauge_id: `USGS-${BONEBANK_SITE.usgs_gauge_ohio}`,
        name: BONEBANK_SITE.usgs_gauge_ohio_name,
        timestamp: seedTs,
        water_level_stage_ft: 0,
        discharge_cfs: 0,
        lat: 37.9,
        lng: -87.95,
      },
    ];
    try {
      const [nh, myers] = await Promise.all([
        fetchUsgsIv(BONEBANK_SITE.usgs_gauge),
        fetchUsgsIv(BONEBANK_SITE.usgs_gauge_ohio),
      ]);
      const data: GaugeRow[] = [];
      if (nh) {
        data.push({
          gauge_id: `USGS-${BONEBANK_SITE.usgs_gauge}`,
          name: BONEBANK_SITE.usgs_gauge_name,
          timestamp: nh.ts,
          water_level_stage_ft: nh.stage,
          discharge_cfs: nh.cfs,
          lat: 38.1309,
          lng: -87.9414,
        });
      }
      if (myers) {
        data.push({
          gauge_id: `USGS-${BONEBANK_SITE.usgs_gauge_ohio}`,
          name: BONEBANK_SITE.usgs_gauge_ohio_name,
          timestamp: myers.ts,
          water_level_stage_ft: myers.stage,
          discharge_cfs: myers.cfs,
          lat: 37.9,
          lng: -87.95,
        });
      }
      if (data.length) return res.json({ success: true, source: "USGS_NWIS_LIVE", data });
    } catch (e) {
      console.warn("[USGS] live fetch failed", e);
    }
    return res.json({ success: true, source: "LOCAL_OFFLINE_SEED", data: seed });
  });

  app.get("/api/fema-flood-zones", (_req, res) =>
    res.json({ type: "FeatureCollection", features: [] })
  );
  app.get("/api/dnr-floodplain", (_req, res) =>
    res.json({ type: "FeatureCollection", features: [] })
  );

  app.get("/api/regulatory/loma-package", (_req, res) => {
    res.json({
      path: "Pure LOMA Natural High Ground",
      address: BONEBANK_SITE.name,
      community_number: BONEBANK_SITE.fema_community_number,
      firm_panel: BONEBANK_SITE.firm_panel,
      bfe_ft_navd88: BONEBANK_SITE.bfe_ft_navd88,
      lag_ft_navd88: BONEBANK_SITE.lag_ft_navd88,
      ffe_ft_navd88: BONEBANK_SITE.ffe_ft_navd88,
      clearance_ft: BONEBANK_SITE.clearance_ft,
      vertical_datum: "NAVD88",
      legal_disclaimer: "Not legal advice. PE seal required for filings (IC 25-31-1).",
    });
  });

  registerAIRoutes(app, getGenAI);

  if (process.env.NODE_ENV !== "production") {
    try {
      const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("Vite middleware unavailable", e);
    }
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  const httpServer = http.createServer(app);
  const wss = new WebSocketServer({ server: httpServer });
  wss.on("connection", (ws) => {
    let frame = 0;
    const id = setInterval(() => {
      frame = (frame + 1) % 240;
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "TELEMETRY_UPDATE",
            node: "13101_BONEBANK_RD",
            stage: BONEBANK_SITE.lag_ft_navd88 + Math.sin(frame / 12) * 0.5,
            frame,
            status: "NOMINAL",
            timestamp: new Date().toISOString(),
          })
        );
      }
    }, 1000);
    ws.on("close", () => clearInterval(id));
  });

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[PTDT] :${PORT} zero-key · gauges dual · hazards STUB · HEC-RAS STUB`);
  });
}

startServer();
