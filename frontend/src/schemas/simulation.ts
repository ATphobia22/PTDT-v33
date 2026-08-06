import { z } from "zod";

export const SimulationPayloadSchema = z.object({
  stageFt: z.number().optional(),
  dischargeCfs: z.number().optional(),
  planId: z.string().optional(),
});
export type SimulationPayload = z.infer<typeof SimulationPayloadSchema>;

export const SimulationResponseSchema = z.object({
  status: z.string(),
  depthM: z.number().optional(),
  velocityMs: z.number().optional(),
  cells: z.array(z.any()).optional(),
});
export type SimulationResponse = z.infer<typeof SimulationResponseSchema>;
