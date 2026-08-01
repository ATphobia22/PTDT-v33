import React from "react";
import { BONEBANK_SITE } from "../../lib/siteConstants";

/** Site-scale risk chrome — illustrative counts for 2.0 ac parcel, not township-wide mock 156 */
export const AssetRiskHUD: React.FC = () => {
  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-4 min-w-[280px] shadow-2xl">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 border-b border-slate-800 pb-1">
        Asset Risk Summary
      </div>
      <div className="text-[8px] text-slate-600 font-mono mb-3">
        {BONEBANK_SITE.name} · {BONEBANK_SITE.acreage} ac · clearance +{BONEBANK_SITE.clearance_ft} ft
      </div>

      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-800" strokeWidth="3" />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-emerald-500"
              strokeWidth="3"
              strokeDasharray="100"
              strokeDashoffset="12"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[8px] text-slate-500 uppercase font-mono leading-none">On-site</span>
            <span className="text-[14px] text-white font-black font-mono leading-tight">3</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-sm mb-2">
            <div className="flex justify-between items-center">
              <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest">LAG vs BFE</span>
              <span className="text-[12px] text-emerald-400 font-black font-mono">+{BONEBANK_SITE.clearance_ft} ft</span>
            </div>
            <div className="h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: "100%" }} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[9px] text-slate-400">Primary structure</span>
            <span className="text-[10px] font-bold text-emerald-400 font-mono">Above BFE</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[9px] text-slate-400">Accessory / yard</span>
            <span className="text-[10px] font-bold text-amber-400 font-mono">Monitor</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[9px] text-slate-400">Road approach</span>
            <span className="text-[10px] font-bold text-slate-300 font-mono">County</span>
          </div>
        </div>
      </div>
    </div>
  );
};
