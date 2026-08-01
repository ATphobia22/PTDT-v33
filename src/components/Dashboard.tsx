import { useState, useEffect } from 'react';
import { 
  Settings, X, Music, Volume2, VolumeX, Power, 
  Eye, EyeOff, Ruler, Download, MousePointer2,
  Maximize2, Network, Moon, Sun, Map, Activity, Globe
} from 'lucide-react';
import { MapComponent } from './MapComponent';
import { useTheme } from '../context/ThemeContext';
import { useAudioSystem } from '../context/AudioContext';

import { TopHeader } from './hud/TopHeader';
import { CameraHUD } from './hud/CameraHUD';
import { LayerHUD } from './hud/LayerHUD';
import { LegendHUD } from './hud/LegendHUD';
import { TelemetryHUD } from './hud/TelemetryHUD';
import { SimulationHUD } from './hud/SimulationHUD';
import { FloodStageHUD } from './hud/FloodStageHUD';
import { LocationContextHUD } from './hud/LocationContextHUD';
import { AssetRiskHUD } from './hud/AssetRiskHUD';
import { InfrastructureHUD } from './hud/InfrastructureHUD';
import { NodeHealthIndicator } from './hud/NodeHealthIndicator';
import { HydraulicFlowMonitor } from './hud/HydraulicFlowMonitor';
import { FloodScenarioStrip } from './hud/FloodScenarioStrip';
import { DepthLegend } from './DepthLegend';

