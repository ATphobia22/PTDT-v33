import { Express, Request, Response } from "express";

export function registerAIRoutes(
  app: Express,
  getGenAI: () => any | null
): void {
  app.post("/api/ai/chat", async (req: Request, res: Response) => {
    try {
      const { message, context } = req.body ?? {};
      const ai = getGenAI();
      if (!ai) {
        return res.json({
          reply:
            "[OFFLINE] Gemini key not configured. USGS, NLD, terrain, and GIS routes remain available.",
        });
      }
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `${context ? `Context: ${context}\n` : ""}User: ${message ?? ""}`,
      });
      res.json({ reply: response.text });
    } catch (e: any) {
      res.status(500).json({ error: e?.message ?? String(e) });
    }
  });

  app.post("/api/ai/image", async (req: Request, res: Response) => {
    try {
      const { prompt } = req.body ?? {};
      const ai = getGenAI();
      if (!ai) {
        return res.status(503).json({
          error: "Image generation requires GEMINI_API_KEY",
        });
      }
      const response = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: prompt ?? "",
        config: {
          numberOfImages: 1,
          outputMimeType: "image/jpeg",
        },
      });
      const bytes = response?.generatedImages?.[0]?.image?.imageBytes;
      if (!bytes) {
        return res.status(502).json({ error: "No image bytes returned" });
      }
      res.json({ imageUrl: `data:image/jpeg;base64,${bytes}` });
    } catch (e: any) {
      res.status(500).json({ error: e?.message ?? String(e) });
    }
  });
}
