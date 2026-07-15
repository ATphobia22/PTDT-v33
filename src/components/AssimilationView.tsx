import { LineChart, Activity, Radio, Target } from 'lucide-react';
import { cn } from '../lib/utils';

export function AssimilationView() {
  return (
    <div className="w-full h-full p-6 dark:bg-[#020617] bg-slate-50 dark:text-slate-100 text-slate-900 flex flex-col gap-6 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold tracking-tight">EnKF Data Assimilation</h2>
        <p className="text-sm dark:text-slate-400 text-slate-500 font-mono">Real-time telemetry integration and uncertainty bounding</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric Cards */}
        <div className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-[#0F172A] bg-white flex flex-col gap-2">
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-wider">
            <Radio size={14} /> Live Sensors
          </div>
          <div className="text-3xl font-light">1,248</div>
          <div className="text-xs dark:text-slate-500 text-slate-400">USGS, NOAA MRMS, SCADA</div>
        </div>
        
        <div className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-[#0F172A] bg-white flex flex-col gap-2">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-wider">
            <Activity size={14} /> Ensemble Members
          </div>
          <div className="text-3xl font-light">100</div>
          <div className="text-xs dark:text-slate-500 text-slate-400">Stochastic forecast generation</div>
        </div>

        <div className="p-4 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-[#0F172A] bg-white flex flex-col gap-2">
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-wider">
            <Target size={14} /> Mean Innovation Error
          </div>
          <div className="text-3xl font-light">0.02 ft</div>
          <div className="text-xs dark:text-slate-500 text-slate-400">Observation vs Forecast ({"$\\mathbf{y} - \\mathcal{H}\\mathbf{x}$"})</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-[400px]">
        {/* Mock Chart Area */}
        <div className="rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-[#0F172A] bg-white p-4 flex flex-col">
          <div className="text-sm font-medium mb-4 flex items-center justify-between">
            <span>Water Surface Elevation (Gauge 0412345)</span>
            <span className="px-2 py-1 dark:bg-slate-800 bg-white rounded text-[10px] font-mono dark:text-slate-300 text-slate-700">Live</span>
          </div>
          <div className="flex-1 border dark:border-slate-800 border-slate-200/50 border-dashed rounded-lg flex items-center justify-center relative overflow-hidden dark:bg-slate-900 bg-slate-100/50">
            {/* Very simple CSS representation of EnKF spread */}
            <div className="absolute inset-0 flex items-center px-4">
              <div className="w-full h-32 relative">
                {/* Uncertainty Band */}
                <div className="absolute top-4 bottom-4 left-0 right-0 bg-indigo-500/10 rounded-full blur-md animate-pulse"></div>
                {/* Ensemble Mean */}
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <path d="M0,50 Q25,30 50,50 T100,50" fill="none" stroke="#6366f1" strokeWidth="2" className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  {/* Observation Points */}
                  <circle cx="10" cy="48" r="1.5" fill="#10b981" />
                  <circle cx="30" cy="35" r="1.5" fill="#10b981" />
                  <circle cx="50" cy="52" r="1.5" fill="#10b981" />
                  <circle cx="70" cy="55" r="1.5" fill="#10b981" />
                  <circle cx="90" cy="49" r="1.5" fill="#10b981" />
                </svg>
                <div className="absolute top-0 right-4 flex gap-3 text-[10px] font-mono dark:text-slate-400 text-slate-500">
                   <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Mean</div>
                   <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Obs</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Matrix Diagnostics */}
        <div className="rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-[#0F172A] bg-white p-4 flex flex-col">
          <div className="text-sm font-medium mb-4">Covariance Matrix Diagnostics</div>
          <div className="flex-1 flex flex-col gap-3 font-mono text-xs">
            <div className="flex justify-between p-2 dark:bg-slate-900 bg-slate-100 rounded border dark:border-slate-800 border-slate-200">
              <span className="dark:text-slate-400 text-slate-500">Localization Radius</span>
              <span className="text-indigo-300">5.0 km</span>
            </div>
            <div className="flex justify-between p-2 dark:bg-slate-900 bg-slate-100 rounded border dark:border-slate-800 border-slate-200">
              <span className="dark:text-slate-400 text-slate-500">Inflation Factor ($\alpha$)</span>
              <span className="text-indigo-300">1.05</span>
            </div>
            <div className="flex justify-between p-2 dark:bg-slate-900 bg-slate-100 rounded border dark:border-slate-800 border-slate-200">
              <span className="dark:text-slate-400 text-slate-500">Matrix Condition Number</span>
              <span className="text-emerald-400">Healthy (1.2e3)</span>
            </div>
            <div className="mt-4 p-3 dark:bg-slate-900 bg-slate-100 rounded border dark:border-slate-800 border-slate-200 overflow-hidden relative">
              <div className="dark:text-slate-500 text-slate-400 mb-2">Kalman Gain Matrix ({"$\\mathbf{K}$"}) Heatmap Snapshot</div>
              <div className="grid grid-cols-12 gap-px dark:bg-slate-800 bg-white p-px rounded opacity-70">
                {Array.from({length: 144}).map((_, i) => (
                  <div key={i} className="aspect-square bg-indigo-500" style={{ opacity: Math.random() * 0.8 + 0.1 }}></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