export function Dashboard() {
  const { theme, setTheme } = useTheme();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const { isMuted, toggleMute, volume, setVolume, setSystemOn, currentSoundscape, setSoundscape } = useAudioSystem();

  const [telemetryRate, setTelemetryRate] = useState<'live' | '15s' | '60s' | 'manual'>('live');
  const [meshDensity, setMeshDensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [vectorSearchTolerance, setVectorSearchTolerance] = useState<number>(0.15);

  const [layerOpacities, setLayerOpacities] = useState({
    geospatial: 100,
    hydrodynamic: 100,
    structural: 100
  });

  const [layers, setLayers] = useState({
    geospatial: true,
    hydrodynamic: true,
    structural: false,
    predictiveBounds: "100year",
  });
  
  const [sysFrame, setSysFrame] = useState('47620');

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'TELEMETRY_UPDATE' && data.frame != null) {
          setSysFrame(String(data.frame));
        }
      } catch {
        /* ignore */
      }
    };
    return () => ws.close();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      <div className="absolute inset-0 z-0">
        <MapComponent layers={layers} layerOpacities={layerOpacities} />
      </div>

      <div className="absolute inset-0 z-5 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.5)_100%)]" />

      <div className="absolute inset-0 z-10 p-6 pointer-events-none flex flex-col">
        <NodeHealthIndicator />
        <TopHeader sysFrame={sysFrame} />

        {!zenMode && (
          <>
            <div className="flex-1 flex justify-between items-start mt-12 mb-4 min-h-0">
              <div className="flex flex-col gap-4 items-start self-start mt-10 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <FloodStageHUD />
                <LocationContextHUD />
                <DepthLegend />
                <CameraHUD />
              </div>

              <div className="flex-1" />

              <div className="flex flex-col gap-4 items-end self-start mt-10">
                <LayerHUD />
                <LegendHUD />
                <div className="flex flex-col gap-2 pointer-events-auto">
                  {[
                    { id: "select", icon: MousePointer2, label: "Select Feature" },
                    { id: "measure", icon: Ruler, label: "Measure Distance/Area" },
                    { id: "export", icon: Download, label: "Export Spatial Data" },
                    { id: "fullscreen", icon: Maximize2, label: "Toggle Fullscreen" }
                  ].map((tool) => (
                    <button 
                      key={tool.id} 
                      title={tool.label} 
                      onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                      className={`p-2.5 backdrop-blur-md border rounded-sm shadow-2xl transition-all cursor-pointer ${
                        activeTool === tool.id 
                          ? "bg-emerald-500 border-emerald-400 text-slate-950" 
                          : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50"
                      }`}>
                      <tool.icon size={18} />
                    </button>
                  ))}
                  <div className="h-2" />
                  <button 
                    onClick={() => setShowSettingsModal(true)} 
                    className="p-2.5 bg-slate-950/80 border-slate-800 border rounded-sm hover:text-emerald-400 hover:border-emerald-500/50 text-slate-400 transition-all shadow-2xl cursor-pointer"
                    title="System Configuration Settings"
                  >
                    <Settings size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto pointer-events-auto space-y-4">
              <FloodScenarioStrip />

              <div className="flex items-center gap-3">
                 <div className="h-px bg-slate-800 flex-1" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Analytics & Predictive Insights</span>
                 <div className="h-px bg-slate-800 flex-1" />
              </div>
              
              <div className="flex gap-4 items-stretch justify-between flex-wrap min-h-[160px]">
                <AssetRiskHUD />
                <HydraulicFlowMonitor />
                <InfrastructureHUD />
                <SimulationHUD />
              </div>

              <TelemetryHUD />

              <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                <div className="flex gap-8 flex-wrap">
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">USGS 03378500 + 03322000 (Myers)</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Network size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">FIRM 18129C0215D · NAVD88 · 1.20× cut/fill</span>
                   </div>
                </div>

                <button 
                   onClick={() => setZenMode(true)} 
                   className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-sm hover:text-emerald-400 transition-all text-slate-500"
                   title="Collapse HUD"
                >
                   <EyeOff size={18} />
                </button>
              </div>
            </div>
          </>
        )}

        {zenMode && (
          <div className="absolute bottom-10 right-10 pointer-events-auto">
            <button 
              onClick={() => setZenMode(false)} 
              className="p-4 bg-emerald-500 text-slate-950 rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]"
              title="Expand HUD"
            >
              <Eye size={24} />
            </button>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900 z-[100] overflow-hidden">
        <div className="h-full bg-emerald-500/30 w-full relative">
           <div className="absolute inset-0 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" style={{ width: '100%' }} />
        </div>
      </div>
      <div className="absolute bottom-2 right-4 z-[100] pointer-events-none">
        <span className="text-[9px] font-black font-mono text-slate-700 tracking-[0.3em] uppercase">PTDT · Bonebank Sovereign · Zero-Key Gov Stack</span>
      </div>

      {showSettingsModal && (
        <div className="fixed top-20 right-6 z-[150] w-[350px] flex flex-col shadow-2xl pointer-events-auto">
          <div className="bg-white dark:bg-[#001428]/95 border border-slate-200 dark:border-indigo-500/30 p-5 rounded-lg w-full font-sans relative max-h-[80vh] overflow-y-auto scrollbar-hide dark:text-slate-100 text-slate-900 backdrop-blur-md">
            <button onClick={() => setShowSettingsModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X size={18} />
            </button>
            <div className="flex items-center gap-2 dark:text-[#00D4FF] text-indigo-700 font-bold tracking-widest text-xs uppercase mb-4 pb-2 border-b border-slate-200 dark:border-indigo-500/20 font-mono">
              <Settings size={14} />
              SYSTEM CONFIGURATION
            </div>

            <div className="space-y-4 mb-6">
              <h3 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                <Music className="w-3.5 h-3.5 text-indigo-400" /> Audio
              </h3>
              <div className="dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono">AUDIO:</span>
                  <button onClick={toggleMute} className="px-2.5 py-1 text-[9px] font-mono font-bold rounded border cursor-pointer">
                    {isMuted ? 'MUTE ON' : 'PLAYING'}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-500" />}
                  <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="flex-1 accent-indigo-600 h-1" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setSoundscape('hydraulic')} className={`py-1 rounded text-[9px] font-mono border ${currentSoundscape === 'hydraulic' ? 'border-indigo-400 text-indigo-400' : ''}`}>Hydraulic</button>
                  <button onClick={() => setSoundscape('family')} className={`py-1 rounded text-[9px] font-mono border ${currentSoundscape === 'family' ? 'border-indigo-400 text-indigo-400' : ''}`}>Family</button>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6 pt-4 border-t border-slate-800/80">
              <h3 className="text-[11px] font-bold uppercase font-mono flex items-center gap-1.5">
                {(theme === 'dark' || theme === 'blueprint') ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                Visual Mode
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setTheme('light')} className="py-1.5 text-[9px] font-mono border rounded">Day</button>
                <button onClick={() => setTheme('dark')} className="py-1.5 text-[9px] font-mono border rounded">Night</button>
                <button onClick={() => setTheme('blueprint')} className="py-1.5 text-[9px] font-mono border rounded flex items-center justify-center gap-1"><Map size={11} /> BP</button>
              </div>
            </div>

            <div className="space-y-2 mb-6 pt-4 border-t border-slate-800/80">
              <h3 className="text-[11px] font-bold uppercase font-mono flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Telemetry Rate</h3>
              <div className="grid grid-cols-2 gap-1.5">
                {(['live', '15s', '60s', 'manual'] as const).map((rate) => (
                  <button key={rate} onClick={() => setTelemetryRate(rate)} className={`py-1 text-[8px] font-mono border rounded uppercase ${telemetryRate === rate ? 'border-indigo-400 text-indigo-400' : ''}`}>{rate}</button>
                ))}
              </div>
            </div>

            <div className="space-y-2 mb-6 pt-4 border-t border-slate-800/80">
              <h3 className="text-[11px] font-bold uppercase font-mono flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Mesh Density</h3>
              <div className="flex gap-1.5">
                {(['low', 'medium', 'high'] as const).map((d) => (
                  <button key={d} onClick={() => setMeshDensity(d)} className={`flex-1 py-1 text-[8px] font-mono border rounded uppercase ${meshDensity === d ? 'border-indigo-400 text-indigo-400' : ''}`}>{d}</button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <button
                onClick={() => { setSystemOn(false); setShowSettingsModal(false); }}
                className="w-full py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold font-mono rounded text-[9px] tracking-wider flex items-center justify-center gap-1.5"
              >
                <Power size={11} /> SHUTDOWN CORES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
