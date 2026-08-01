import React from "react";

/**
 * Flood depth legend aligned to mock HUD style.
 * Values are illustrative water-depth bins (ft) for MapLibre/mesh overlays —
 * not a substitute for sealed HEC-RAS 2D results until a mesh is attached.
 */
const BINS: { label: string; color: string }[] = [
  { label: "> 6.0", color: "#1e3a8a" },
  { label: "4.0 – 6.0", color: "#1d4ed8" },
  { label: "2.0 – 4.0", color: "#3b82f6" },
  { label: "0.5 – 2.0", color: "#93c5fd" },
  { label: "0 – 0.5", color: "#dbeafe" },
  { label: "DRY", color: "#0f172a" },
];

export const DepthLegend: React.FC<{ title?: string }> = ({ title = "WATER DEPTH (FT)" }) => {
  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-3 min-w-[140px] shadow-2xl pointer-events-auto">
      <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-slate-800 pb-1">
        {title}
      </div>
      <div className="space-y-1.5">
        {BINS.map((b) => (
          <div key={b.label} className="flex items-center gap-2">
            <div className="w-4 h-3 rounded-sm border border-slate-700" style={{ backgroundColor: b.color }} />
            <span className="text-[10px] font-mono text-slate-300">{b.label}</span>
          </div>
        ))}
      </div>
      <p className="text-[8px] text-slate-600 font-mono mt-2 leading-tight">
        Overlay bins for UI. HEC-RAS mesh = STUB until sealed run attached.
      </p>
    </div>
  );
};

export default DepthLegend;
