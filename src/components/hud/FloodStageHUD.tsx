import React from 'react';
import { Activity, AlertTriangle, TrendingUp } from 'lucide-react';

export const FloodStageHUD: React.FC = () => {
  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-5 w-64 pointer-events-auto flex flex-col gap-4 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50" />
      
      <div className="flex flex-col gap-1">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Activity size={12} className="text-blue-400" />
          Flood Stage
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[32px] font-black text-white leading-none tracking-tighter">18.7</span>
          <span className="text-[14px] font-bold text-slate-400 uppercase font-mono">ft</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
           <div className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-sm">
             <TrendingUp size={10} className="text-blue-400" />
             <span className="text-[9px] font-bold text-blue-400 font-mono">+0.42 / hr</span>
           </div>
        </div>
      </div>

      <div className="h-px bg-slate-800/50" />

      <div className="space-y-3">
        <div className="flex flex-col">
          <span className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Forecast (Next 24h)</span>
          <span className="text-[16px] text-white font-black font-mono">20.3 ft</span>
          <span className="text-[9px] text-blue-400 uppercase font-bold tracking-tighter mt-0.5">Moderate Flooding Predicted</span>
        </div>

        <div className="flex flex-col bg-amber-500/5 border border-amber-500/20 rounded-sm p-2">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={12} className="text-amber-500" />
            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Risk Level</span>
          </div>
          <span className="text-[14px] text-white font-black uppercase tracking-wider">Moderate</span>
        </div>
      </div>

      <div className="space-y-2 mt-2">
        <div className="text-[9px] text-slate-500 uppercase font-mono tracking-widest border-b border-slate-800 pb-1">Impacted Assets</div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-300">Buildings</span>
          <span className="text-[11px] font-black text-white font-mono">12</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-300">Road Segments</span>
          <span className="text-[11px] font-black text-white font-mono">3</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-slate-300">Bridges</span>
          <span className="text-[11px] font-black text-white font-mono">1</span>
        </div>
      </div>
    </div>
  );
};
