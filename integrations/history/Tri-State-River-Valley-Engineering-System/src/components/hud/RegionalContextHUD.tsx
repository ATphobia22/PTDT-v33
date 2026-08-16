import React from 'react';
import { Map } from 'lucide-react';

export const RegionalContextHUD: React.FC = () => {
  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-3 shadow-2xl relative overflow-hidden pointer-events-auto">
      <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <Map size={12} className="text-indigo-400" />
        Regional Context
      </div>
      <div className="relative w-48 h-32 bg-slate-900 border border-slate-800 rounded-sm flex items-center justify-center overflow-hidden">
        {/* Abstract Tri-State Map Lines */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-60">
          {/* Indiana / Illinois border (Wabash) */}
          <path d="M 40 0 C 40 20, 35 30, 45 45 C 50 55, 45 70, 48 80" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 1" />
          {/* Indiana / Kentucky border (Ohio) */}
          <path d="M 100 30 C 80 35, 60 50, 45 45 C 30 40, 20 60, 0 70" fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2 1" />
          
          <text x="25" y="25" fill="#64748b" fontSize="6" fontWeight="bold" opacity="0.8">IL</text>
          <text x="75" y="25" fill="#64748b" fontSize="6" fontWeight="bold" opacity="0.8">IN</text>
          <text x="65" y="75" fill="#64748b" fontSize="6" fontWeight="bold" opacity="0.8">KY</text>
          
          {/* Highlighted Region Box */}
          <rect x="40" y="35" width="15" height="15" fill="none" stroke="#f59e0b" strokeWidth="0.5" className="animate-pulse" />
        </svg>
      </div>
    </div>
  );
};
