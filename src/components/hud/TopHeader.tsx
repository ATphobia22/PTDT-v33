import React from 'react';
import { Shield, Activity, Wifi } from 'lucide-react';

interface TopHeaderProps {
  sysFrame: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ sysFrame }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 flex justify-between items-start pointer-events-none">
      <div className="flex flex-col gap-1 pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-950/90 backdrop-blur-xl border border-emerald-500/30 rounded-sm shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <div className="flex items-center gap-3">
            <img src="/src/assets/images/ptdt_logo_1785574942150.jpg" alt="PTDT Logo" className="w-8 h-8 rounded-sm object-cover border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.3)] animate-pulse" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-emerald-400 tracking-[0.3em] uppercase leading-none">PTDT v33.2.0</span>
                <span className="text-[10px] font-mono text-slate-500 tracking-tighter">NODE_13101_BONEBANK</span>
              </div>
              <span className="text-[14px] font-black text-white tracking-widest leading-tight uppercase">Master Sovereign Core • Point Township, IN</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800/50 mx-2" />
          <div className="flex flex-col justify-center">
            <span className="text-[9px] text-slate-500 uppercase font-mono tracking-[0.2em] leading-none mb-1">Datum: NAVD 88 / EPSG:3857</span>
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-emerald-500" />
                 <span className="text-[8px] text-emerald-500/80 uppercase font-mono tracking-widest">Precision: 5cm LiDAR</span>
               </div>
               <div className="flex items-center gap-1">
                 <div className="w-1 h-1 rounded-full bg-emerald-500" />
                 <span className="text-[8px] text-emerald-500/80 uppercase font-mono tracking-widest">Precision: High</span>
               </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/60 backdrop-blur-sm border-x border-b border-emerald-500/20 rounded-b-sm self-start ml-2">
           <span className="text-[9px] font-mono text-emerald-500/60 uppercase">Asset ID: IN47620_13101B</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        <div className="flex items-center gap-4 px-4 py-2 bg-slate-950/90 backdrop-blur-xl border border-emerald-500/30 rounded-sm shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono leading-none">System Status</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] font-mono">Operational</span>
                </div>
              </div>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800/50 mx-1" />
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-slate-500 uppercase font-mono tracking-tighter">HEC-RAS</span>
              <span className="text-[9px] text-emerald-400 font-bold font-mono">LIVE_RUN</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] text-slate-500 uppercase font-mono tracking-tighter">SWMM_V5</span>
              <span className="text-[9px] text-emerald-400 font-bold font-mono">LIVE_RUN</span>
            </div>
          </div>
          <div className="h-10 w-px bg-slate-800/50 mx-1" />
          <div className="flex flex-col items-end min-w-[120px]">
             <span className="text-[9px] text-white font-mono font-bold tracking-widest">{new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}</span>
             <span className="text-[10px] text-emerald-400 font-black font-mono tracking-[0.1em]">{new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })} UTC</span>
          </div>
        </div>
      </div>
    </div>
  );
};
