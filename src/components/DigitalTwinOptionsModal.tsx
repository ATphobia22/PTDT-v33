import React from 'react';
import { X, Layers, Droplets, Map, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  onClose: () => void;
  assetId?: string;
}

export function DigitalTwinOptionsModal({ onClose, assetId = "IN47620_13101B - 13101 BONEBANK ROAD" }: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full h-full max-w-[1400px] flex flex-col"
      >
        <div className="flex justify-between items-center mb-4">
          <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-sm inline-flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Digital Twin Options:</span>
            <span className="text-xs font-mono font-bold text-white tracking-widest">{assetId}</span>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-700/50 rounded-sm transition-all border border-slate-700">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-4">
          {/* A) Simulation Overlay */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity group-hover:opacity-60 transition-opacity" />
            <div className="absolute inset-0 bg-blue-500/10 mix-blend-overlay pointer-events-none" />
            {/* Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,102,204,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,102,204,0.1)_1px,transparent_1px)] bg-[size:40px_40px] [transform:rotateX(60deg)] transform-origin-bottom opacity-50" />
            
            <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-700 px-3 py-1.5 rounded-sm">
              <span className="text-xs font-bold text-white tracking-widest uppercase">A) Simulation Overlay</span>
            </div>
            
            <div className="absolute bottom-4 right-4 p-3 bg-slate-950/90 border border-slate-800 rounded-sm">
               <div className="flex items-center gap-2 mb-2">
                 <Activity size={14} className="text-emerald-400" />
                 <span className="text-[10px] uppercase font-mono text-slate-300">Live Telemetry Active</span>
               </div>
               <div className="text-[10px] uppercase font-mono text-slate-500">Stage: 18.7 ft</div>
            </div>
          </div>

          {/* B) Subsurface Geology */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518002171953-a080ee817e1f?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity group-hover:opacity-50 transition-opacity" />
            <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-700 px-3 py-1.5 rounded-sm">
              <span className="text-xs font-bold text-white tracking-widest uppercase">B) Subsurface Geology</span>
            </div>
            
            {/* Strata UI */}
            <div className="absolute bottom-10 left-10 space-y-4">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-8 bg-amber-900/60 border-t border-amber-800/50 skew-x-12" />
                 <span className="text-[10px] font-mono text-amber-200 uppercase tracking-widest">Loam / Topsoil</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-16 h-12 bg-stone-700/60 border-t border-stone-600/50 skew-x-12" />
                 <span className="text-[10px] font-mono text-stone-300 uppercase tracking-widest">Sand / Gravel</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 bg-slate-950/80 border-t border-slate-800/50 skew-x-12" />
                 <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Bedrock</span>
              </div>
            </div>
            
            <div className="absolute bottom-4 right-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Depth: 0 - 10m</span>
            </div>
          </div>

          {/* C) Topographic & Drainage */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-blue-900/20" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity group-hover:opacity-50 transition-opacity" />
            
            {/* Topo Lines Overlay */}
            <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxwYXRoIGQ9Ik0wLDUwIFExMDAsMTAgMjAwLDUwIFQ0MDAsNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzEwYjk4MSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBhdGggZD0iTTAsMTAwIFExMDAsNjAgMjAwLDEwMCBUNDAwLDEwMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjMTBiOTgxIiBzdHJva2Utd2lkdGg9IjIiLz48L3N2Zz4=')] bg-repeat" />

            <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-700 px-3 py-1.5 rounded-sm">
              <span className="text-xs font-bold text-white tracking-widest uppercase">C) Topographic & Drainage Analysis</span>
            </div>
          </div>

          {/* D) Historical Flood Comparison */}
          <div className="bg-slate-900 border border-slate-700/50 rounded-sm relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-luminosity group-hover:opacity-40 transition-opacity" />
            
            {/* Simulated meshes */}
            <div className="absolute inset-x-0 bottom-0 h-[60%] bg-blue-500/10 border-t border-blue-500/30 skew-y-6 transform origin-bottom" />
            <div className="absolute inset-x-0 bottom-0 h-[70%] bg-red-500/10 border-t border-red-500/30 skew-y-6 transform origin-bottom" />
            <div className="absolute inset-x-0 bottom-0 h-[80%] bg-yellow-500/10 border-t border-yellow-500/30 skew-y-6 transform origin-bottom" />

            <div className="absolute top-4 left-4 bg-slate-950/90 border border-slate-700 px-3 py-1.5 rounded-sm">
              <span className="text-xs font-bold text-white tracking-widest uppercase">D) Historical Flood Comparison</span>
            </div>
            
            <div className="absolute top-4 right-4 bg-slate-950/90 border border-slate-800 p-3 rounded-sm space-y-2">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-300">
                <span className="text-blue-400 font-bold">100-YEAR FLOOD (Current):</span> Blue Mesh
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-300">
                <span className="text-red-400 font-bold">500-YEAR FLOOD:</span> Red Mesh
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-slate-300">
                <span className="text-yellow-400 font-bold">1937 HISTORIC FLOOD:</span> Yellow Mesh
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
