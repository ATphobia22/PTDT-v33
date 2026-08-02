import React from 'react';

export const InfrastructureHUD: React.FC = () => {
  const assets = [
    { name: 'Main St Bridge', stage: '18.2 ft', risk: 'MODERATE', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { name: 'Riverside Depot', stage: '17.8 ft', risk: 'MODERATE', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    { name: 'Water Treatment Plant', stage: '15.1 ft', risk: 'LOW', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Hospital', stage: '14.3 ft', risk: 'LOW', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
  ];

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-4 min-w-[280px] shadow-2xl">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-1">Critical Infrastructure</div>
      
      <div className="space-y-3">
        {assets.map(asset => (
          <div key={asset.name} className="flex items-center justify-between group">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-300 group-hover:text-white transition-colors">{asset.name}</span>
              <span className="text-[8px] text-slate-500 font-mono">{asset.stage}</span>
            </div>
            <div className={`px-2 py-0.5 rounded-sm border text-[8px] font-black tracking-widest ${asset.color}`}>
              {asset.risk}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
