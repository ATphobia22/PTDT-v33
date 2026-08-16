import { Express } from "express";

export function registerAIRoutes(app: Express, getGenAI: () => any) {
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, context } = req.body;
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro",
        contents: `${context ? `Context: ${context}\n` : ''}User: ${message}`
      });
      res.json({ reply: response.text });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ai/image", async (req, res) => {
    try {
      const { prompt } = req.body;
      const ai = getGenAI();
      const response = await ai.models.generateImages({
        model: "imagen-3.0-generate-002",
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: "image/jpeg"
        }
      });
      res.json({ imageUrl: `data:image/jpeg;base64,${response.generatedImages[0].image.imageBytes}` });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });
}
