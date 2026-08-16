import { Express, Request, Response } from "express";

export function registerGrantsRoutes(app: Express): void {
  app.post("/api/grants/search", async (req: Request, res: Response) => {
    try {
      const response = await fetch("https://api.grants.gov/v1/api/search2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req.body || { oppStatuses: "forecasted|posted" }),
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("[Grants] Search error", error);
      res.status(500).json({ error: "Failed to fetch grants" });
    }
  });

  app.post("/api/grants/fetch", async (req: Request, res: Response) => {
    try {
      const response = await fetch("https://api.grants.gov/v1/api/fetchOpportunity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ opportunityId: req.body.opportunityId }),
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("[Grants] Fetch opportunity error", error);
      res.status(500).json({ error: "Failed to fetch opportunity" });
    }
  });
}
