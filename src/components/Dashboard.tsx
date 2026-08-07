import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Settings,
  X,
  Music,
  Volume2,
  VolumeX,
  Power,
  Eye,
  EyeOff,
  Ruler,
  Download,
  MousePointer2,
  Maximize2,
  Minimize2,
  Activity,
  Globe,
  Network,
  Moon,
  Sun,
  Map,
} from "lucide-react";
import { MapComponent } from "./MapComponent";
import { useTheme } from "../context/ThemeContext";
import { useAudioSystem } from "../context/AudioContext";

// HUD Components
import { TopHeader } from "./hud/TopHeader";
import { CameraHUD } from "./hud/CameraHUD";
import { LayerHUD } from "./hud/LayerHUD";
import { LegendHUD } from "./hud/LegendHUD";
import { TelemetryHUD } from "./hud/TelemetryHUD";
import { SimulationHUD } from "./hud/SimulationHUD";
import { FloodStageHUD } from "./hud/FloodStageHUD";
import { LocationContextHUD } from "./hud/LocationContextHUD";
import { AssetRiskHUD } from "./hud/AssetRiskHUD";
import { InfrastructureHUD } from "./hud/InfrastructureHUD";
import { CrossSectionHUD } from "./hud/CrossSectionHUD";
import { NodeHealthIndicator } from "./hud/NodeHealthIndicator";
import { HydraulicFlowMonitor } from "./hud/HydraulicFlowMonitor";
import { FloodRiskHUD } from "./hud/FloodRiskHUD";
import { RegionalContextHUD } from "./hud/RegionalContextHUD";
import { CinematicFlyoverModal } from "./CinematicFlyoverModal";
import { DigitalTwinOptionsModal } from "./DigitalTwinOptionsModal";

