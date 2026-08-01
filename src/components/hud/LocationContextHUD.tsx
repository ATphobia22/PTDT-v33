import React from 'react';
import { MapPin, Globe, Compass } from 'lucide-react';

export const LocationContextHUD: React.FC = () => {
  const details = [
    { label: 'Parcel ID', value: '24-7-001-000' },
    { label: 'Anchor Node', value: '13101 Bonebank Rd' },
    { label: 'Jurisdiction', value: 'Posey County, IN' },
    { label: 'Coordinates', value: '37.8412° N, 88.0145° W' },
    { label: 'Elevation Range', value: '362 - 384 ft' },
    { label: 'Section/Township', value: 'S35, T7S, R14W' },
    { label: 'Accessibility', value: 'Limited (High Water)' },
  ];

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-4 w-64 pointer-events-auto flex flex-col gap-3 shadow-2xl">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <MapPin size={14} className="text-emerald-500" />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location Context</span>
      </div>
      
      <div className="space-y-2.5">
        {details.map(item => (
          <div key={item.label} className="flex flex-col">
            <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider">{item.label}</span>
            <span className="text-[11px] text-white font-bold tracking-wide">{item.value}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2 pt-2 border-t border-slate-800">
        <div className="flex-1 flex flex-col items-center p-1.5 bg-slate-900/50 rounded-sm">
          <Globe size={12} className="text-slate-600 mb-1" />
          <span className="text-[8px] text-slate-400 uppercase font-mono">Global</span>
        </div>
        <div className="flex-1 flex flex-col items-center p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-sm">
          <Compass size={12} className="text-emerald-500 mb-1" />
          <span className="text-[8px] text-emerald-500 uppercase font-mono">Local</span>
        </div>
      </div>
    </div>
  );
};
