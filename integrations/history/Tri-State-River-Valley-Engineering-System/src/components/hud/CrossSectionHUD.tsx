import React from 'react';

export const CrossSectionHUD: React.FC = () => {
  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-4 min-w-[320px] shadow-2xl relative overflow-hidden">
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-1">Cross Section View</div>
      
      <div className="relative h-32 w-full mt-2">
        {/* River Bed / Ground */}
        <svg viewBox="0 0 100 40" className="w-full h-full preserve-3d">
          <path 
            d="M 0 10 L 10 12 L 25 35 L 75 35 L 90 12 L 100 10 V 40 H 0 Z" 
            fill="#1e293b" 
            stroke="#334155" 
            strokeWidth="0.5"
          />
          {/* Water Level */}
          <path 
            d="M 12 16 L 25 35 L 75 35 L 88 16 Z" 
            fill="rgba(59, 130, 246, 0.4)" 
            className="animate-pulse"
          />
          <line x1="12" y1="16" x2="88" y2="16" stroke="#60a5fa" strokeWidth="1" strokeDasharray="2,2" />
          
          <text x="50" y="14" textAnchor="middle" fontSize="3" fill="#60a5fa" fontWeight="bold" className="font-mono">STAGE: 18.7 ft</text>
          <text x="5" y="38" fontSize="2.5" fill="#475569" className="font-mono uppercase">Ground</text>
        </svg>

        {/* Buildings Silhouettes */}
        <div className="absolute -top-4 left-0 w-8 h-8 bg-slate-800/40 border-t border-x border-slate-700/50" />
        <div className="absolute -top-6 right-0 w-10 h-10 bg-slate-800/40 border-t border-x border-slate-700/50" />
      </div>

      <div className="absolute top-2 right-2">
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[8px] text-blue-400 font-mono">Live Stage</span>
        </div>
      </div>
    </div>
  );
};
