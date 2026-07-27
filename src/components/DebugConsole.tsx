import React, { useState, useEffect, useRef } from 'react';
import { Terminal, X, Maximize2, Minimize2, Activity, Cpu, Server, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

export function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [logs, setLogs] = useState<{ id: string, timestamp: Date, type: 'info' | 'warn' | 'error' | 'success', source: string, message: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate mock system health and data processing tasks
    const intervalId = setInterval(() => {
      const sources = ['SYSTEM', 'DATABASE', 'WEBGPU', 'PHYSICS_ENGINE', 'NETWORK'];
      const types: ('info' | 'warn' | 'error' | 'success')[] = ['info', 'info', 'info', 'success', 'warn'];
      const messages = [
        'Syncing telemetry with regional gauges...',
        'Allocating memory buffer for WebGPU spatial render...',
        'Running node convergence checks...',
        'Successfully fetched new geospatial chunk.',
        'High latency detected on USGS upstream connection.',
        'No-rise evaluation routine initialized.',
        'Heartbeat OK.'
      ];

      const source = sources[Math.floor(Math.random() * sources.length)];
      const type = types[Math.floor(Math.random() * types.length)];
      const message = messages[Math.floor(Math.random() * messages.length)];

      setLogs(prev => {
        const newLogs = [...prev, {
          id: Math.random().toString(36).substring(7),
          timestamp: new Date(),
          type,
          source,
          message
        }];
        if (newLogs.length > 100) return newLogs.slice(newLogs.length - 100);
        return newLogs;
      });
    }, 3500);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (bottomRef.current && (isOpen || isExpanded)) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen, isExpanded]);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-20 z-[100] bg-slate-900/90 text-slate-300 hover:text-white p-3 rounded-full shadow-lg border border-slate-700/50 flex items-center gap-2 hover:bg-slate-800 transition-all backdrop-blur-sm group"
      >
        <Activity size={18} className="text-emerald-500 animate-pulse" />
        <span className="text-xs font-mono max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1 transition-all duration-300">
          Open Debug Console
        </span>
      </button>
    );
  }

  return (
    <div 
      className={cn(
        "fixed bottom-0 right-0 w-full md:w-[50vw] z-[110] bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 shadow-2xl transition-all duration-300 flex flex-col font-mono text-sm text-slate-300",
        isExpanded ? "h-[50vh]" : "h-[250px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <Activity size={16} className="text-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">System Health & Data Processing Log</span>
          
          <div className="flex items-center gap-2 ml-4 text-[10px] bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800">
             <span className="flex items-center gap-1"><Server size={10} className="text-indigo-400" /> CPU: {Math.floor(Math.random() * 30 + 10)}%</span>
             <span className="flex items-center gap-1 ml-2"><Cpu size={10} className="text-amber-400" /> RAM: {Math.floor(Math.random() * 20 + 40)}%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-500">
          <button 
             onClick={() => setIsExpanded(!isExpanded)} 
             title={isExpanded ? "Collapse panel height" : "Expand panel height"}
             className="hover:text-slate-300 p-1"
          >
            {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
          <button 
             onClick={() => setIsOpen(false)} 
             title="Minimize debug console"
             className="hover:text-slate-300 p-1"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-[#050505]">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 text-[11px] leading-relaxed border-b border-white/[0.02] pb-1">
            <span className="text-slate-600 whitespace-nowrap">[{log.timestamp.toISOString().split('T')[1].slice(0, -1)}]</span>
            <span className="text-slate-500 w-24 flex-shrink-0 font-bold">[{log.source}]</span>
            <div className="flex-1 flex items-start gap-2">
              {log.type === 'success' && <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 flex-shrink-0" />}
              {log.type === 'error' && <AlertCircle size={12} className="text-rose-500 mt-0.5 flex-shrink-0" />}
              {log.type === 'warn' && <AlertCircle size={12} className="text-amber-500 mt-0.5 flex-shrink-0" />}
              {log.type === 'info' && <Terminal size={12} className="text-indigo-500 mt-0.5 flex-shrink-0" />}
              
              <span className={cn(
                log.type === 'error' ? 'text-rose-400' :
                log.type === 'warn' ? 'text-amber-400' :
                log.type === 'success' ? 'text-emerald-400' :
                'text-slate-300'
              )}>
                {log.message}
              </span>
            </div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-slate-600 text-xs italic">Awaiting system events...</div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
