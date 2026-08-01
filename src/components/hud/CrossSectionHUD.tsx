import React from "react";
import { BONEBANK_SITE } from "../../lib/siteConstants";

/** Schematic cross-section: ground vs BFE/LAG (not a sealed HEC-RAS section). */
export const CrossSectionHUD: React.FC = () => {
  const bfe = BONEBANK_SITE.bfe_ft_navd88;
  const lag = BONEBANK_SITE.lag_ft_navd88;
  const ffe = BONEBANK_SITE.ffe_ft_navd88;

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-4 min-w-[280px] shadow-2xl pointer-events-auto">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
        Cross Section (schematic)
      </div>
      <div className="relative h-28 w-full bg-slate-900/80 rounded-sm border border-slate-800 overflow-hidden">
        <div
          className="absolute bottom-0 left-0 right-0 bg-amber-900/40 border-t border-amber-700/50"
          style={{ height: "28%" }}
        />
        <div
          className="absolute left-0 right-0 border-t border-dashed border-blue-400/80"
          style={{ bottom: "42%" }}
        >
          <span className="absolute right-2 -top-3 text-[8px] text-blue-400 font-mono">BFE {bfe}</span>
        </div>
        <div
          className="absolute left-0 right-0 border-t border-emerald-400"
          style={{ bottom: "52%" }}
        >
          <span className="absolute right-2 -top-3 text-[8px] text-emerald-400 font-mono">LAG {lag}</span>
        </div>
        <div
          className="absolute left-0 right-0 border-t border-white/40"
          style={{ bottom: "68%" }}
        >
          <span className="absolute right-2 -top-3 text-[8px] text-slate-300 font-mono">FFE {ffe}</span>
        </div>
        <div className="absolute bottom-1 left-2 text-[8px] text-slate-500 font-mono">GROUND</div>
      </div>
      <p className="text-[8px] text-slate-600 font-mono mt-2">
        Clearance +{BONEBANK_SITE.clearance_ft} ft · NAVD88 · not HEC-RAS mesh
      </p>
    </div>
  );
};
