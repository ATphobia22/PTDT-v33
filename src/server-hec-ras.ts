/** HEC-RAS mesh stub routes — PE seal required before evidentiary use */
import { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";

export function registerHecRasRoutes(app: Express): void {
  const dir = path.join(process.cwd(), "data", "hec-ras");

  app.get("/api/hec-ras/manifest", (_req: Request, res: Response) => {
    const p = path.join(dir, "MANIFEST.json");
    if (!fs.existsSync(p)) {
      return res.status(404).json({ error: "manifest missing", sealed: false });
    }
    res.json(JSON.parse(fs.readFileSync(p, "utf8")));
  });

  app.get("/api/hec-ras/mesh", (_req: Request, res: Response) => {
    const p = path.join(dir, "mesh_stub.geojson");
    if (!fs.existsSync(p)) {
      return res.status(404).json({ type: "FeatureCollection", features: [] });
    }
    res.type("application/geo+json").send(fs.readFileSync(p, "utf8"));
  });
}
