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

  // Mock camera update listener - in real app, this would come from map events
  useEffect(() => {
    const handleUpdate = () => {
      // Logic to get current map camera and update state
    };
    window.addEventListener('pdt-camera-update', handleUpdate as any);
    return () => window.removeEventListener('pdt-camera-update', handleUpdate as any);
  }, []);

  return (
    <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded p-4 w-48 pointer-events-auto">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1">Camera</div>
      <div className="space-y-2 font-mono">
        <div className="flex justify-between">
          <span className="text-[9px] text-slate-500">Lat:</span>
          <span className="text-[9px] text-white font-bold">{camera.lat.toFixed(6)}° N</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] text-slate-500">Lon:</span>
          <span className="text-[9px] text-white font-bold">{Math.abs(camera.lon).toFixed(6)}° W</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] text-slate-500">Alt:</span>
          <span className="text-[9px] text-white font-bold">{camera.alt.toFixed(1)}m NAVD88</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] text-slate-500">Heading:</span>
          <span className="text-[9px] text-white font-bold">{camera.heading.toFixed(1)}°</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] text-slate-500">Pitch:</span>
          <span className="text-[9px] text-white font-bold">{camera.pitch.toFixed(1)}°</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[9px] text-slate-500">Roll:</span>
          <span className="text-[9px] text-white font-bold">{camera.roll.toFixed(1)}°</span>
        </div>
      </div>
    </div>
  );
};
