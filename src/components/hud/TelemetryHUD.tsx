import React from 'react';
import { Wifi } from 'lucide-react';

interface SensorProps {
  id: string;
  waterLevel: number;
  flowRate: number;
  battery: number;
  signal: number;
  time: string;
}

const SensorCard: React.FC<SensorProps> = ({ id, waterLevel, flowRate, battery, signal, time }) => (
  <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-sm p-4 min-w-[200px] flex-1 shadow-2xl relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/30 group-hover:bg-emerald-500/60 transition-colors" />
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
        <div className="flex flex-col">
           <span className="text-[12px] font-black text-white tracking-[0.1em] uppercase leading-none">{id}</span>
           <span className="text-[8px] text-emerald-500/60 font-mono tracking-tighter uppercase mt-0.5">Ultrasonic Node</span>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-[8px] text-slate-500 font-mono uppercase tracking-widest">Live Sync</span>
        <span className="text-[9px] text-slate-400 font-mono font-bold">{time} UTC</span>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col">
        <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider mb-0.5">Water Stage</span>
        <div className="flex items-baseline gap-1">
          <span className="text-[14px] text-white font-black font-mono">{waterLevel.toFixed(2)}</span>
          <span className="text-[8px] text-slate-500 font-mono uppercase">m</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider mb-0.5">Flow Vol.</span>
        <div className="flex items-baseline gap-1">
          <span className="text-[14px] text-white font-black font-mono">{flowRate.toLocaleString()}</span>
          <span className="text-[8px] text-slate-500 font-mono uppercase">m³/s</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider mb-0.5">Power (Batt)</span>
        <div className="flex items-center gap-2 mt-1">
          <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
             <div className="h-full bg-emerald-500/60" style={{ width: `${battery}%` }} />
          </div>
          <span className="text-[9px] text-white font-mono font-bold">{battery}%</span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider mb-0.5">Signal (dBm)</span>
        <div className="flex items-baseline gap-1">
          <span className={`text-[12px] font-black font-mono ${signal > -70 ? 'text-emerald-400' : 'text-amber-400'}`}>{signal}</span>
          <Wifi size={10} className="text-slate-600" />
        </div>
      </div>
    </div>
  </div>
);

export const TelemetryHUD: React.FC = () => {
  const sensors = [
    { id: 'PT-001', waterLevel: 8.47, flowRate: 1247, battery: 94, signal: -67, time: '14:32:15' },
    { id: 'PT-002', waterLevel: 7.21, flowRate: 932, battery: 91, signal: -71, time: '14:32:15' },
    { id: 'PT-003', waterLevel: 6.12, flowRate: 654, battery: 89, signal: -73, time: '14:32:15' },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
        <Wifi size={12} className="text-emerald-500" />
        Telemetry Feed
      </div>
      <div className="flex gap-4">
        {sensors.map(s => <SensorCard key={s.id} {...s} />)}
      </div>
    </div>
  );
};
