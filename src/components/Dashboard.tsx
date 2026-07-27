import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Activity, Database, MonitorPlay, Network, Shield, AlertTriangle, Cpu, Globe, Sun, Moon, Maximize2, Server, Zap, Settings, X, Music, Volume2, VolumeX, Power } from 'lucide-react';
import { AssimilationView } from './AssimilationView';
import { EvidenceView } from './EvidenceView';
import { SystemTelemetry } from './SystemTelemetry';
import { UpgradesView } from './UpgradesView';
import { RiverCrossSection } from './RiverCrossSection';
import { MultiphysicsControls } from './MultiphysicsControls';
import { AssetRiskSummary } from './AssetRiskSummary';
import { DepthLegend } from './DepthLegend';
import { TurbovecPatternEngine } from './TurbovecPatternEngine';
import { TurbovecScorePlot } from './TurbovecScorePlot';
import { MapComponent } from './MapComponent';
import { useTheme } from '../context/ThemeContext';
import { useAudioSystem } from '../context/AudioContext';

export function Dashboard() {
  const [activePanel, setActivePanel] = useState<'telemetry' | 'evidence' | 'system' | 'upgrades' | null>('telemetry');
  const { theme, toggleTheme } = useTheme();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { isMuted, toggleMute, volume, setVolume, setSystemOn, currentSoundscape, setSoundscape } = useAudioSystem();

  const [telemetryRate, setTelemetryRate] = useState<'live' | '15s' | '60s' | 'manual'>('live');
  const [meshDensity, setMeshDensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [vectorSearchTolerance, setVectorSearchTolerance] = useState<number>(0.15);

  const [layers, setLayers] = useState({
    geospatial: true,
    hydrodynamic: true,
    structural: false,
    predictiveBounds: "100year",
  });
  
  const [surgeStage, setSurgeStage] = useState(377.2);
  const [sysFrame, setSysFrame] = useState('0000');
  const [scenarioHorizon, setScenarioHorizon] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleBackupExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/turbovec/backup');
      if (!response.ok) throw new Error("Backup response failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `digital_twin_backup_${new Date().toISOString().slice(0,10)}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      console.error("Error downloading backup:", err);
    } finally {
      setIsExporting(false);
    }
  };
  
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'TELEMETRY_UPDATE') {
          setSurgeStage(data.stage);
          setSysFrame(data.frame.toString().padStart(4, '0'));
        }
      } catch (err) {
        console.error('Error parsing telemetry stream:', err);
      }
    };
    
    return () => ws.close();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden dark:bg-slate-950 bg-slate-100 dark:text-slate-100 text-slate-900 font-sans transition-colors duration-300">
      {/* Background Map - Full Screen */}
      <div className="absolute inset-0 z-0">
        <MapComponent layers={layers} />
      </div>

      {/* HUD - Overlay */}
      <div className="absolute inset-0 z-10 p-6 pointer-events-none flex flex-col justify-between">
        {/* Header */}
        <header className="flex items-center justify-between pointer-events-auto">
          <div className="dark:bg-[#001428]/85 bg-white/95 backdrop-blur-md border-l-4 dark:border-[#00D4FF] border-indigo-600 py-2 px-4 shadow-xl border dark:border-transparent border-slate-200">
            <h1 className="text-sm font-bold tracking-wider dark:text-[#00D4FF] text-indigo-700">TRI-STATE FAMILY SYSTEM: NODE 13101</h1>
            <div className="text-[11px] font-mono dark:text-slate-400 text-slate-600 mt-1 uppercase tracking-widest flex items-center gap-2">
              <span>SYS_FRAME: <span className="dark:text-white text-indigo-900 font-bold">{sysFrame}</span></span>
              <span className="h-3 w-px dark:bg-slate-700 bg-slate-300"></span>
              <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full dark:bg-[#00D4FF] bg-emerald-500 animate-pulse"></span> STATUS: ACTIVE SECURE</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSettingsModal(true)} 
              className="p-2 dark:bg-[#001428]/85 bg-white dark:border-slate-700/50 border-slate-200 border rounded hover:dark:bg-[#003366] hover:bg-slate-50 dark:text-[#00D4FF] text-indigo-600 transition-colors shadow-xl cursor-pointer"
              title="System Configuration Settings"
            >
              <Settings size={18} />
            </button>
            <button 
              onClick={toggleTheme} 
              className="p-2 dark:bg-[#001428]/85 bg-white dark:border-slate-700/50 border-slate-200 border rounded hover:dark:bg-[#003366] hover:bg-slate-50 dark:text-[#00D4FF] text-indigo-600 transition-colors shadow-xl cursor-pointer"
              title={theme === 'dark' ? 'Switch to Day Mode' : 'Switch to Night Mode'}
            >
              {theme === 'dark' ? <Sun size={18} className="text-[#00D4FF]" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
          </div>
        </header>

        {/* Side Panels - HUD */}
        <div className="flex-1 flex gap-6 mt-6 pointer-events-none">
          <div className="w-96 flex flex-col gap-4 pointer-events-auto overflow-y-auto max-h-full pr-2 pb-16 scrollbar-hide">
            
            {/* HUD Tab Bar Navigation */}
            <div className="flex dark:bg-[#001428]/90 bg-white/95 backdrop-blur-md dark:border-slate-700 border-slate-200 border rounded-lg p-1.5 gap-1 shadow-xl">
              {(['telemetry', 'evidence', 'system', 'upgrades'] as const).map((panel) => {
                const isActive = activePanel === panel;
                let Icon = Activity;
                if (panel === 'evidence') Icon = Database;
                if (panel === 'system') Icon = Cpu;
                if (panel === 'upgrades') Icon = Zap;
                
                return (
                  <button
                    key={panel}
                    onClick={() => setActivePanel(isActive ? null : panel)}
                    className={`flex-1 flex flex-col items-center gap-1 py-1.5 px-1 rounded transition-all cursor-pointer ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-lg font-bold'
                        : 'dark:text-slate-400 text-slate-600 dark:hover:text-white hover:text-slate-900 hover:dark:bg-slate-800/60 hover:bg-slate-100'
                    }`}
                    title={isActive ? `Minimize ${panel} panel` : `Open ${panel} panel`}
                  >
                    <Icon size={14} className={isActive ? 'animate-pulse text-[#00D4FF]' : ''} />
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider">{panel}</span>
                  </button>
                );
              })}
            </div>

            {activePanel === 'telemetry' && (
              <Card className="dark:bg-slate-900/80 bg-white/90 backdrop-blur-md dark:border-slate-700 border-slate-200 dark:text-slate-100 text-slate-900 shadow-xl transition-all duration-300">
                <CardContent className="p-4">
                  <AssimilationView />
                </CardContent>
              </Card>
            )}
            {activePanel === 'evidence' && (
              <Card className="dark:bg-slate-900/80 bg-white/90 backdrop-blur-md dark:border-slate-700 border-slate-200 dark:text-slate-100 text-slate-900 shadow-xl transition-all duration-300">
                <CardContent className="p-4">
                  <EvidenceView />
                </CardContent>
              </Card>
            )}
            {activePanel === 'system' && (
              <Card className="dark:bg-slate-900/80 bg-white/90 backdrop-blur-md dark:border-slate-700 border-slate-200 dark:text-slate-100 text-slate-900 shadow-xl transition-all duration-300">
                <CardContent className="p-4">
                  <SystemTelemetry />
                </CardContent>
              </Card>
            )}
            {activePanel === 'upgrades' && (
              <Card className="dark:bg-slate-900/80 bg-white/90 backdrop-blur-md dark:border-slate-700 border-slate-200 dark:text-slate-100 text-slate-900 h-[600px] flex flex-col shadow-xl transition-all duration-300">
                <CardContent className="p-4 flex-1 overflow-hidden">
                  <UpgradesView />
                </CardContent>
              </Card>
            )}
          </div>
          <div className="flex-1"></div>
          
          {/* Right Panel - Multiphysics Controls */}
          <div className="w-80 pointer-events-auto">
            <Card className="dark:bg-slate-900/80 bg-white/90 backdrop-blur-md dark:border-slate-700 border-slate-200 dark:text-slate-100 text-slate-900 shadow-xl transition-all duration-300">
              <CardContent className="p-4">
                <MultiphysicsControls layers={layers} setLayers={setLayers} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* UPDATED BOTTOM HUB CONTAINER: MATCHING EXACT PLACEMENT PATTERNS */}
        <div style={{
          position: "absolute",
          bottom: "24px",
          left: "24px",
          right: "24px",
          display: "flex",
          gap: "24px",
          pointerEvents: "auto",
          height: "220px"
        }}>
          {/* Left Section: Dynamic D3 Cross-Section Graph */}
          <div style={{ width: "630px", flexShrink: 0 }}>
            <RiverCrossSection surgeStage={surgeStage + scenarioHorizon * 0.15} />
          </div>
        
          {/* Middle Section: Scenario Control Deck */}
          <div style={{
            flex: 1,
            background: theme === 'dark' ? "rgba(0, 10, 20, 0.8)" : "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(16px)",
            border: theme === 'dark' ? "1px solid rgba(0, 212, 255, 0.15)" : "1px solid rgba(99, 102, 241, 0.25)",
            borderRadius: "6px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
          }}>
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="dark:text-[#00D4FF] text-indigo-700 text-[13px] font-bold tracking-wider">
                    ANALYTICS & PREDICTIVE INSIGHTS
                  </div>
                  <p className="text-[10px] dark:text-slate-400 text-slate-600 mt-0.5">
                    Scenario Horizon: <span className="dark:text-white text-indigo-900 font-bold font-mono">{scenarioHorizon} Hrs</span> | Vector Lookup Active
                  </p>
                </div>
                <button
                  onClick={handleBackupExport}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[9px] dark:bg-[#00D4FF]/10 bg-indigo-50 hover:dark:bg-[#00D4FF]/20 hover:bg-indigo-100 border dark:border-[#00D4FF]/30 border-indigo-200 hover:dark:border-[#00D4FF]/60 hover:border-indigo-400 disabled:opacity-50 dark:text-[#00D4FF] text-indigo-600 rounded transition-all cursor-pointer font-bold font-mono"
                  title="Export System Snapshot Archive (.ZIP)"
                >
                  <Database size={11} /> {isExporting ? "EXPORTING..." : "EXPORT BACKUP"}
                </button>
              </div>
              
              {/* Slider */}
              <div className="mb-4 mt-2 px-2">
                <input 
                  type="range" 
                  min="0" max="72" 
                  value={scenarioHorizon} 
                  onChange={(e) => setScenarioHorizon(Number(e.target.value))}
                  className="w-full dark:accent-[#00D4FF] accent-indigo-600 cursor-pointer" 
                />
                <div className="flex justify-between text-[9px] dark:text-slate-500 text-slate-400 font-mono mt-1">
                  <span>T+0 (LIVE)</span>
                  <span>T+36</span>
                  <span>T+72 (FORECAST)</span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-4 h-[80px]">
                 <AssetRiskSummary />
                 <TurbovecPatternEngine frameCount={Number(sysFrame) + scenarioHorizon} />
                 <TurbovecScorePlot scenarioHorizon={scenarioHorizon} />
              </div>
          </div>
        
          {/* Right Section: Color Depth Metric Scale Block */}
          <div style={{ width: "260px", flexShrink: 0 }}>
            <DepthLegend />
          </div>
        </div>
      </div>

      {/* System Settings & Ambient Music Config Overlay */}
      {showSettingsModal && (
        <div className="fixed top-20 right-6 z-[150] w-[350px] flex flex-col shadow-2xl">
          <div className="bg-white dark:bg-[#001428]/95 border border-slate-200 dark:border-indigo-500/30 p-5 rounded-lg w-full font-sans relative max-h-[80vh] overflow-y-auto scrollbar-hide dark:text-slate-100 text-slate-900 transition-colors duration-300 backdrop-blur-md shadow-2xl">
            <button 
              onClick={() => setShowSettingsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            
            <div className="flex items-center gap-2 dark:text-[#00D4FF] text-indigo-700 font-bold tracking-widest text-xs uppercase mb-4 pb-2 border-b border-slate-200 dark:border-indigo-500/20 font-mono">
              <Settings size={14} />
              SYSTEM CONFIGURATION
            </div>

            {/* Background Music controls */}
            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-[11px] font-bold dark:text-slate-300 text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                  <Music className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
                  Background Music Engine
                </h3>
                <p className="text-[9px] dark:text-slate-500 text-slate-600 mb-3 leading-normal">
                  Procedural synth background ambient track dynamically synthesized via the Web Audio API.
                </p>
              </div>

              <div className="dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] dark:text-slate-400 text-slate-600 font-mono">AUDIO CORES:</span>
                  <button 
                    onClick={toggleMute}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded cursor-pointer transition-all border ${
                      isMuted 
                        ? 'dark:bg-slate-800 bg-slate-200 dark:border-slate-700 border-slate-300 text-slate-500 hover:bg-slate-300' 
                        : 'dark:bg-indigo-500/20 bg-indigo-50 dark:border-indigo-500/40 border-indigo-200 dark:text-[#00D4FF] text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    {isMuted ? 'MUTE ON' : 'PLAYING'}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-400" /> : <Volume2 className="w-3.5 h-3.5 text-indigo-500" />}
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 dark:accent-[#00D4FF] accent-indigo-600 h-1 cursor-pointer"
                  />
                  <span className="text-[9px] font-mono dark:text-slate-400 text-slate-600 w-6 text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[8px] font-mono dark:text-slate-500 text-slate-400 uppercase tracking-wider block">Soundscapes</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSoundscape('hydraulic')}
                      className={`py-1 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase ${
                        currentSoundscape === 'hydraulic'
                          ? 'dark:bg-indigo-500/20 bg-indigo-100 dark:border-indigo-500/40 border-indigo-300 dark:text-[#00D4FF] text-indigo-600 font-extrabold'
                          : 'dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Hydraulic Pulse
                    </button>
                    <button
                      onClick={() => setSoundscape('family')}
                      className={`py-1 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase ${
                        currentSoundscape === 'family'
                          ? 'dark:bg-indigo-500/20 bg-indigo-100 dark:border-indigo-500/40 border-indigo-300 dark:text-[#00D4FF] text-indigo-600 font-extrabold'
                          : 'dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Family Harmony
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual & Theme Config (Day/Night Cockpit Mode Toggle) */}
            <div className="space-y-4 mb-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <div>
                <h3 className="text-[11px] font-bold dark:text-slate-300 text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                  {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-indigo-500" />}
                  Cockpit Visual Mode
                </h3>
                <p className="text-[9px] dark:text-slate-500 text-slate-600 mb-3 leading-normal">
                  Toggle day and night lighting levels to adjust the display's high-contrast visibility matrix.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-2">
                <button
                  onClick={() => { if (theme === 'dark') toggleTheme(); }}
                  className={`py-1.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 ${
                    theme === 'light'
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-600 font-extrabold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sun size={11} /> Day Mode
                </button>
                <button
                  onClick={() => { if (theme === 'light') toggleTheme(); }}
                  className={`py-1.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 ${
                    theme === 'dark'
                      ? 'dark:bg-indigo-500/20 dark:border-indigo-500/40 text-[#00D4FF] font-extrabold'
                      : 'bg-transparent border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Moon size={11} /> Night Mode
                </button>
              </div>
            </div>

            {/* Ingestion & Physics Engine Settings (Recommended) */}
            <div className="space-y-4 mb-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <div>
                <h3 className="text-[11px] font-bold dark:text-slate-300 text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                  <Activity className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  Telemetry & Ingestion Sync Rate
                </h3>
                <p className="text-[9px] dark:text-slate-500 text-slate-600 mb-3 leading-normal">
                  Define the streaming ingestion frequency for regional physical gauges.
                </p>
              </div>

              <div className="dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-2.5 space-y-3">
                <div className="grid grid-cols-2 gap-1.5">
                  {(['live', '15s', '60s', 'manual'] as const).map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setTelemetryRate(rate)}
                      className={`py-1 rounded text-[8px] font-mono font-bold border transition-all cursor-pointer uppercase ${
                        telemetryRate === rate
                          ? 'dark:bg-indigo-500/20 bg-indigo-100 dark:border-indigo-500/40 border-indigo-300 text-indigo-600 dark:text-[#00D4FF]'
                          : 'bg-transparent border-transparent dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {rate === 'live' ? '⚡ LIVE SYNC' : rate === 'manual' ? '⏸ MANUAL' : `⏱ ${rate}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* WebGPU Grid Mesh Density (Recommended) */}
            <div className="space-y-4 mb-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <div>
                <h3 className="text-[11px] font-bold dark:text-slate-300 text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                  <Globe className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  Compute Mesh Resolution
                </h3>
                <p className="text-[9px] dark:text-slate-500 text-slate-600 mb-3 leading-normal">
                  Adjust WebGPU finite element mesh density used for depth solver calculations.
                </p>
              </div>

              <div className="dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-2.5 space-y-2">
                <div className="flex gap-1.5">
                  {(['low', 'medium', 'high'] as const).map((density) => (
                    <button
                      key={density}
                      onClick={() => setMeshDensity(density)}
                      className={`flex-1 py-1 rounded text-[8px] font-mono font-bold border transition-all cursor-pointer uppercase ${
                        meshDensity === density
                          ? 'dark:bg-indigo-500/20 bg-indigo-100 dark:border-indigo-500/40 border-indigo-300 text-indigo-600 dark:text-[#00D4FF]'
                          : 'bg-transparent border-transparent dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {density}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pattern Search Match Sensitivity (Recommended) */}
            <div className="space-y-4 mb-6 pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <div>
                <h3 className="text-[11px] font-bold dark:text-slate-300 text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                  <Network className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  Vector Match Distance Tolerance
                </h3>
                <p className="text-[9px] dark:text-slate-500 text-slate-600 mb-3 leading-normal">
                  Set the threshold distance for identifying nearest historic anomalies.
                </p>
              </div>

              <div className="dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.05"
                    max="0.50"
                    step="0.05"
                    value={vectorSearchTolerance}
                    onChange={(e) => setVectorSearchTolerance(parseFloat(e.target.value))}
                    className="flex-1 dark:accent-[#00D4FF] accent-indigo-600 h-1 cursor-pointer"
                  />
                  <span className="text-[10px] font-mono dark:text-slate-400 text-slate-600 w-8 text-right font-bold">
                    {vectorSearchTolerance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* System Power control */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
              <h3 className="text-[11px] font-bold dark:text-slate-300 text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-1.5 font-mono">
                <Power className="w-3.5 h-3.5 text-rose-500" />
                Power Grid Settings
              </h3>
              <p className="text-[9px] dark:text-slate-500 text-slate-600 mb-3 leading-normal">
                Suspend simulation calculations and transition the physical node into deep standby power-saver state.
              </p>
              
              <button
                onClick={() => {
                  setSystemOn(false);
                  setShowSettingsModal(false);
                }}
                className="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/60 text-rose-600 dark:text-rose-400 font-bold font-mono rounded text-[9px] tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Power size={11} />
                SHUTDOWN CORES
              </button>
            </div>
          </div>
        </div>
      )}

      
    </div>
  );
}
