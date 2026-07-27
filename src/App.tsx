import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { DigitalTwinView } from './components/DigitalTwinView';
import NextGenDigitalTwin from './components/NextGenDigitalTwin';
import { OvertureTwinView } from './components/OvertureTwinView';
import { SovereignCitadelView } from './components/SovereignCitadelView';
import { useTheme } from './context/ThemeContext';
import { useAudioSystem } from './context/AudioContext';
import { Power, Activity, Cpu, Layers, Globe, Shield } from 'lucide-react';

function App() {
  const { theme } = useTheme();
  const { isSystemOn, setSystemOn } = useAudioSystem();
  const [activeSystemView, setActiveSystemView] = useState<'tactical' | 'webgpu' | 'nextgen' | 'overture' | 'citadel'>('tactical');

  if (!isSystemOn) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center font-mono p-6 relative overflow-hidden select-none">
        {/* CRT Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.05)_0%,transparent_100%)] z-10" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20" />
        
        <div className="max-w-md w-full bg-slate-900/40 border border-indigo-500/20 rounded-lg p-6 backdrop-blur-md shadow-2xl relative z-30 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 animate-pulse">
            <Power className="text-[#00D4FF] h-8 w-8" />
          </div>
          
          <div className="space-y-2 w-full">
            <h1 className="text-sm font-bold tracking-widest text-[#00D4FF] uppercase">TRI-STATE FAMILY SYSTEM</h1>
            <p className="text-[10px] text-slate-500 uppercase">STATE: DEACTIVATED / DEEP STANDBY</p>
          </div>
          <div className="h-px bg-slate-800 w-full" />
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
            Tri-State Family Engineering System has been shut down. Hydraulic twin sensors, USGS data streams, and automated simulation nodes are currently offline.
          </p>
          <button
            onClick={() => setSystemOn(true)}
            className="mt-2 w-full py-2 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 hover:border-indigo-500/60 text-[#00D4FF] rounded text-xs font-bold font-mono tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
          >
            <Power size={14} />
            BOOT PHYSICAL SYSTEM
          </button>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeSystemView) {
      case 'tactical':
        return <Dashboard />;
      case 'webgpu':
        return <DigitalTwinView />;
      case 'nextgen':
        return <NextGenDigitalTwin />;
      case 'overture':
        return <OvertureTwinView />;
      case 'citadel':
        return <SovereignCitadelView />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''} w-screen h-screen overflow-hidden relative`}>
      {/* Universal Floating Cockpit Control Dock */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] pointer-events-auto flex items-center gap-2 px-3 py-1.5 dark:bg-[#001428]/95 bg-white/95 backdrop-blur-md dark:border-indigo-500/35 border-slate-200 border rounded-full shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-slate-200 dark:border-indigo-500/20 text-xs font-mono font-bold dark:text-[#00D4FF] text-indigo-700">
          <Shield size={13} className="animate-pulse" />
          <span className="hidden xs:inline text-[10px] tracking-widest">PTDT COMMAND</span>
        </div>
        <div className="flex items-center gap-1">
          {[
            { id: 'tactical', name: 'Tactical GIS', icon: Activity, desc: 'Primary dashboard & real-time telemetry console' },
            { id: 'webgpu', name: 'WebGPU 3D Sim', icon: Cpu, desc: 'WebAudio & Three.js physics multi-physics twin' },
            { id: 'nextgen', name: 'NextGen Workbench', icon: Layers, desc: 'Multi-layer GIS analytical mapping stack' },
            { id: 'overture', name: 'Overture PMT', icon: Globe, desc: 'Overture vector tiles & 3D buildings explorer' },
            { id: 'citadel', name: 'Sovereign Citadel', icon: Shield, desc: 'Sovereign Citadel' }
          ].map((sys) => {
            const active = activeSystemView === sys.id;
            const Icon = sys.icon;
            return (
              <button
                key={sys.id}
                onClick={() => setActiveSystemView(sys.id as any)}
                title={sys.desc}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'dark:text-slate-400 text-slate-600 hover:dark:text-white hover:text-slate-900 hover:dark:bg-slate-800 hover:bg-slate-100'
                }`}
              >
                <Icon size={12} className={active ? 'animate-bounce text-[#00D4FF]' : ''} />
                <span className="hidden md:inline text-[9px] uppercase tracking-wider">{sys.name}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Main View Container */}
      <div className="w-full h-full relative">
        {renderActiveView()}
      </div>
    </div>
  );
}

export default App;
