import React from 'react';
import { Users, Home, Building2, DollarSign, Activity, TrendingUp, AlertCircle, Droplets } from 'lucide-react';

export const FloodRiskHUD: React.FC = () => {
  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm w-72 pointer-events-auto flex flex-col shadow-2xl relative overflow-hidden">
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-[11px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
          <Activity size={14} className="text-rose-500" />
          Flood Risk Overview
        </h3>
      </div>
      
      <div className="p-4 grid grid-cols-2 gap-3 border-b border-slate-800/50">
        <div className="flex flex-col gap-1 p-2 bg-slate-900/50 border border-slate-800 rounded-sm">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 uppercase tracking-wider font-bold">
            <Users size={10} className="text-blue-400" />
            Pop. at Risk
          </div>
          <span className="text-sm font-black text-white font-mono">128,540</span>
        </div>
        <div className="flex flex-col gap-1 p-2 bg-slate-900/50 border border-slate-800 rounded-sm">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 uppercase tracking-wider font-bold">
            <Home size={10} className="text-amber-400" />
            Structures
          </div>
          <span className="text-sm font-black text-white font-mono">45,892</span>
        </div>
        <div className="flex flex-col gap-1 p-2 bg-slate-900/50 border border-slate-800 rounded-sm">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 uppercase tracking-wider font-bold">
            <Building2 size={10} className="text-purple-400" />
            Facilities
          </div>
          <span className="text-sm font-black text-white font-mono">312</span>
        </div>
        <div className="flex flex-col gap-1 p-2 bg-slate-900/50 border border-slate-800 rounded-sm">
          <div className="flex items-center gap-1.5 text-[9px] text-slate-500 uppercase tracking-wider font-bold">
            <DollarSign size={10} className="text-emerald-400" />
            Est. Damage
          </div>
          <span className="text-sm font-black text-emerald-400 font-mono">$2.47B</span>
        </div>
      </div>

      <div className="p-4 border-b border-slate-800/50">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">Current Conditions</div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-300 font-mono">Ohio River</span>
            <div className="text-right">
              <div className="text-xs font-black text-white font-mono">36.2 ft</div>
              <div className="text-[8px] text-amber-400 uppercase tracking-widest font-bold">Minor Flood</div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-300 font-mono">Wabash River</span>
            <div className="text-right">
              <div className="text-xs font-black text-white font-mono">28.7 ft</div>
              <div className="text-[8px] text-rose-400 uppercase tracking-widest font-bold">Action Stage</div>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-300 font-mono">Rainfall (24hr)</span>
            <div className="text-xs font-black text-white font-mono">1.82 in</div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-slate-900/30">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-3">County Risk Matrix</div>
        <div className="space-y-1.5">
          {[
            { county: 'Posey, IN', risk: 'High', color: 'text-rose-500', dmg: '$412M' },
            { county: 'Vanderburgh, IN', risk: 'High', color: 'text-rose-500', dmg: '$857M' },
            { county: 'Henderson, KY', risk: 'Moderate', color: 'text-amber-500', dmg: '$298M' },
            { county: 'Union, KY', risk: 'Low', color: 'text-emerald-500', dmg: '$189M' },
          ].map(row => (
            <div key={row.county} className="flex justify-between items-center py-1 border-b border-slate-800/50 last:border-0">
              <span className="text-[9px] text-slate-400 w-24 truncate">{row.county}</span>
              <span className={`text-[9px] font-black uppercase tracking-wider ${row.color} w-16`}>{row.risk}</span>
              <span className="text-[9px] text-slate-300 font-mono">{row.dmg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
