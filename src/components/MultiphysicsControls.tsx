import React from "react";
import { Layers } from 'lucide-react';

export function MultiphysicsControls({ 
  layers, 
  setLayers, 
  layerOpacities, 
  setLayerOpacity 
}: { 
  layers: { geospatial: boolean, hydrodynamic: boolean, structural: boolean },
   layerOpacities?: { geospatial: number, hydrodynamic: number, structural: number },
   setLayerOpacity?: (layerKey: string, value: number) => void, 
  setLayers: (layers: any) => void
 
}) {
  const getOpacity = (layerKey: string) => layerOpacities ? (layerOpacities as any)[layerKey] : 100;
  const toggleLayer = (layerKey: string) => {
    setLayers((prev: any) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div className="flex flex-col w-full font-sans text-slate-100">
      <div className="text-sky-400 font-bold border-b border-sky-400/20 pb-2 mb-3 flex items-center gap-2 text-xs uppercase tracking-wider">
        <Layers size={14} /> Multiphysics Engine Control
      </div>

      <div className="flex flex-col gap-3">
        {/* Layer 1 */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[11px] font-bold text-slate-200">Geospatial Integration Mesh</div>
            <div className="text-[9px] text-slate-400">Base terrain satellite raster alignment</div>
          </div>
          <input 
            type="checkbox" 
            checked={layers.geospatial} 
            onChange={() => toggleLayer("geospatial")}
            className="accent-sky-400 cursor-pointer h-3 w-3"
          />
        </div>

        {/* Layer 2 */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[11px] font-bold text-slate-200">Hydrodynamic Analysis Loop</div>
            <div className="text-[9px] text-slate-400">Live vector calculation fluid solvers</div>
          </div>
          <input 
            type="checkbox" 
            checked={layers.hydrodynamic} 
            onChange={() => toggleLayer("hydrodynamic")}
            className="accent-emerald-400 cursor-pointer h-3 w-3"
          />
        </div>

        {/* Layer 3 */}
        <div className="flex justify-between items-center">
          <div>
            <div className="text-[11px] font-bold text-slate-200">Structural Foundation Stress</div>
            <div className="text-[9px] text-slate-400">Bending vector stress on local assets</div>
          </div>
          <input 
            type="checkbox" 
            checked={layers.structural} 
            onChange={() => toggleLayer("structural")}
            className="accent-rose-400 cursor-pointer h-3 w-3"
          />
        </div>
      </div>

      <div className="border-t border-slate-700/50 mt-3 pt-2 text-[9px] text-slate-400 font-mono flex items-center gap-1">
        PIPELINE CORE STATE: 
        <span className={layers.hydrodynamic ? "text-emerald-400" : "text-rose-400"}>
          {layers.hydrodynamic ? "RUNNING (24 FPS)" : "COMPUTE STANDBY"}
        </span>
      </div>
    </div>
  );
}
