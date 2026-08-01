import { Express, Request, Response } from "express";
import { runAllHazardEngines } from "./engines/multiHazardEngines";

export function registerMultiHazardRoutes(app: Express): void {
  app.get("/api/hazards/summary", async (_req: Request, res: Response) => {
    const engines = await runAllHazardEngines();
    res.json({
      site: "13101 Bonebank Road",
      engines,
      live: engines.filter((e) => e.status === "LIVE").map((e) => e.engine),
      unavailable: engines.filter((e) => e.status === "UNAVAILABLE").map((e) => e.engine),
      pe_gated: engines.filter((e) => e.status === "PE_GATED").map((e) => e.engine),
    });
  });

  app.get("/api/hazards/:name", async (req: Request, res: Response) => {
    const engines = await runAllHazardEngines();
    const hit = engines.find((e) =>
      e.engine.toLowerCase().includes(String(req.params.name).toLowerCase())
    );
    if (!hit) return res.status(404).json({ error: "unknown engine" });
    res.json(hit);
  });
}
