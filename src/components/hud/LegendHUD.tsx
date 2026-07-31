import React from 'react';

export const LegendHUD: React.FC = () => {
  const levels = [
    { label: '0.00 – 0.25', color: '#60a5fa' },
    { label: '0.25 – 0.50', color: '#3b82f6' },
    { label: '0.50 – 1.00', color: '#fbbf24' },
    { label: '1.00 – 2.00', color: '#f97316' },
    { label: '2.00+', color: '#ef4444' },
  ];

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded p-4 w-48 pointer-events-auto">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Legend</div>
      <div className="text-[9px] text-slate-500 uppercase tracking-wider mb-2 font-mono">Flood Depth (m)</div>
      <div className="space-y-2">
        {levels.map(level => (
          <div key={level.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: level.color }} />
            <span className="text-[9px] font-mono text-slate-300 tracking-wider">{level.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
