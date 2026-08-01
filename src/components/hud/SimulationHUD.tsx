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
          <span className="text-[8px] text-slate-500 uppercase block mb-1 tracking-widest">Master Cryptographic Seal</span>
          <div className="bg-slate-900/50 p-1.5 rounded-sm border border-slate-800/50 text-emerald-400">
            <span className="text-[9px] break-all leading-tight">B4782912564E70E863A7938BB3700647580830FB5A81E910A0DB49A20F73B32E</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest">Superior BCR</span>
            <span className="text-[14px] text-emerald-400 font-black">2.45</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest">FEMA BRIC BCR</span>
            <span className="text-[14px] text-white font-black">1.41</span>
          </div>
        </div>
        <div className="pt-1">
          <span className="text-[8px] text-slate-500 uppercase block mb-1 tracking-widest">Statutory Mandate Source</span>
          <div className="flex items-center justify-between px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
             <span className="text-[9px] text-emerald-400 font-black uppercase">Indiana 312 IAC 10-5</span>
             <span className="text-[9px] text-white/50 font-bold">1.20x Cut/Fill</span>
          </div>
        </div>
      </div>
    </div>
  );
};
