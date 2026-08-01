import { Dashboard } from './components/Dashboard';
import { DebugConsole } from './components/DebugConsole';
import { TerminalOverlay } from './components/TerminalOverlay';
import { useTheme } from './context/ThemeContext';
import { useAudioSystem } from './context/AudioContext';
import { Power, Activity, Shield } from 'lucide-react';

function App() {
  const { theme } = useTheme();
  const { isSystemOn, setSystemOn } = useAudioSystem();

  if (!isSystemOn) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center font-mono p-6 relative overflow-hidden select-none">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30" 
          style={{ backgroundImage: 'url(/src/assets/images/ptdt_system_deactivated_1785575091081.jpg)' }}
        />
        {/* CRT Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.05)_0%,transparent_100%)] z-10" />
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20" />
        
      <div className="max-w-md w-full bg-slate-900/40 border border-emerald-500/20 rounded-lg p-6 backdrop-blur-md shadow-2xl relative z-30 flex flex-col items-center gap-4 text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 animate-pulse">
          <Power className="text-emerald-400 h-8 w-8" />
        </div>
        
        <div className="space-y-2 w-full">
          <h1 className="text-sm font-bold tracking-widest text-emerald-400 uppercase">TRI-STATE FAMILY SYSTEM</h1>
          <p className="text-[10px] text-slate-500 uppercase">STATE: DEACTIVATED / DEEP STANDBY</p>
        </div>

        <div className="h-px bg-slate-800 w-full" />

        <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
          Tri-State Family Engineering System has been shut down. Hydraulic twin sensors, USGS data streams, and automated simulation nodes are currently offline.
        </p>

        <button
          onClick={() => setSystemOn(true)}
          className="mt-2 w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 hover:border-emerald-500/60 text-emerald-400 rounded text-xs font-bold font-mono tracking-widest transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
        >
          <Power size={14} />
          BOOT PHYSICAL SYSTEM
        </button>
      </div>
      </div>
    );
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : theme === 'blueprint' ? 'dark blueprint' : ''} w-screen h-screen overflow-hidden relative`}>
      {/* Main View Container */}
      <div className="w-full h-full relative">
        <Dashboard />
      </div>

      <DebugConsole />
      <TerminalOverlay />
    </div>
  );
}

export default App;
