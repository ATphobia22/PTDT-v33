import { useState } from 'react';
import { ExecutionGraph } from './components/ExecutionGraph';
import { AssimilationView } from './components/AssimilationView';
import { EvidenceView } from './components/EvidenceView';
import { DigitalTwinView } from './components/DigitalTwinView';
import { Network, Database, Shield, MonitorPlay, Sun, Moon } from 'lucide-react';
import { cn } from './lib/utils';
import { useTheme } from './context/ThemeContext';

type Tab = 'twin' | 'dag' | 'assimilation' | 'evidence';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('twin');
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={cn("w-screen h-screen flex flex-col overflow-hidden font-sans transition-colors", theme === 'dark' ? "dark bg-[#020617] text-slate-100" : "bg-slate-50 text-slate-900")}>
      {/* Top Navigation */}
      <div className="h-14 border-b dark:border-slate-800 border-slate-200 dark:bg-[#0F172A] bg-white flex items-center px-4 justify-between shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-indigo-600 flex items-center justify-center font-bold text-white tracking-tighter">
            PT
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wide">Tri-State Digital Engineering System</h1>
            <div className="text-[10px] text-emerald-400 dark:text-emerald-400 text-emerald-600 font-mono tracking-widest uppercase">v32 Operational Build</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-1 dark:bg-slate-900 bg-slate-100 p-1 rounded-lg border dark:border-slate-800 border-slate-200 transition-colors">
            <button 
              onClick={() => setActiveTab('twin')}
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200", activeTab === 'twin' ? "dark:bg-slate-800 bg-white dark:text-white text-indigo-600 shadow" : "dark:text-slate-400 text-slate-500 hover:dark:text-slate-200 hover:text-slate-800 hover:dark:bg-slate-800/50 hover:bg-white/50")}
            >
              <MonitorPlay size={14} /> WebGPU Twin
            </button>
            <button 
              onClick={() => setActiveTab('dag')}
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200", activeTab === 'dag' ? "dark:bg-slate-800 bg-white dark:text-white text-indigo-600 shadow" : "dark:text-slate-400 text-slate-500 hover:dark:text-slate-200 hover:text-slate-800 hover:dark:bg-slate-800/50 hover:bg-white/50")}
            >
              <Network size={14} /> Execution DAG
            </button>
            <button 
              onClick={() => setActiveTab('assimilation')}
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200", activeTab === 'assimilation' ? "dark:bg-slate-800 bg-white dark:text-white text-indigo-600 shadow" : "dark:text-slate-400 text-slate-500 hover:dark:text-slate-200 hover:text-slate-800 hover:dark:bg-slate-800/50 hover:bg-white/50")}
            >
              <Database size={14} /> Assimilation
            </button>
            <button 
              onClick={() => setActiveTab('evidence')}
              className={cn("flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200", activeTab === 'evidence' ? "dark:bg-slate-800 bg-white dark:text-white text-indigo-600 shadow" : "dark:text-slate-400 text-slate-500 hover:dark:text-slate-200 hover:text-slate-800 hover:dark:bg-slate-800/50 hover:bg-white/50")}
            >
              <Shield size={14} /> Evidence
            </button>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md dark:bg-slate-800 bg-slate-200 dark:text-slate-300 text-slate-600 hover:dark:text-white hover:text-slate-900 border dark:border-slate-700 border-slate-300 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden transition-colors">
        {activeTab === 'twin' && <DigitalTwinView />}
        {activeTab === 'dag' && <ExecutionGraph />}
        {activeTab === 'assimilation' && <AssimilationView />}
        {activeTab === 'evidence' && <EvidenceView />}
      </div>
    </div>
  );
}

export default App;
