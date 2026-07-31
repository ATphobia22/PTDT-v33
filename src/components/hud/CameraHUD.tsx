import React, { useState, useEffect } from 'react';

export const CameraHUD: React.FC = () => {
  const [camera, setCamera] = useState({
    lat: 37.903512,
    lon: -88.000742,
    alt: 362.2,
    heading: 134.7,
    pitch: -35.2,
    roll: 0.0
  });

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-4 w-64 pointer-events-auto shadow-2xl">
      <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-1 flex justify-between items-center">
        <span>Camera Telemetry</span>
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
      </div>
      
      <div className="grid grid-cols-2 gap-y-3 gap-x-6 font-mono">
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 uppercase tracking-widest">Latitude</span>
          <span className="text-[11px] text-white font-bold">{camera.lat.toFixed(6)}° N</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 uppercase tracking-widest">Longitude</span>
          <span className="text-[11px] text-white font-bold">{Math.abs(camera.lon).toFixed(6)}° W</span>
        </div>
        <div className="flex flex-col col-span-2">
          <span className="text-[8px] text-slate-500 uppercase tracking-widest">Altitude (NAVD88)</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[14px] text-white font-black">{camera.alt.toFixed(1)}</span>
            <span className="text-[9px] text-slate-500 uppercase">meters</span>
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 uppercase tracking-widest">Heading</span>
          <span className="text-[11px] text-emerald-400 font-bold">{camera.heading.toFixed(1)}°</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[8px] text-slate-500 uppercase tracking-widest">Pitch</span>
          <span className="text-[11px] text-emerald-400 font-bold">{camera.pitch.toFixed(1)}°</span>
        </div>
      </div>
      
      <div className="mt-4 pt-3 border-t border-slate-800/50 flex justify-between items-center">
        <span className="text-[8px] text-slate-600 uppercase font-mono tracking-widest">Camera Link: Active</span>
        <div className="flex gap-1">
           {[1,2,3,4].map(i => <div key={i} className="w-1 h-2 bg-emerald-500/40 rounded-full" />)}
        </div>
      </div>
    </div>
  );
};
