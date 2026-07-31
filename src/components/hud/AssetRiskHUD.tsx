import React from 'react';

export const AssetRiskHUD: React.FC = () => {
  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-4 min-w-[280px] shadow-2xl">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-1">Asset Risk Summary</div>
      
      <div className="flex items-center gap-6">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-800" strokeWidth="3" />
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-emerald-500" strokeWidth="3" strokeDasharray="100" strokeDashoffset="44" />
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-amber-500" strokeWidth="3" strokeDasharray="100" strokeDashoffset="73" />
            <circle cx="18" cy="18" r="16" fill="none" className="stroke-rose-500" strokeWidth="3" strokeDasharray="100" strokeDashoffset="88" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[8px] text-slate-500 uppercase font-mono leading-none">Total</span>
            <span className="text-[14px] text-white font-black font-mono leading-tight">156</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[9px] text-slate-400">High Risk</span>
            </div>
            <span className="text-[10px] font-bold text-white font-mono">24 (15%)</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-[9px] text-slate-400">Moderate Risk</span>
            </div>
            <span className="text-[10px] font-bold text-white font-mono">45 (29%)</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[9px] text-slate-400">Low Risk</span>
            </div>
            <span className="text-[10px] font-bold text-white font-mono">87 (56%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
