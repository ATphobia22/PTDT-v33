import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface Layer {
  id: string;
  label: string;
  active: boolean;
  meta?: string;
}

export const LayerHUD: React.FC = () => {
  const [layers, setLayers] = React.useState<Layer[]>([
    { id: 'flood', label: 'Flood Extent (HEC-RAS)', active: true, meta: '5yr Event - Live' },
    { id: 'depth', label: 'Water Depth (m)', active: true, meta: '0.1m Precision' },
    { id: 'points', label: 'Flood Stage Points', active: true, meta: 'USGS/IoT Stream' },
    { id: 'infra', label: 'Critical Infrastructure', active: true, meta: 'High Priority Assets' },
    { id: 'buildings', label: 'Cesium Buildings', active: true, meta: 'LOD 17 / Photorealistic' },
    { id: 'roads', label: 'Roads (GERS)', active: true, meta: 'UUID: d8f2...7a91' },
    { id: 'terrain', label: 'USGS 3DEP Terrain', active: true, meta: '1.5m Resolution' },
  ]);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-5 w-64 pointer-events-auto shadow-2xl">
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-1">HUD Layers</div>
      <div className="space-y-4">
        {layers.map(layer => (
          <div 
            key={layer.id} 
            className="group cursor-pointer flex items-center justify-between"
            onClick={() => toggleLayer(layer.id)}
          >
            <div className="flex flex-col">
              <span className={`text-[11px] leading-tight font-black transition-colors ${layer.active ? 'text-white' : 'text-slate-600'}`}>{layer.label.toUpperCase()}</span>
              {layer.meta && <span className="text-[8px] text-slate-500 font-mono mt-0.5">{layer.meta}</span>}
            </div>
            <div className={`transition-colors ${layer.active ? 'text-emerald-400' : 'text-slate-800'}`}>
              {layer.active ? <Eye size={14} /> : <EyeOff size={14} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