export function Dashboard() {
  const [activePanel, setActivePanel] = useState<
    | "telemetry"
    | "evidence"
    | "system"
    | "upgrades"
    | "ai"
    | "archimedes"
    | "datum"
  >("telemetry");
  const { theme, setTheme, toggleTheme } = useTheme();
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCinematicModal, setShowCinematicModal] = useState(false);
  const [showDigitalTwinModal, setShowDigitalTwinModal] = useState(false);
  const [showFloodRisk, setShowFloodRisk] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const {
    isMuted,
    toggleMute,
    volume,
    setVolume,
    setSystemOn,
    currentSoundscape,
    setSoundscape,
  } = useAudioSystem();

  const [telemetryRate, setTelemetryRate] = useState<
    "live" | "15s" | "60s" | "manual"
  >("live");
  const [meshDensity, setMeshDensity] = useState<"low" | "medium" | "high">(
    "medium",
  );
  const [vectorSearchTolerance, setVectorSearchTolerance] =
    useState<number>(0.15);

  const [layerOpacities, setLayerOpacities] = useState({
    geospatial: 100,
    hydrodynamic: 100,
    structural: 100,
  });

  const handleOpacityChange = (layerKey: string, value: number) => {
    setLayerOpacities((prev) => ({ ...prev, [layerKey]: value }));
  };

  const [layers, setLayers] = useState({
    geospatial: true,
    hydrodynamic: true,
    structural: false,
    predictiveBounds: "100year",
  });

  const [surgeStage, setSurgeStage] = useState(377.2);
  const [sysFrame, setSysFrame] = useState("47620");
  const [scenarioHorizon, setScenarioHorizon] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const handleBackupExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/turbovec/backup");
      if (!response.ok) throw new Error("Backup response failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `digital_twin_backup_${new Date().toISOString().slice(0, 10)}.zip`;
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
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const ws = new WebSocket(`${protocol}//${window.location.host}`);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "TELEMETRY_UPDATE") {
          setSurgeStage(data.stage);
          // Update frame logic if needed
        }
      } catch (err) {
        console.error("Error parsing telemetry stream:", err);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans select-none">
      {/* Background Map - Full Screen */}
      <div className="absolute inset-0 z-0">
        <MapComponent layers={layers} layerOpacities={layerOpacities} />
      </div>

      {/* Global Vignette/Gradient Overlay */}
      <div className="absolute inset-0 z-5 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.5)_100%)]" />

      {/* HUD - Overlay */}
      <div className="absolute inset-0 z-10 p-6 pointer-events-none flex flex-col">
        <NodeHealthIndicator />
        <TopHeader sysFrame={sysFrame} />

        {!zenMode && (
          <>
            {/* Middle Content Area */}
            <div className="flex-1 flex justify-between items-center mt-12 mb-6">
              {/* Left Sidebar */}
              <div className="flex flex-col gap-4 items-start self-start mt-10">
                {showFloodRisk ? <FloodRiskHUD /> : <FloodStageHUD />}
                <LocationContextHUD />
                <CameraHUD />
              </div>

              {/* Center Visualization Controls (Optional floating widgets could go here) */}
              <div className="flex-1" />

              {/* Right Sidebar */}
              <div className="flex flex-col gap-4 items-end self-start mt-10">
                <RegionalContextHUD />
                <LayerHUD />
                <LegendHUD />

                {/* Floating Tool Bar */}
                <div className="flex flex-col gap-2 pointer-events-auto">
                  {[
                    {
                      id: "floodRisk",
                      icon: Activity,
                      label: "Toggle Flood Risk Panel",
                    },
                    {
                      id: "cinematic",
                      icon: Maximize2,
                      label: "Cinematic Flyover",
                    },
                    {
                      id: "digitalTwin",
                      icon: Globe,
                      label: "Digital Twin Analysis",
                    },
                    {
                      id: "select",
                      icon: MousePointer2,
                      label: "Select Feature",
                    },
                    {
                      id: "measure",
                      icon: Ruler,
                      label: "Measure Distance/Area",
                    },
                    {
                      id: "export",
                      icon: Download,
                      label: "Export Spatial Data",
                    },
                  ].map((tool) => (
                    <button
                      key={tool.id}
                      title={tool.label}
                      onClick={() => {
                        if (tool.id === "cinematic")
                          setShowCinematicModal(true);
                        else if (tool.id === "digitalTwin")
                          setShowDigitalTwinModal(true);
                        else if (tool.id === "floodRisk")
                          setShowFloodRisk(!showFloodRisk);
                        else
                          setActiveTool(
                            activeTool === tool.id ? null : tool.id,
                          );
                      }}
                      className={`p-2.5 backdrop-blur-md border rounded-sm shadow-2xl transition-all cursor-pointer ${
                        activeTool === tool.id ||
                        (tool.id === "floodRisk" && showFloodRisk)
                          ? "bg-emerald-500 border-emerald-400 text-slate-950"
                          : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/50"
                      }`}
                    >
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

            {/* Bottom HUD Section - Analytics & Insights Row */}
            <div className="mt-auto pointer-events-auto">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-px bg-slate-800 flex-1" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                    Analytics & Predictive Insights
                  </span>
                  <div className="h-px bg-slate-800 flex-1" />
                </div>

                <div className="flex gap-4 items-stretch justify-between h-[180px]">
                  <AssetRiskHUD />
                  <HydraulicFlowMonitor />
                  <InfrastructureHUD />
                  <CrossSectionHUD />
                  <SimulationHUD />
                </div>

                {/* Telemetry Strip */}
                <div className="mt-4">
                  <TelemetryHUD />
                </div>
              </div>

              {/* Bottom Control Strip */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-800/50">
                <div className="flex gap-8">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      Real-time Stream: USGS + Weather + IoT
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Network size={14} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                      AI/ML Forecasting: 24h / 72h Predictive Horizon
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex flex-col items-end px-4 py-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-sm">
                    <span className="text-[8px] text-slate-500 uppercase font-mono tracking-widest leading-tight mb-0.5">
                      Global Node Consensus
                    </span>
                    <span className="text-[10px] text-emerald-400 font-black font-mono leading-tight">
                      99.98% VERIFIED
                    </span>
                  </div>
                  <button
                    onClick={() => setZenMode(true)}
                    className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-sm hover:text-emerald-400 transition-all text-slate-500 group"
                    title="Collapse HUD"
                  >
                    <EyeOff
                      size={18}
                      className="group-hover:scale-110 transition-transform"
                    />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {zenMode && (
          <div className="absolute bottom-10 right-10 pointer-events-auto">
            <button
              onClick={() => setZenMode(false)}
              className="p-4 bg-emerald-500 text-slate-950 rounded-full hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] group"
              title="Expand HUD"
            >
              <Eye
                size={24}
                className="group-hover:scale-110 transition-transform"
              />
            </button>
          </div>
        )}
      </div>

      {/* Footer / Status Bar Strip */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-900 z-[100] overflow-hidden">
        <div className="h-full bg-emerald-500/30 animate-pulse w-full relative">
          <div
            className="absolute inset-0 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
            style={{ width: "65%" }}
          />
        </div>
      </div>
      <div className="absolute bottom-2 right-4 z-[100] pointer-events-none">
        <span className="text-[9px] font-black font-mono text-slate-700 tracking-[0.3em] uppercase">
          PTDT Systems • Tucker Cognitive OS • L4 AUTONOMY
        </span>
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
                  Procedural synth background ambient track dynamically
                  synthesized via the Web Audio API.
                </p>
              </div>

              <div className="dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] dark:text-slate-400 text-slate-600 font-mono">
                    AUDIO CORES:
                  </span>
                  <button
                    onClick={toggleMute}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded cursor-pointer transition-all border ${
                      isMuted
                        ? "dark:bg-slate-800 bg-slate-200 dark:border-slate-700 border-slate-300 text-slate-500 hover:bg-slate-300"
                        : "dark:bg-indigo-500/20 bg-indigo-50 dark:border-indigo-500/40 border-indigo-200 dark:text-[#00D4FF] text-indigo-600 hover:bg-indigo-100"
                    }`}
                  >
                    {isMuted ? "MUTE ON" : "PLAYING"}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {isMuted ? (
                    <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                  )}
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
                  <span className="text-[8px] font-mono dark:text-slate-500 text-slate-400 uppercase tracking-wider block">
                    Soundscapes
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSoundscape("hydraulic")}
                      className={`py-1 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase ${
                        currentSoundscape === "hydraulic"
                          ? "dark:bg-indigo-500/20 bg-indigo-100 dark:border-indigo-500/40 border-indigo-300 dark:text-[#00D4FF] text-indigo-600 font-extrabold"
                          : "dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Hydraulic Pulse
                    </button>
                    <button
                      onClick={() => setSoundscape("family")}
                      className={`py-1 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase ${
                        currentSoundscape === "family"
                          ? "dark:bg-indigo-500/20 bg-indigo-100 dark:border-indigo-500/40 border-indigo-300 dark:text-[#00D4FF] text-indigo-600 font-extrabold"
                          : "dark:bg-slate-900 bg-white dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-600 hover:bg-slate-50"
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
                  {theme === "dark" || theme === "blueprint" ? (
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-indigo-500" />
                  )}
                  Cockpit Visual Mode
                </h3>
                <p className="text-[9px] dark:text-slate-500 text-slate-600 mb-3 leading-normal">
                  Toggle day and night lighting levels to adjust the display's
                  high-contrast visibility matrix.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-2">
                <button
                  onClick={() => setTheme("light")}
                  className={`py-1.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 ${
                    theme === "light"
                      ? "bg-indigo-100 border-indigo-300 text-indigo-600 font-extrabold"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sun size={11} /> Day
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`py-1.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 ${
                    theme === "dark" || theme === "blueprint"
                      ? "dark:bg-indigo-500/20 dark:border-indigo-500/40 text-[#00D4FF] font-extrabold"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Moon size={11} /> Night
                </button>
                <button
                  onClick={() => setTheme("blueprint")}
                  className={`py-1.5 rounded text-[9px] font-mono font-bold border transition-all cursor-pointer uppercase flex items-center justify-center gap-1.5 ${
                    theme === "blueprint"
                      ? "bg-blue-900/30 border-blue-400/50 text-blue-300 font-extrabold"
                      : "bg-transparent border-transparent text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Map size={11} /> Blueprint
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
                  Define the streaming ingestion frequency for regional physical
                  gauges.
                </p>
              </div>

              <div className="dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-2.5 space-y-3">
                <div className="grid grid-cols-2 gap-1.5">
                  {(["live", "15s", "60s", "manual"] as const).map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setTelemetryRate(rate)}
                      className={`py-1 rounded text-[8px] font-mono font-bold border transition-all cursor-pointer uppercase ${
                        telemetryRate === rate
                          ? "dark:bg-indigo-500/20 bg-indigo-100 dark:border-indigo-500/40 border-indigo-300 text-indigo-600 dark:text-[#00D4FF]"
                          : "bg-transparent border-transparent dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
                      }`}
                    >
                      {rate === "live"
                        ? "⚡ LIVE SYNC"
                        : rate === "manual"
                          ? "⏸ MANUAL"
                          : `⏱ ${rate}`}
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
                  Adjust WebGPU finite element mesh density used for depth
                  solver calculations.
                </p>
              </div>

              <div className="dark:bg-slate-900/60 bg-slate-50 border border-slate-200 dark:border-slate-800 rounded p-2.5 space-y-2">
                <div className="flex gap-1.5">
                  {(["low", "medium", "high"] as const).map((density) => (
                    <button
                      key={density}
                      onClick={() => setMeshDensity(density)}
                      className={`flex-1 py-1 rounded text-[8px] font-mono font-bold border transition-all cursor-pointer uppercase ${
                        meshDensity === density
                          ? "dark:bg-indigo-500/20 bg-indigo-100 dark:border-indigo-500/40 border-indigo-300 text-indigo-600 dark:text-[#00D4FF]"
                          : "bg-transparent border-transparent dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
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
                  Set the threshold distance for identifying nearest historic
                  anomalies.
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
                    onChange={(e) =>
                      setVectorSearchTolerance(parseFloat(e.target.value))
                    }
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
                Suspend simulation calculations and transition the physical node
                into deep standby power-saver state.
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

      {showCinematicModal && (
        <CinematicFlyoverModal
          onClose={() => setShowCinematicModal(false)}
          onPlay={() => console.log("Playing flyover...")}
        />
      )}

      {showDigitalTwinModal && (
        <DigitalTwinOptionsModal
          onClose={() => setShowDigitalTwinModal(false)}
        />
      )}
    </div>
  );
}
