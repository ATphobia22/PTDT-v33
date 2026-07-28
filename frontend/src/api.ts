import { SimulationPayload, SimulationResponseSchema } from './schemas/simulation';

const BASE = import.meta.env?.VITE_API_BASE ?? '';

export async function executeSimulation(payload: SimulationPayload): Promise<any> {
  const res = await fetch(`${BASE}/api/v1/twin/simulation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Simulation execution failed: ${res.status}`);
  const json = await res.json();
  return SimulationResponseSchema.parse(json);
}

export async function fetchHealth() {
  const res = await fetch(`${BASE}/api/v1/health`);
  return res.json();
}

export async function fetchMyersTelemetry() {
  const res = await fetch(`${BASE}/api/v1/telemetry/myers`);
  return res.json();
}

export async function generatePackage(body?: Record<string, number>) {
  const res = await fetch(`${BASE}/api/v1/package/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
  return res.json();
}
