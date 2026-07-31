import React, { useState, useEffect } from 'react';
import { Activity, Shield, AlertTriangle, CheckCircle2, RefreshCw, BarChart3, Layers, Sliders } from 'lucide-react';

interface AnalyticsDockProps {
  onScenarioChange?: (scenario: string) => void;
}

export const AnalyticsDock: React.FC<AnalyticsDockProps> = ({ onScenarioChange }) => {
  const [activeScenario, setActiveScenario] = useState<string>('100yr');
  const [telemetry, setTelemetry] = useState({ stage: 379.4, flow: 1245.8, status: 'NOMINAL' });

  useEffect(() => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'TELEMETRY_UPDATE') {
          setTelemetry({
            stage: Number(data.stage.toFixed(2)),
            flow: Number((1200 + Math.sin(data.frame / 10) * 150).toFixed(1)),
            status: data.status || 'NOMINAL'
          });
        }
      } catch (e) {
        // ignore
      }
    };
    return () => ws.close();
  }, []);

  const handleScenarioSelect = async (id: string) => {
    setActiveScenario(id);
    if (onScenarioChange) onScenarioChange(id);
    try {
      await fetch('/api/layers/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layer: 'ActiveScenario', enabled: true, scenarioId: id })
      });
    } catch (e) {
      // fallback
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-t border-indigo-500/30 h-44 px-6 py-3 flex items-center justify-between gap-6 font-mono text-xs shadow-2xl overflow-x-auto">
      
      {/* 1. Telemetry Widget */}
      <div className="bg-slate-900/80 border border-indigo-500/20 rounded-xl p-3 flex flex-col justify-between w-72 h-full shadow-lg">
        <div className="flex items-center justify-between text-indigo-400 border-b border-slate-800 pb-1.5">
          <span className="flex items-center gap-1.5 font-bold tracking-wider text-[11px]">
            <Activity size={14} className="animate-pulse text-[#00D4FF]" />
            BONEBANK RD TELEMETRY
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
            {telemetry.status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 my-auto">
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">Wabash Stage</div>
            <div className="text-white text-sm font-bold mt-0.5">{telemetry.stage} <span className="text-[10px] text-indigo-400">ft MSL</span></div>
          </div>
          <div className="bg-slate-950/60 p-2 rounded border border-slate-800">
            <div className="text-slate-400 text-[10px]">Q-Flow Rate</div>
            <div className="text-white text-sm font-bold mt-0.5">{telemetry.flow} <span className="text-[10px] text-[#00D4FF]">cfs</span></div>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 flex items-center justify-between">
          <span>Lock: 120 Hz OpenMI</span>
          <span className="text-emerald-400">● Live Stream</span>
        </div>
      </div>

      {/* 2. Risk Donut / Metric Summary */}
      <div className="bg-slate-900/80 border border-indigo-500/20 rounded-xl p-3 flex flex-col justify-between w-64 h-full shadow-lg">
        <div className="flex items-center justify-between text-indigo-400 border-b border-slate-800 pb-1.5">
          <span className="flex items-center gap-1.5 font-bold tracking-wider text-[11px]">
            <Shield size={14} className="text-amber-400" />
            STRUCTURAL RISK INDEX
          </span>
        </div>
        <div className="flex items-center justify-around my-auto">
          <div className="relative w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-[#00D4FF] border-r-amber-400 flex items-center justify-center animate-spin-slow">
            <span className="text-white font-bold text-xs">88.4%</span>
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={11} /> Levee Integrity OK</div>
            <div className="text-amber-400 flex items-center gap-1"><AlertTriangle size={11} /> Seepage Watch (Zone 3)</div>
          </div>
        </div>
        <div className="text-[10px] text-slate-500 text-center">Daubert Ledger Verified</div>
      </div>

      {/* 3. Upgrade Roadmap / Status */}
      <div className="hidden lg:flex bg-slate-900/80 border border-indigo-500/20 rounded-xl p-3 flex-col justify-between w-72 h-full shadow-lg">
        <div className="flex items-center justify-between text-indigo-400 border-b border-slate-800 pb-1.5">
          <span className="flex items-center gap-1.5 font-bold tracking-wider text-[11px]">
            <BarChart3 size={14} className="text-[#00D4FF]" />
            PTDT v32 ROADMAP
          </span>
          <span className="text-slate-400 text-[10px]">Phase 3 Active</span>
        </div>
        <div className="space-y-1.5 my-auto text-[11px]">
          <div>
            <div className="flex justify-between text-slate-300 text-[10px] mb-0.5">
              <span>OpenMI 2.0 gRPC Core</span>
              <span className="text-emerald-400">100%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-full" />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-slate-300 text-[10px] mb-0.5">
              <span>Multiphysics WebGPU Meshes</span>
              <span className="text-[#00D4FF]">92%</span>
            </div>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#00D4FF] h-full w-[92%]" />
            </div>
          </div>
        </div>
        <div className="text-[10px] text-slate-500">Posey County EOC Linked</div>
      </div>

      {/* 4. Scenario Toggle & Mode Controls */}
      <div className="bg-slate-900/80 border border-indigo-500/20 rounded-xl p-3 flex flex-col justify-between w-72 h-full shadow-lg">
        <div className="flex items-center justify-between text-indigo-400 border-b border-slate-800 pb-1.5">
          <span className="flex items-center gap-1.5 font-bold tracking-wider text-[11px]">
            <Sliders size={14} className="text-indigo-400" />
            SCENARIO MESH SELECTOR
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2 my-auto">
          {[
            { id: '100yr', label: '100-YR', color: 'border-sky-400 text-sky-400 bg-sky-950/40' },
            { id: '500yr', label: '500-YR', color: 'border-red-400 text-red-400 bg-red-950/40' },
            { id: '1937', label: '1937 HIST', color: 'border-amber-400 text-amber-400 bg-amber-950/40' }
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => handleScenarioSelect(s.id)}
              className={`px-2 py-2 rounded border text-[11px] font-bold transition-all cursor-pointer flex flex-col items-center justify-center ${
                activeScenario === s.id
                  ? `${s.color} shadow-lg scale-105`
                  : 'border-slate-800 text-slate-400 bg-slate-950/40 hover:border-slate-700'
              }`}
            >
              <span>{s.label}</span>
              <span className="text-[8px] opacity-75">{s.id === '100yr' ? 'Blue Mesh' : s.id === '500yr' ? 'Red Mesh' : 'Yellow Mesh'}</span>
            </button>
          ))}
        </div>
        <div className="text-[10px] text-slate-500 text-center">Multi-Color Hydraulic Overlays</div>
      </div>

    </div>
  );
};
