import { Express, Request, Response } from "express";
import { runAllHazardEngines } from "./engines/multiHazardEngines";

export function registerMultiHazardRoutes(app: Express): void {
  app.get("/api/hazards/summary", (_req: Request, res: Response) => {
    const engines = runAllHazardEngines();
    res.json({
      status: "STUB",
      note: "Multi-hazard engines are interface stubs — not calibrated operational products",
      engines,
    });
  });

  app.get("/api/hazards/:name", (req: Request, res: Response) => {
    const engines = runAllHazardEngines();
    const hit = engines.find((e) => e.engine.toLowerCase().includes(String(req.params.name).toLowerCase()));
    if (!hit) return res.status(404).json({ error: "unknown engine" });
    res.json(hit);
  });
}
