import React from 'react';
import { Check } from 'lucide-react';

interface Layer {
  id: string;
  label: string;
  active: boolean;
  meta?: string;
}

export const LayerHUD: React.FC = () => {
  const [layers, setLayers] = React.useState<Layer[]>([
    { id: 'usgs', label: 'USGS 3DEP DEM', active: true, meta: '1.5m Resolution' },
    { id: 'cesium', label: 'Cesium 3D Tiles', active: true, meta: 'Photorealistic' },
    { id: 'overture', label: 'Overture Buildings', active: true, meta: 'Level of Detail: 17' },
    { id: 'roads', label: 'Roads (GERS)', active: true, meta: 'UUID: d8f2...7a91' },
    { id: 'flood', label: 'Flood Extent (HEC-RAS)', active: true, meta: '5yr Event - Depth' },
    { id: 'sensors', label: 'Sensors (PT-001→010)', active: true, meta: 'Live Telemetry' },
  ]);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded p-4 w-48 pointer-events-auto">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Layers</div>
      <div className="space-y-3">
        {layers.map(layer => (
          <div 
            key={layer.id} 
            className="group cursor-pointer flex gap-2"
            onClick={() => toggleLayer(layer.id)}
          >
            <div className={`w-3.5 h-3.5 border flex items-center justify-center transition-colors ${layer.active ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-slate-700 bg-slate-900'}`}>
              {layer.active && <Check size={10} strokeWidth={4} />}
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] leading-none font-bold transition-colors ${layer.active ? 'text-white' : 'text-slate-500'}`}>{layer.label}</span>
              {layer.meta && <span className="text-[8px] text-slate-500 font-mono mt-0.5">{layer.meta}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
