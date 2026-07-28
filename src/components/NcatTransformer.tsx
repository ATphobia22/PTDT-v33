import React, { useState } from 'react';
import { RefreshCw, ArrowRight, Info, AlertTriangle, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TransformationResult {
  success: boolean;
  input: {
    lat: number;
    lon: number;
    height_ft: number;
    datum: string;
  };
  output: {
    height_ft: number;
    datum: string;
    shift_ft: number;
    uncertainty_m: number;
  };
  meta: {
    src: string;
    engine: string;
    disclaimer: string;
  };
}

const NcatTransformer: React.FC = () => {
  const [lat, setLat] = useState<string>('37.8459');
  const [lon, setLon] = useState<string>('-88.0051');
  const [height, setHeight] = useState<string>('375.0');
  const [inDatum, setInDatum] = useState<string>('ngvd29');
  const [outDatum, setOutDatum] = useState<string>('navd88');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TransformationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTransform = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/transform-elevation?lat=${lat}&lon=${lon}&height=${height}&inDatum=${inDatum}&outDatum=${outDatum}`
      );
      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Transformation failed');
      }
    } catch (err) {
      setError('Connection to NGS API failed. Verify network connectivity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl border dark:border-slate-800 border-slate-200 dark:bg-[#0F172A] bg-white shadow-sm h-full">
      <div className="flex items-center justify-between border-b dark:border-slate-800 border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-500/10 rounded-lg">
            <RefreshCw className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold dark:text-slate-100 text-slate-900 leading-none">NCAT Vertical Transformation</h3>
            <p className="text-[10px] text-slate-500 font-mono mt-1">NGS VERTCON 3.0 Engine</p>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400">
          OFFICIAL NOAA/NGS
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-1">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Latitude (N)</label>
          <input
            type="text"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Longitude (W)</label>
          <input
            type="text"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Orthometric Height (ft)</label>
        <div className="relative">
          <input
            type="text"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 border-slate-200 rounded px-2.5 py-2 text-xs font-mono dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-500 uppercase tracking-tighter">ft MSL</div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-1">
        <div className="flex-1 space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">From Datum</label>
          <select
            value={inDatum}
            onChange={(e) => setInDatum(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono dark:text-slate-200 focus:outline-none"
          >
            <option value="ngvd29">NGVD 29</option>
            <option value="navd88">NAVD 88</option>
          </select>
        </div>
        <div className="pt-5">
          <ArrowRight className="w-4 h-4 text-slate-600" />
        </div>
        <div className="flex-1 space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">To Datum</label>
          <select
            value={outDatum}
            onChange={(e) => setOutDatum(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 border-slate-200 rounded px-2.5 py-1.5 text-xs font-mono dark:text-slate-200 focus:outline-none"
          >
            <option value="navd88">NAVD 88</option>
            <option value="ngvd29">NGVD 29</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleTransform}
        disabled={loading}
        className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 group"
      >
        {loading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <>
            RUN VERTICAL TRANSFORMATION
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </>
        )}
      </button>

      <div className="flex-1 mt-2 min-h-[140px] relative">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-500"
            >
              <div className="w-10 h-1 dark:bg-slate-800 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-indigo-500"
                  animate={{ x: [-40, 40] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              </div>
              <p className="text-[10px] font-mono animate-pulse">QUERYING NCAT CLUSTER...</p>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="text-[10px] leading-relaxed">
                <p className="font-bold">TRANSFORMATION FAILED</p>
                <p className="mt-0.5 opacity-80">{error}</p>
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-3"
            >
              <div className="p-3 dark:bg-emerald-500/5 bg-emerald-50 border dark:border-emerald-500/20 border-emerald-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-emerald-500 uppercase font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Transformation Valid
                  </span>
                  <span className="text-[9px] text-slate-500 font-mono">NAVD 88 REFERENCE</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-mono font-bold dark:text-slate-100 text-slate-900 tracking-tighter">
                    {result.output.height_ft.toFixed(3)}
                    <span className="text-xs ml-1 opacity-50 font-normal">ft</span>
                  </div>
                  <div className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${result.output.shift_ft >= 0 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-orange-500/10 text-orange-400'}`}>
                    SHIFT: {result.output.shift_ft >= 0 ? '+' : ''}{result.output.shift_ft.toFixed(3)} ft
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 rounded text-[10px]">
                  <p className="text-slate-500 font-mono mb-0.5 uppercase tracking-tighter">Uncertainty</p>
                  <p className="dark:text-slate-300 text-slate-700 font-mono">±{result.output.uncertainty_m} m</p>
                </div>
                <div className="p-2 dark:bg-slate-900 bg-slate-100 border dark:border-slate-800 border-slate-200 rounded text-[10px]">
                  <p className="text-slate-500 font-mono mb-0.5 uppercase tracking-tighter">Engine</p>
                  <p className="dark:text-slate-300 text-slate-700 font-mono">VERTCON 3.0</p>
                </div>
              </div>

              <div className="flex items-start gap-1.5 px-1">
                <Info className="w-3 h-3 text-indigo-400 shrink-0 mt-0.5" />
                <p className="text-[9px] leading-relaxed text-slate-500 italic">
                  {result.meta.disclaimer} Always verify against locally published FIS conversion factors.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-full mb-3">
                <RefreshCw className="w-5 h-5 text-slate-500 opacity-20" />
              </div>
              <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                Enter structural coordinates and NGVD 29 elevation to compute NAVD 88 orthometric height.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NcatTransformer;
