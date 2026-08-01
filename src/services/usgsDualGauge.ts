/**
 * Dual-gauge Tri-State telemetry helpers (browser-safe).
 * Gauges: 03378500 New Harmony (Wabash) + 03322000 John T. Myers (Ohio).
 */

import { BONEBANK_SITE, MYERS_FLOOD_BANDS, NEW_HARMONY_FLOOD_BANDS } from "../lib/siteConstants";

export interface GaugeReading {
  gauge_id: string;
  name: string;
  stage_ft: number;
  discharge_cfs: number;
  timestamp: string;
  risk: string;
}

function riskNewHarmony(ft: number): string {
  const b = NEW_HARMONY_FLOOD_BANDS;
  if (ft >= b.major_ft) return "MAJOR";
  if (ft >= b.moderate_ft) return "MODERATE";
  if (ft >= b.minor_ft) return "MINOR";
  if (ft >= b.action_ft) return "ACTION";
  return "NORMAL";
}

function riskMyers(ft: number): string {
  const b = MYERS_FLOOD_BANDS;
  if (ft >= b.major_ft) return "MAJOR";
  if (ft >= b.moderate_ft) return "MODERATE";
  if (ft >= b.minor_ft) return "MINOR";
  if (ft >= b.action_ft) return "ACTION";
  return "NORMAL";
}

export async function fetchDualGaugeFromApi(): Promise<{
  source: string;
  readings: GaugeReading[];
}> {
  const res = await fetch("/api/usgs-telemetry");
  if (!res.ok) throw new Error(`usgs-telemetry ${res.status}`);
  const body = await res.json();
  const data = body.data || [];
  const readings: GaugeReading[] = data.map((row: Record<string, unknown>) => {
    const id = String(row.gauge_id || "");
    const stage = Number(row.water_level_stage_ft || 0);
    const isMyers = id.includes("03322000");
    return {
      gauge_id: id,
      name: String(row.name || (isMyers ? BONEBANK_SITE.usgs_gauge_ohio_name : BONEBANK_SITE.usgs_gauge_name)),
      stage_ft: stage,
      discharge_cfs: Number(row.discharge_cfs || 0),
      timestamp: String(row.timestamp || new Date().toISOString()),
      risk: isMyers ? riskMyers(stage) : riskNewHarmony(stage),
    };
  });
  return { source: body.source || "unknown", readings };
}
