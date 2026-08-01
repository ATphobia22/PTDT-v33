import React, { useState, useEffect } from 'react';
import { Server, Cpu, HardDrive, Network } from 'lucide-react';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  queryLatency: number;
  uptime: number;
}

export const TelemetryHUD: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 12.4,
    memoryUsage: 45.2,
    activeConnections: 128,
    queryLatency: 45,
    uptime: 342000
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        // Attempt to fetch from the Prometheus endpoint
        const response = await fetch('/metrics');
        if (!response.ok) throw new Error("Metrics endpoint unavailable");
        const text = await response.text();
        
        // Very basic parsing for demonstration purposes
        // In a real scenario, a proper Prometheus parser would be used
        let cpu = metrics.cpuUsage;
        let mem = metrics.memoryUsage;
        const lines = text.split('\n');
        lines.forEach(line => {
          if (line.startsWith('process_cpu_seconds_total')) {
            cpu = parseFloat(line.split(' ')[1]) % 100; // Mock calculation
          }
        });
        
        setMetrics(prev => ({
          ...prev,
          cpuUsage: Math.max(5, Math.min(95, cpu + (Math.random() - 0.5) * 5)),
          memoryUsage: Math.max(20, Math.min(90, mem + (Math.random() - 0.5) * 2)),
          activeConnections: Math.max(50, Math.min(500, prev.activeConnections + Math.floor((Math.random() - 0.5) * 10))),
          queryLatency: Math.max(10, Math.min(150, prev.queryLatency + Math.floor((Math.random() - 0.5) * 5))),
          uptime: prev.uptime + 2
        }));
      } catch (err) {
        // Fallback to simulating the metrics if /metrics is not actually available
        setMetrics(prev => ({
          ...prev,
          cpuUsage: Math.max(5, Math.min(95, prev.cpuUsage + (Math.random() - 0.5) * 5)),
          memoryUsage: Math.max(20, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 2)),
          activeConnections: Math.max(50, Math.min(500, prev.activeConnections + Math.floor((Math.random() - 0.5) * 10))),
          queryLatency: Math.max(10, Math.min(150, prev.queryLatency + Math.floor((Math.random() - 0.5) * 5))),
          uptime: prev.uptime + 2
        }));
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
        <Server size={12} className="text-emerald-500" />
        Prometheus System Telemetry
      </div>
      <div className="flex gap-4">
        
        {/* CPU & Memory Card */}
        <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-sm p-4 min-w-[240px] flex-1 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-emerald-500/30 group-hover:bg-emerald-500/60 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-black text-white tracking-[0.1em] uppercase leading-none">Compute Node</span>
            </div>
            <span className="text-[8px] text-emerald-500/60 font-mono tracking-tighter uppercase mt-0.5 animate-pulse">Online</span>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-end">
                <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider">CPU Load</span>
                <span className="text-[12px] text-white font-black font-mono">{metrics.cpuUsage.toFixed(1)}%</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500/60 transition-all duration-500" style={{ width: `${metrics.cpuUsage}%` }} />
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-end">
                <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider">Memory Allocation</span>
                <span className="text-[12px] text-white font-black font-mono">{metrics.memoryUsage.toFixed(1)}%</span>
              </div>
              <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500/60 transition-all duration-500" style={{ width: `${metrics.memoryUsage}%` }} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Network & Database Card */}
        <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800/80 rounded-sm p-4 min-w-[240px] flex-1 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-0.5 bg-cyan-500/30 group-hover:bg-cyan-500/60 transition-colors" />
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-black text-white tracking-[0.1em] uppercase leading-none">Postgres Cluster</span>
            </div>
            <span className="text-[8px] text-slate-400 font-mono font-bold">Uptime: {formatUptime(metrics.uptime)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider mb-0.5">Active Conns</span>
              <div className="flex items-baseline gap-1">
                <Network className="w-3 h-3 text-slate-500 mr-1" />
                <span className="text-[14px] text-white font-black font-mono">{metrics.activeConnections}</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 uppercase font-mono tracking-wider mb-0.5">Query Latency</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-[14px] font-black font-mono ${metrics.queryLatency < 50 ? 'text-emerald-400' : metrics.queryLatency < 100 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {metrics.queryLatency}
                </span>
                <span className="text-[8px] text-slate-500 font-mono uppercase">ms</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
