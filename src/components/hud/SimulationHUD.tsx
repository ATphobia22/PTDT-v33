import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';

export const SimulationHUD: React.FC = () => {
  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded p-4 flex flex-col gap-3 min-w-[320px]">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Database size={12} className="text-emerald-500" />
          Evidence / Daubert Ledger
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-tighter">Anchored</span>
        </div>
      </div>
      
      <div className="space-y-3 font-mono">
        <div>
          <span className="text-[8px] text-slate-500 uppercase block mb-0.5">Simulation Hash (SHA256):</span>
          <span className="text-[9px] text-white break-all leading-tight">a3f7c9b1d2e4f8a...9c7d2b1a4e6f8d9c</span>
        </div>
        <div>
          <span className="text-[8px] text-slate-500 uppercase block mb-0.5">Tx Hash:</span>
          <span className="text-[9px] text-emerald-400/80 break-all leading-tight">0x8f3a7c2d1e4b9a8f...d2b1c4e7f8a9b0c</span>
        </div>
        <div className="flex justify-between">
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 uppercase">Block:</span>
            <span className="text-[9px] text-white">47281345</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-slate-500 uppercase">Timestamp:</span>
            <span className="text-[9px] text-white">2025-07-18 14:32:10 UTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
