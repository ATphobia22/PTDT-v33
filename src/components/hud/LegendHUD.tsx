import React from 'react';

export const LegendHUD: React.FC = () => {
  const levels = [
    { label: '> 6.0', color: '#1e3a8a' },
    { label: '4.0 – 6.0', color: '#1d4ed8' },
    { label: '2.0 – 4.0', color: '#3b82f6' },
    { label: '0.5 – 2.0', color: '#60a5fa' },
    { label: '0 – 0.5', color: '#93c5fd' },
    { label: 'DRY', color: '#020617' },
  ];

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-5 w-64 pointer-events-auto shadow-2xl">
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Legend</div>
      <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mb-4 font-mono">Water Depth (m)</div>
      <div className="space-y-3">
        {levels.map(level => (
          <div key={level.label} className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-sm border border-slate-800/50" style={{ backgroundColor: level.color }} />
            <span className="text-[10px] font-black font-mono text-slate-300 tracking-wider uppercase">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
