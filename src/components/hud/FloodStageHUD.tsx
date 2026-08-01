import React, { useEffect, useState } from "react";
import { Activity, AlertTriangle, Radio } from "lucide-react";
import { BONEBANK_SITE } from "../../lib/siteConstants";

/** NWS-style bands for USGS 03378500 (Wabash at New Harmony) — approximate public categories */
const STAGE_BANDS = {
  action: 15.0,
  minor: 16.0,
  moderate: 20.0,
  major: 25.0,
} as const;

type RiskLevel = "NONE" | "ACTION" | "MINOR" | "MODERATE" | "MAJOR";

function riskFromStage(ft: number): RiskLevel {
  if (ft >= STAGE_BANDS.major) return "MAJOR";
  if (ft >= STAGE_BANDS.moderate) return "MODERATE";
  if (ft >= STAGE_BANDS.minor) return "MINOR";
  if (ft >= STAGE_BANDS.action) return "ACTION";
  return "NONE";
}

function riskLabel(r: RiskLevel): string {
  if (r === "NONE") return "NORMAL";
  return r;
}

function riskColor(r: RiskLevel): string {
  switch (r) {
    case "MAJOR":
      return "text-rose-400";
    case "MODERATE":
      return "text-amber-400";
    case "MINOR":
    case "ACTION":
      return "text-yellow-400";
    default:
      return "text-emerald-400";
  }
}

interface TelemetryState {
  stageFt: number;
  dischargeCfs: number;
  source: string;
  timestamp: string;
  live: boolean;
}

export const FloodStageHUD: React.FC = () => {
  const [tel, setTel] = useState<TelemetryState>({
    stageFt: 2.92,
    dischargeCfs: 11600,
    source: "USGS_NWIS_SEED",
    timestamp: new Date().toISOString(),
    live: false,
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/usgs-telemetry");
        if (!res.ok) throw new Error(String(res.status));
        const body = await res.json();
        const row =
          body?.data?.find((d: { gauge_id?: string }) =>
            String(d.gauge_id || "").includes("03378500")
          ) || body?.data?.[0];
        if (!row || cancelled) return;
        setTel({
          stageFt: Number(row.water_level_stage_ft),
          dischargeCfs: Number(row.discharge_cfs),
          source: body.source || "USGS",
          timestamp: row.timestamp || new Date().toISOString(),
          live: String(body.source || "").includes("LIVE"),
        });
      } catch {
        /* keep last / seed */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const risk = riskFromStage(tel.stageFt);
  const clearance = BONEBANK_SITE.clearance_ft;
  const asOf = new Date(tel.timestamp);

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-5 w-64 pointer-events-auto flex flex-col gap-4 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />

      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity size={12} className="text-blue-400" />
          Flood Safety Vectors
        </div>
        <div className="text-[8px] text-slate-600 font-mono mt-0.5">
          USGS {BONEBANK_SITE.usgs_gauge} · gage height (not NAVD88 WSE)
        </div>

        <div className="flex flex-col mt-2 gap-1">
          <span className="text-[9px] text-slate-500 uppercase font-mono">Current Stage</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] text-blue-400 font-black font-mono leading-none">
              {tel.stageFt.toFixed(1)}
            </span>
            <span className="text-[12px] text-slate-400 font-mono">ft</span>
            {tel.live ? (
              <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider flex items-center gap-1">
                <Radio size={10} /> Live
              </span>
            ) : (
              <span className="text-[8px] text-slate-500 uppercase">Cached / offline</span>
            )}
          </div>
          <span className="text-[9px] text-slate-500 font-mono">
            {tel.dischargeCfs.toLocaleString()} cfs · {asOf.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col mt-3 gap-1.5">
          <div className="flex justify-between items-baseline">
            <span className="text-[9px] text-slate-500 uppercase font-mono">BFE (NAVD88)</span>
            <span className="text-[14px] text-white font-black font-mono">
              {BONEBANK_SITE.bfe_ft_navd88.toFixed(1)} ft
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-[9px] text-slate-500 uppercase font-mono">Certified LAG</span>
            <span className="text-[14px] text-emerald-400 font-black font-mono">
              {BONEBANK_SITE.lag_ft_navd88.toFixed(1)} ft
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 flex flex-col p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
            <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest leading-none mb-1">
              Natural Clearance
            </span>
            <span className="text-[18px] font-black text-emerald-400 font-mono leading-none">
              +{clearance.toFixed(1)} ft
            </span>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-800/50" />

      <div className="flex flex-col bg-slate-900/40 border border-slate-800 rounded-sm p-2">
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle size={12} className={riskColor(risk)} />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Level</span>
        </div>
        <span className={`text-[14px] font-black uppercase tracking-wider ${riskColor(risk)}`}>
          {riskLabel(risk)}
        </span>
        <span className="text-[8px] text-slate-600 font-mono mt-1">
          Bands: action {STAGE_BANDS.action}′ / minor {STAGE_BANDS.minor}′ / mod {STAGE_BANDS.moderate}′ / major{" "}
          {STAGE_BANDS.major}′ (03378500)
        </span>
      </div>

      <div className="space-y-2 mt-1">
        <div className="text-[9px] text-slate-500 uppercase font-mono tracking-widest border-b border-slate-800 pb-1">
          Site context (2.0 ac)
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-300">Anchor</span>
          <span className="text-[11px] font-black text-white font-mono">Bonebank</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-300">Owner</span>
          <span className="text-[11px] font-black text-white font-mono">{BONEBANK_SITE.owner}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-300">Compensatory SF</span>
          <span className="text-[11px] font-black text-white font-mono">1.20×</span>
        </div>
      </div>
    </div>
  );
};
