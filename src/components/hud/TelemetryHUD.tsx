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
  <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded p-4 min-w-[180px] flex-1">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[11px] font-black text-white tracking-widest">{id}</span>
      </div>
      <span className="text-[8px] text-slate-500 font-mono">{time} UTC</span>
    </div>
    <div className="space-y-1.5 font-mono">
      <div className="flex justify-between">
        <span className="text-[9px] text-slate-500 uppercase">Water Level:</span>
        <span className="text-[9px] text-white">{waterLevel.toFixed(2)} m</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[9px] text-slate-500 uppercase">Flow Rate:</span>
        <span className="text-[9px] text-white">{flowRate.toLocaleString()} m³/s</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[9px] text-slate-500 uppercase">Battery:</span>
        <span className="text-[9px] text-white">{battery}%</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[9px] text-slate-500 uppercase">Signal:</span>
        <span className="text-[9px] text-white">{signal} dBm</span>
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
