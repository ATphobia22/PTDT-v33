import React, { useState, useEffect } from 'react';
import { Layers, Check, Eye, EyeOff } from 'lucide-react';

export const LayerControlPanel: React.FC = () => {
  const [layers, setLayers] = useState<Record<string, boolean>>({
    "Geospatial Integration": true,
    "Hydrodynamic Analysis": true,
    "Structural Integrity": true,
    "Flood Mesh": true,
    "Scenario Boundaries": true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/layers')
      .then(res => res.json())
      .then(data => {
        if (data.layerState) setLayers(data.layerState);
      })
      .catch(() => {});
  }, []);

  const toggleLayer = async (layerName: string) => {
    const nextState = !layers[layerName];
    const updated = { ...layers, [layerName]: nextState };
    setLayers(updated);
    setLoading(true);
    try {
      await fetch('/api/layers/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layer: layerName, enabled: nextState })
      });
    } catch (e) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed right-6 top-20 w-64 bg-slate-950/90 backdrop-blur-xl border border-indigo-500/30 rounded-2xl p-4 shadow-2xl z-40 font-mono text-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-indigo-400">
        <span className="flex items-center gap-2 font-bold tracking-wider">
          <Layers size={14} className="text-[#00D4FF]" />
          MULTIPHYSICS LAYERS
        </span>
        <span className="text-[9px] text-slate-500">{loading ? 'Syncing...' : 'Active'}</span>
      </div>

      <div className="space-y-2">
        {Object.entries(layers).map(([layerName, enabled]) => (
          <button
            key={layerName}
            onClick={() => toggleLayer(layerName)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all cursor-pointer ${
              enabled
                ? 'bg-indigo-950/50 border-indigo-500/40 text-white shadow-md'
                : 'bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-[11px] font-medium truncate pr-2">{layerName}</span>
            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
              enabled ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-800 text-slate-600'
            }`}>
              {enabled ? <Eye size={12} /> : <EyeOff size={12} />}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 text-center">
        PTDT v32 Layer Registry
      </div>
    </div>
  );
};
