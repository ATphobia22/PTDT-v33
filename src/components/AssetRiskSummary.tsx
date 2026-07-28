import React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export function AssetRiskSummary() {
  return (
    <div className="flex flex-col justify-between h-full w-full font-sans text-slate-100">
      <div>
        <div className="text-rose-400 font-bold mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
          <AlertTriangle size={14} /> Asset Risk Inventory
        </div>
        <div className="text-[10px] text-slate-400 grid grid-cols-[1fr_60px] border-b border-slate-700/50 pb-1 mb-2">
          <span>TARGET CRITICAL STRUCTURE</span>
          <span className="text-right">RISK INDX</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-2">
        <div className="grid grid-cols-[1fr_60px] text-[11px] items-center">
          <span className="text-slate-200">13101 Bonebank Rd Main</span>
          <span className="text-emerald-400 text-right font-bold flex items-center justify-end gap-1"><CheckCircle2 size={10} /> 0.12</span>
        </div>
        <div className="grid grid-cols-[1fr_60px] text-[11px] items-center">
          <span className="text-slate-200">West Bank Access Roadway</span>
          <span className="text-amber-400 text-right font-bold flex items-center justify-end gap-1"><AlertTriangle size={10} /> 0.48</span>
        </div>
        <div className="grid grid-cols-[1fr_60px] text-[11px] items-center">
          <span className="text-slate-200">Low-Elevation Substation</span>
          <span className="text-rose-400 text-right font-bold flex items-center justify-end gap-1"><ShieldAlert size={10} /> 0.87</span>
        </div>
      </div>

      <div className="text-[9px] text-slate-500 font-mono mt-auto border-t border-slate-800/50 pt-1">
        Matrix updates based on calculated wave height profile intersection constraints.
      </div>
    </div>
  );
}
