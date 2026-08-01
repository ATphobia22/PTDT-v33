import React, { useEffect, useState } from "react";
import { BONEBANK_SITE, FLOOD_SCENARIOS, NEW_HARMONY_FLOOD_BANDS } from "../../lib/siteConstants";

/**
 * Three-panel strip matching product mock: BASE (dry) | CURRENT (live) | FORECAST.
 * Stage values are gage height at USGS 03378500 — not NAVD88 WSE at the house.
 */
export const FloodScenarioStrip: React.FC = () => {
  const [currentFt, setCurrentFt] = useState(FLOOD_SCENARIOS.current_seed_ft);
  const [source, setSource] = useState("seed");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/usgs-telemetry");
        if (!res.ok) return;
        const body = await res.json();
        const row =
          body?.data?.find((d: { gauge_id?: string }) =>
            String(d.gauge_id || "").includes(BONEBANK_SITE.usgs_gauge)
          ) || body?.data?.[0];
        if (row && !cancelled) {
          setCurrentFt(Number(row.water_level_stage_ft));
          setSource(body.source || "usgs");
        }
      } catch {
        /* keep seed */
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const panels = [
    {
      key: "base",
      title: "BASE CONDITIONS (DRY)",
      stage: FLOOD_SCENARIOS.base_dry_ft,
      note: "Reference low-flow",
      tone: "border-slate-700",
    },
    {
      key: "current",
      title: "CURRENT FLOOD STAGE",
      stage: currentFt,
      note: source.includes("LIVE") ? "USGS live" : "USGS / offline cache",
      tone: "border-blue-500/40",
    },
    {
      key: "forecast",
      title: "FORECAST (MODERATE SCENARIO)",
      stage: FLOOD_SCENARIOS.forecast_moderate_ft,
      note: `Illustrative ≥ ${NEW_HARMONY_FLOOD_BANDS.moderate_ft} ft band`,
      tone: "border-amber-500/40",
    },
  ];

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 pointer-events-auto">
      {panels.map((p) => (
        <div
          key={p.key}
          className={`bg-slate-950/90 backdrop-blur-xl border ${p.tone} rounded-sm p-4 shadow-2xl flex flex-col gap-2`}
        >
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{p.title}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-[26px] font-black font-mono text-blue-400 leading-none">{p.stage.toFixed(1)}</span>
            <span className="text-[11px] text-slate-400 font-mono">ft gage</span>
          </div>
          <span className="text-[9px] text-slate-500 font-mono">{p.note}</span>
          <span className="text-[8px] text-slate-600 font-mono">
            BFE {BONEBANK_SITE.bfe_ft_navd88} / LAG {BONEBANK_SITE.lag_ft_navd88} NAVD88 · site clearance +{" "}
            {BONEBANK_SITE.clearance_ft} ft
          </span>
        </div>
      ))}
    </div>
  );
};
