import React from 'react';
import { Shield, Activity, Wifi } from 'lucide-react';

interface TopHeaderProps {
  sysFrame: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ sysFrame }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] p-4 flex justify-between items-start pointer-events-none">
      <div className="flex flex-col gap-1 pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-2 bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 rounded-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-emerald-400 tracking-[0.2em] uppercase leading-none">PTDT v32.10.b</span>
              <span className="text-[12px] font-black text-white tracking-wider leading-tight">CESIUM 3D DIGITAL TWIN</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800 mx-2" />
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-500 uppercase font-mono tracking-widest">WGS84 Ellipsoid</span>
            <span className="text-[9px] text-emerald-500/80 uppercase font-mono tracking-widest">NAVD88 Heights • True Scale</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-950/60 backdrop-blur-sm border-x border-b border-emerald-500/20 rounded-b-sm self-start ml-2">
           <span className="text-[9px] font-mono text-emerald-500/60 uppercase">Asset ID: IN47620_13101B</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        <div className="flex items-center gap-4 px-4 py-2 bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 rounded-sm">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Simulation Status</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Live</span>
              </div>
            </div>
            <div className="flex gap-4 mt-1">
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-slate-500 uppercase font-mono">HEC-RAS:</span>
                <span className="text-[8px] text-emerald-400 font-mono">RUNNING</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-slate-500 uppercase font-mono">SWMM:</span>
                <span className="text-[8px] text-emerald-400 font-mono">RUNNING</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[8px] text-slate-500 uppercase font-mono">MODFLOW:</span>
                <span className="text-[8px] text-emerald-400 font-mono">RUNNING</span>
              </div>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800 mx-2" />
          <div className="flex flex-col items-end min-w-[100px]">
             <div className="flex gap-2">
               <span className="text-[8px] text-slate-500 uppercase font-mono">Last Update:</span>
               <span className="text-[8px] text-white font-mono">{new Date().toLocaleTimeString('en-US', { hour12: false })} UTC</span>
             </div>
             <div className="flex gap-2">
               <span className="text-[8px] text-slate-500 uppercase font-mono">Next Update:</span>
               <span className="text-[8px] text-white font-mono">{new Date(Date.now() + 5000).toLocaleTimeString('en-US', { hour12: false })} UTC</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
