import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';

export const SimulationHUD: React.FC = () => {
  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-4 flex flex-col gap-3 min-w-[320px] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rotate-45 translate-x-8 -translate-y-8" />
      
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Database size={12} className="text-emerald-500" />
          Evidence / Daubert Ledger
        </div>
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Chain Anchored</span>
        </div>
      </div>
      
      <div className="space-y-3 font-mono">
        <div>
          <span className="text-[8px] text-slate-500 uppercase block mb-1 tracking-widest">Simulation Hash (SHA-256)</span>
          <div className="bg-slate-900/50 p-1.5 rounded-sm border border-slate-800/50">
            <span className="text-[9px] text-white/80 break-all leading-tight">A3F7C9B1D2E4F8A6B0C9D7E2F1A4E6F8D9C0B1A2C3D4E5F6A7B8C9D0E1F2A3B4</span>
          </div>
        </div>
        <div>
          <span className="text-[8px] text-slate-500 uppercase block mb-1 tracking-widest">Ethereum Tx Hash</span>
          <div className="bg-slate-900/50 p-1.5 rounded-sm border border-slate-800/50">
            <span className="text-[9px] text-emerald-400/80 break-all leading-tight">0X8F3A7C2D1E4B9A8F0C9D7E2F1A4E6F8D9C0B1A2C3D4E5F6A7B8C9D0E1F2A3B4C</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest">Block Height</span>
            <span className="text-[11px] text-white font-black">#47,281,345</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest">Sync Latency</span>
            <span className="text-[11px] text-emerald-400 font-black">12.4ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
