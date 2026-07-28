import { useTheme } from '../context/ThemeContext';
import { useEffect, useRef, useState } from 'react';
import {
  ShieldAlert, Plus, Play, Pause, Thermometer, Waves, X, Info, Maximize, Minimize, FileText,
  Link, Globe, Sliders, Database, Cpu, Layers, Activity, Eye, Settings, AlertTriangle, RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { WebGPU3DValley } from './WebGPU3DValley';
import { fetchNwsAlerts } from '../services/gisService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Spinner } from './ui/spinner';
import { Skeleton } from './ui/skeleton';

export interface ParcelInfo {
  id: string;
  tractName: string;
  lineageGroup: string;
  threatScore: number;
  isInundated: boolean;
  historicalNote: string;
  historicalEvents: string;
  grantEligibility: string;
}

export function DigitalTwinView() {
  const { theme } = useTheme();
  const viewWrapperRef = useRef<HTMLDivElement>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [isPlacingBerm, setIsPlacingBerm] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [selectedParcel, setSelectedParcel] = useState<ParcelInfo | null>(null);
  const [showDossier, setShowDossier] = useState(false);

  const [waterDepth, setWaterDepth] = useState(0.1);

  const [sidebarTab, setSidebarTab] = useState<'metrics' | 'registry'>('metrics');
  const [rasDischarge, setRasDischarge] = useState(3500);
  const [modflowActive, setModflowActive] = useState(false);
  const [platOverlayActive, setPlatOverlayActive] = useState(false);
  const [selectedMatterport, setSelectedMatterport] = useState<string | null>(null);
  const [isSyncingXSoft, setIsSyncingXSoft] = useState(false);
  const [xsoftRecord, setXsoftRecord] = useState<{ owner: string; appraisedValue: string; taxId: string } | null>(null);

  const [usgsGages, setUsgsGages] = useState<any[]>([]);
  const [usgsSource, setUsgsSource] = useState<string>('LOADING');
  const [ingestionFeed, setIngestionFeed] = useState<{ gageName: string; discharge: number; time: string } | null>(null);
  const [nwsAlerts, setNwsAlerts] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchAlerts = async () => {
      try {
        const data = await fetchNwsAlerts();
        if (isMounted && data && data.features) {
          setNwsAlerts(data.features);
        }
      } catch (err) {
        console.warn('NWS alerts fetch warning:', err);
      }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/usgs-telemetry');
        if (!res.ok) throw new Error('Failed to fetch USGS readings: ' + res.status);
        const json = await res.json();
        if (json.success && isMounted) {
          setUsgsGages(json.data || []);
          setUsgsSource(json.source || 'UNKNOWN');
        }
      } catch (err) {
        console.warn('Telemetry fetch warning:', err);
      }
    };
    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 20000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleRasDischargeChange = (val: number, gageName?: string) => {
    setRasDischarge(val);
    const depth = 0.1 + ((val - 2000) / 148000) * 4.9;
    setWaterDepth(depth);
    if (gageName) {
      setIngestionFeed({
        gageName,
        discharge: val,
        time: new Date().toLocaleTimeString(),
      });
      setTimeout(() => {
        setIngestionFeed((prev) =>
          prev?.gageName === gageName && prev?.discharge === val ? null : prev
        );
      }, 4000);
    }
  };

  const handleXSoftSync = () => {
    setIsSyncingXSoft(true);
    setXsoftRecord(null);
    setTimeout(() => {
      setIsSyncingXSoft(false);
      if (selectedParcel) {
        const g = selectedParcel.lineageGroup.toLowerCase();
        if (g === 'tucker') {
          setXsoftRecord({
            owner: 'Tri-State Family Trust',
            appraisedValue: '$285,400',
            taxId: '116-013-002-00',
          });
        } else if (g === 'yeida') {
          setXsoftRecord({
            owner: 'Posey Historical Cemetery Association',
            appraisedValue: '$1.00 (Tax Exempt)',
            taxId: '116-015-099-00',
          });
        } else if (g === 'church') {
          setXsoftRecord({
            owner: 'Point Township Nazarene Church Corp',
            appraisedValue: '$412,000 (Religious Exempt)',
            taxId: '116-018-011-00',
          });
        }
      } else {
        setXsoftRecord({
          owner: 'Unspecified Posey Township Tract',
          appraisedValue: '$175,000',
          taxId: '116-000-001-00',
        });
      }
    }, 800);
  };

  useEffect(() => {
    if (selectedParcel) setXsoftRecord(null);
  }, [selectedParcel]);

  const bayesianCurveData = [
    { returnPeriod: 5, lower: 2500, mode: 3500, upper: 4800 },
    { returnPeriod: 10, lower: 3200, mode: 4800, upper: 6500 },
    { returnPeriod: 50, lower: 5500, mode: 8500, upper: 11000 },
    { returnPeriod: 100, lower: 7200, mode: 11200, upper: 14500 },
    { returnPeriod: 500, lower: 11500, mode: 17800, upper: 23000 },
  ];

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewWrapperRef.current?.requestFullscreen?.().catch(() => undefined);
    } else {
      document.exitFullscreen?.().catch(() => undefined);
    }
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isSimulating) {
      interval = setInterval(() => {
        setWaterDepth((prev) => {
          const next = prev + 0.1;
          return next > 5 ? 0.1 : next;
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating]);

  useEffect(() => {
    if (isSimulating) {
      if (waterDepth >= 5) setRasDischarge(2000);
      else setRasDischarge(2000 + ((waterDepth - 0.1) / 4.9) * 10000);
    }
  }, [waterDepth, isSimulating]);

  return (
    <div
      ref={viewWrapperRef}
      className="w-full h-full relative dark:bg-[#020617] bg-slate-50 dark:text-slate-100 text-slate-900 flex overflow-hidden"
    >
      <div className="flex-1 relative">
        <div className="absolute inset-0">
          <WebGPU3DValley
            waterLevel={waterDepth}
            onParcelClick={(info) => {
              setSelectedParcel(info);
              setShowDossier(true);
            }}
          />
        </div>

        {ingestionFeed && (
          <div className="absolute top-16 right-4 z-20 backdrop-blur-xl dark:bg-[#0f172a]/95 bg-white/95 border border-emerald-500/30 px-3.5 py-2.5 rounded-lg shadow-xl max-w-xs flex flex-col gap-1 pointer-events-auto">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-[9px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>USGS Telemetry Stream Ingested</span>
            </div>
            <div className="text-[11px] font-bold dark:text-slate-100 text-slate-800 truncate font-mono">
              {ingestionFeed.gageName}
            </div>
            <div className="text-[10px] dark:text-slate-400 text-slate-500 font-mono">
              Boundary Inflow:{' '}
              <span className="text-emerald-400 font-bold">
                {ingestionFeed.discharge.toLocaleString()} cfs
              </span>
            </div>
          </div>
        )}

        <div className="absolute top-6 left-6 z-10 pointer-events-none">
          <div className="dark:bg-[#0F172A] bg-white/80 backdrop-blur-md border dark:border-slate-800 border-slate-200 rounded-xl p-4 min-w-[280px]">
            <h2 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2">
              <Waves className="w-5 h-5 text-indigo-400" />
              WebGPU Twin Engine
            </h2>
            <p className="text-xs dark:text-slate-400 text-slate-500 font-mono mb-4">
              Wabash-Ohio Confluence Model
            </p>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm dark:text-slate-400 text-slate-500">Simulation Status</span>
                <span
                  className={cn(
                    'text-xs font-mono px-2 py-0.5 rounded',
                    isSimulating
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  )}
                >
                  {isSimulating ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm dark:text-slate-400 text-slate-500">Water Depth</span>
                <span
                  className={cn(
                    'text-sm font-mono font-bold',
                    waterDepth > 2.25 ? 'text-red-400' : 'text-indigo-400'
                  )}
                >
                  {waterDepth.toFixed(2)}m
                </span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="absolute top-6 right-6 z-10 p-2.5 rounded-lg dark:bg-[#0F172A] bg-white/80 backdrop-blur-md border dark:border-slate-800 border-slate-200 dark:text-slate-400 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4 dark:bg-[#0F172A] bg-white/80 backdrop-blur-md border dark:border-slate-800 border-slate-200 p-2 rounded-xl">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
              isSimulating
                ? 'dark:bg-slate-800 bg-white hover:dark:bg-slate-700 text-slate-900 dark:text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            )}
          >
            {isSimulating ? <Pause size={16} /> : <Play size={16} />}
            {isSimulating ? 'Halt Simulation' : 'Run Inundation'}
          </button>
          <button
            onClick={() => {
              setIsPlacingBerm(!isPlacingBerm);
              if (!isPlacingBerm) setSelectedParcel(null);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg dark:bg-slate-800 bg-white font-medium text-sm',
              isPlacingBerm && 'bg-indigo-600 text-white'
            )}
          >
            <Plus size={16} />
            {isPlacingBerm ? 'Stop Placing' : 'Place Berm'}
          </button>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg dark:bg-slate-800 bg-white font-medium text-sm',
              showHeatmap && 'bg-emerald-600 text-white'
            )}
          >
            <Thermometer size={16} />
            Heatmap
          </button>
        </div>
      </div>

      {!isFullscreen && (
        <div className="w-80 border-l dark:border-slate-800 border-slate-200 dark:bg-[#0F172A] bg-white flex flex-col shrink-0 z-10">
          <div className="flex border-b dark:border-slate-800 border-slate-200 shrink-0">
            <button
              onClick={() => setSidebarTab('metrics')}
              className={cn(
                'flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                sidebarTab === 'metrics'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent dark:text-slate-500 text-slate-600'
              )}
            >
              <Activity size={13} />
              Metrics
            </button>
            <button
              onClick={() => setSidebarTab('registry')}
              className={cn(
                'flex-1 py-3 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                sidebarTab === 'registry'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent dark:text-slate-500 text-slate-600'
              )}
            >
              <Database size={13} />
              Registry Hub
            </button>
          </div>

          {sidebarTab === 'metrics' ? (
            <div className="p-4 space-y-6 overflow-y-auto flex-1">
              <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-3 border dark:border-slate-800 border-slate-200">
                <div className="text-2xl font-light font-mono text-emerald-400">
                  {rasDischarge.toFixed(0)} <span className="text-sm dark:text-slate-500 text-slate-600">cfs</span>
                </div>
                <div className="text-xs dark:text-slate-400 text-slate-500 mt-1">Discharge Rate</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs dark:text-slate-500 text-slate-600 font-medium uppercase tracking-wider flex items-center justify-between">
                  <span>Live USGS River Gauges</span>
                  <span
                    className={cn(
                      'text-[8px] font-mono px-1.5 py-0.5 rounded',
                      usgsSource === 'USGS_NWIS_LIVE'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-amber-500/10 text-amber-400'
                    )}
                  >
                    {usgsSource === 'USGS_NWIS_LIVE' ? 'LIVE NWIS' : 'FALLBACK'}
                  </span>
                </div>
                {usgsGages.length === 0 ? (
                  <Skeleton className="h-20 w-full" />
                ) : (
                  usgsGages.map((gage) => (
                    <div
                      key={gage.gauge_id}
                      className="dark:bg-slate-900 bg-slate-100 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200 flex flex-col gap-1.5"
                    >
                      <div className="font-bold text-[10px] truncate font-mono">{gage.name}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className="text-indigo-400">{gage.water_level_stage_ft?.toFixed?.(2) ?? '—'} ft</div>
                        <div className="text-emerald-400">{gage.discharge_cfs?.toLocaleString?.() ?? '—'} cfs</div>
                      </div>
                      <button
                        onClick={() => handleRasDischargeChange(gage.discharge_cfs, gage.name)}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono cursor-pointer"
                      >
                        Feed Twin
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2">
                <div className="text-xs dark:text-slate-500 text-slate-600 font-medium uppercase">NWS Active Alerts</div>
                {nwsAlerts.length === 0 ? (
                  <div className="p-3 dark:bg-slate-900 bg-slate-100 rounded-lg text-center font-mono text-[10px] dark:text-slate-400 text-slate-500 border dark:border-slate-800 border-slate-200">
                    No active alerts.
                  </div>
                ) : (
                  nwsAlerts.map((alert, index) => (
                    <div key={index} className="dark:bg-slate-900 bg-slate-100 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200">
                      <div className="font-bold text-[10px] uppercase font-mono">
                        {alert.properties?.event || 'Alert'}
                      </div>
                      <div className="text-[10px] dark:text-slate-400 text-slate-500 line-clamp-3">
                        {alert.properties?.headline || alert.properties?.description}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-3 border dark:border-slate-800 border-slate-200">
                <div className={cn('text-sm font-bold', waterDepth > 2.25 ? 'text-red-400' : 'text-emerald-400')}>
                  {waterDepth > 2.25 ? 'VIOLATION DETECTED' : 'COMPLIANT_NO_RISE'}
                </div>
              </div>

              <div className="h-28 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bayesianCurveData}>
                    <CartesianGrid strokeDasharray="2 2" stroke="#1e293b" />
                    <XAxis dataKey="returnPeriod" stroke="#64748b" style={{ fontSize: 8 }} />
                    <YAxis stroke="#64748b" style={{ fontSize: 8 }} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', fontSize: 8 }} />
                    <Line type="monotone" dataKey="mode" stroke="#3b82f6" strokeWidth={1.5} dot={{ r: 1 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="dark:bg-slate-900 bg-slate-100 rounded-lg p-2.5 border dark:border-slate-800 border-slate-200 space-y-2">
                <div className="font-bold dark:text-slate-300 text-slate-700 flex items-center gap-1">
                  <Globe size={12} className="text-indigo-400" /> Tri-State GIS & Tax Registry
                </div>
                <a href="https://poseyin.wthgis.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 flex items-center gap-1">
                  <Link size={12} /> Posey County WTHGIS
                </a>
                <button
                  onClick={handleXSoftSync}
                  disabled={isSyncingXSoft}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-indigo-600 text-white font-semibold disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw size={12} className={cn(isSyncingXSoft && 'animate-spin')} />
                  {isSyncingXSoft ? 'Syncing...' : 'Sync Valuation Records'}
                </button>
                {xsoftRecord && (
                  <div className="p-2 rounded border border-indigo-500/20 font-mono text-[11px] space-y-1">
                    <div>Tax ID: {xsoftRecord.taxId}</div>
                    <div>Owner: {xsoftRecord.owner}</div>
                    <div className="text-emerald-400">{xsoftRecord.appraisedValue}</div>
                  </div>
                )}
                <button
                  onClick={() => setPlatOverlayActive(!platOverlayActive)}
                  className={cn(
                    'w-full py-1.5 rounded border text-[11px] font-semibold cursor-pointer',
                    platOverlayActive
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40'
                      : 'dark:bg-slate-800 bg-white dark:text-slate-300 text-slate-700'
                  )}
                >
                  <Layers size={12} className="inline mr-1" />
                  {platOverlayActive ? 'Plat Grid Active' : 'Project Acres Plat Outlines'}
                </button>
                <button
                  onClick={() => setModflowActive(!modflowActive)}
                  className={cn(
                    'w-full py-1.5 rounded border text-[11px] font-semibold cursor-pointer',
                    modflowActive
                      ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                      : 'dark:bg-slate-800 bg-white dark:text-slate-300 text-slate-700'
                  )}
                >
                  <Sliders size={12} className="inline mr-1" />
                  {modflowActive ? 'MODFLOW Enabled' : 'Compute Groundwater Seepage'}
                </button>
                <button
                  onClick={() =>
                    setSelectedMatterport(
                      selectedMatterport
                        ? null
                        : selectedParcel
                          ? selectedParcel.tractName
                          : 'Wabash River Base'
                    )
                  }
                  className={cn(
                    'w-full py-1.5 rounded border text-[11px] font-semibold cursor-pointer',
                    selectedMatterport
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/40'
                      : 'dark:bg-slate-800 bg-white dark:text-slate-300 text-slate-700'
                  )}
                >
                  <Eye size={12} className="inline mr-1" />
                  {selectedMatterport ? 'Close Walkthrough' : 'Run Matterport Scanner'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {showDossier && selectedParcel && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="dark:bg-[#0F172A] bg-white border border-indigo-500/30 rounded-xl w-full max-w-3xl flex flex-col max-h-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b dark:border-slate-800 border-slate-200">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="text-indigo-400" size={20} />
                DLT Infrastructure Asset Verification Pack
              </h3>
              <button onClick={() => setShowDossier(false)} className="p-2 rounded hover:bg-slate-800">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 font-mono text-sm space-y-4">
              <p>
                Target: <strong>{selectedParcel.tractName}</strong> ({selectedParcel.id})
              </p>
              <p>Threat index: {selectedParcel.threatScore.toFixed(2)}</p>
              <p>{selectedParcel.historicalNote}</p>
              <p>{selectedParcel.historicalEvents}</p>
              <p>{selectedParcel.grantEligibility}</p>
            </div>
          </div>
        </div>
      )}

      {selectedMatterport && (
        <div className="absolute inset-4 z-20 rounded-xl dark:bg-slate-950/95 bg-white/95 border border-purple-500/40 p-4 flex flex-col backdrop-blur-md">
          <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
            <span className="text-purple-400 font-bold font-mono text-xs">MATTERPORT SCAN: {selectedMatterport}</span>
            <button onClick={() => setSelectedMatterport(null)} className="p-1">
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center text-purple-300 text-xs font-mono">
            LIDAR FIELD WALKTHROUGH MOCK ACTIVE
          </div>
        </div>
      )}
    </div>
  );
}
