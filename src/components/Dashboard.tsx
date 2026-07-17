import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Activity, Database, MonitorPlay, Network, Shield, AlertTriangle, Cpu, Globe, Sun, Moon } from 'lucide-react';
import { DigitalTwinView } from './DigitalTwinView';
import NextGenDigitalTwin from './NextGenDigitalTwin';
import { ExecutionGraph } from './ExecutionGraph';
import { AssimilationView } from './AssimilationView';
import { EvidenceView } from './EvidenceView';
import { IntegrationsView } from './IntegrationsView';
import { TerminalOverlay } from './TerminalOverlay';
import { useTheme } from '../context/ThemeContext';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('twin');
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex flex-col w-full h-full min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-white dark:bg-[#0F172A] px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
            <Globe size={20} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-none tracking-tight">Tri-State Engineering Console</h1>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono tracking-widest uppercase mt-1">
              v32.1 Operational
            </span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            System Alerts
          </Button>
          <Button variant="default" size="sm" className="hidden sm:flex gap-2 bg-indigo-600 hover:bg-indigo-700">
            <Cpu size={14} />
            Diagnostics
          </Button>
          <Button variant="outline" size="icon" onClick={toggleTheme} className="ml-2">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="flex-1 p-6 flex flex-col overflow-hidden max-w-[1600px] mx-auto w-full gap-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between mb-2">
            <TabsList className="grid w-full max-w-[750px] grid-cols-5 bg-slate-100 dark:bg-slate-900/50">
              <TabsTrigger value="twin" className="gap-2 text-xs font-semibold">
                <MonitorPlay size={14} />
                <span className="hidden sm:inline">WebGPU Twin</span>
              </TabsTrigger>
              <TabsTrigger value="gis" className="gap-2 text-xs font-semibold">
                <Globe size={14} />
                <span className="hidden sm:inline">Sovereign GIS</span>
              </TabsTrigger>
              <TabsTrigger value="dag" className="gap-2 text-xs font-semibold">
                <Network size={14} />
                <span className="hidden sm:inline">Exec DAG</span>
              </TabsTrigger>
              <TabsTrigger value="assimilation" className="gap-2 text-xs font-semibold">
                <Database size={14} />
                <span className="hidden sm:inline">Assimilation</span>
              </TabsTrigger>
              <TabsTrigger value="evidence" className="gap-2 text-xs font-semibold">
                <Shield size={14} />
                <span className="hidden sm:inline">Evidence</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-slate-500 dark:text-slate-400 font-mono hidden md:flex items-center gap-2">
              <Activity size={14} className="text-emerald-500" /> 
              Telemetry Sync Active
            </div>
          </div>

          <div className="flex-1 mt-2 min-h-0 bg-white dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
            <TabsContent value="twin" className="h-full m-0 p-0 border-0 outline-none flex">
              <DigitalTwinView />
            </TabsContent>

            <TabsContent value="gis" className="h-full m-0 p-0 border-0 outline-none flex">
              <NextGenDigitalTwin />
            </TabsContent>
            
            <TabsContent value="dag" className="h-full m-0 p-0 border-0 outline-none overflow-hidden">
              <ExecutionGraph />
            </TabsContent>

            <TabsContent value="assimilation" className="h-full m-0 p-0 border-0 outline-none overflow-auto">
              <AssimilationView />
            </TabsContent>

            <TabsContent value="evidence" className="h-full m-0 p-0 border-0 outline-none overflow-auto">
              <EvidenceView />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
