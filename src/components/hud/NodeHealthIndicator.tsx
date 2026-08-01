import React, { useState, useEffect } from 'react';
import { Activity, Server } from 'lucide-react';

export const NodeHealthIndicator: React.FC = () => {
  const [coreHealth, setCoreHealth] = useState<'healthy' | 'failing' | 'checking'>('checking');
  const [dbHealth, setDbHealth] = useState<'healthy' | 'failing' | 'checking'>('checking');

  useEffect(() => {
    // Simulate real-time checking of Docker container endpoints
    const interval = setInterval(() => {
      // In a real environment, this would ping the actual /health endpoints
      // For this demonstration, we'll simulate a mostly healthy state with occasional blips
      setCoreHealth(Math.random() > 0.05 ? 'healthy' : 'failing');
      setDbHealth(Math.random() > 0.02 ? 'healthy' : 'failing');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-6 right-6 z-[120] flex gap-3 pointer-events-auto">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-full shadow-lg">
        <div className={`w-2 h-2 rounded-full ${coreHealth === 'healthy' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : coreHealth === 'failing' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-amber-500'} transition-colors`} />
        <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">
          ptdt_archimedes_core_app
        </span>
      </div>
      
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-full shadow-lg">
        <div className={`w-2 h-2 rounded-full ${dbHealth === 'healthy' ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : dbHealth === 'failing' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : 'bg-amber-500'} transition-colors`} />
        <span className="text-[9px] font-mono font-bold text-slate-300 uppercase tracking-widest">
          ptdt_secure_postgres_cluster
        </span>
      </div>
    </div>
  );
};
