import React from "react";

export const DEPTH_SCALE = [
  { label: "> 6.0 ft",  color: "#003bff", description: "Severe Inundation / Channel Velocity" },
  { label: "4.0 - 6.0", color: "#0090ff", description: "Moderate Overbank Flooding" },
  { label: "2.0 - 4.0", color: "#00d4ff", description: "Minor Low-Elevation Spill" },
  { label: "0.5 - 2.0", color: "#00ffb7", description: "Shallow Structural Saturation" },
  { label: "0 - 0.5",   color: "#7fffd4", description: "Surface Film / Marginal Water" },
  { label: "DRY",       color: "#1a2430", description: "Baseline Elevation / Safe Structure" },
];

export function getColorForDepth(depth: number) {
  if (depth <= 0) return "#1a2430";
  if (depth > 0 && depth <= 0.5) return "#7fffd4";
  if (depth > 0.5 && depth <= 2.0) return "#00ffb7";
  if (depth > 2.0 && depth <= 4.0) return "#00d4ff";
  if (depth > 4.0 && depth <= 6.0) return "#0090ff";
  return "#003bff";
}

export function DepthLegend() {
  return (
    <div className="bg-[#000a14]/80 backdrop-blur-md border border-[#00D4FF]/20 rounded-md p-4 w-[260px] text-white font-mono h-full flex flex-col justify-center">
      <div className="text-[11px] text-[#7a8c99] font-bold tracking-[1px] mb-3">
        LEGEND
      </div>
      <div className="text-xs text-[#a0aec0] mb-2.5">
        WATER DEPTH (FT)
      </div>
      
      <div className="flex flex-col gap-1.5">
        {DEPTH_SCALE.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div 
              style={{
                width: "18px",
                height: "18px",
                background: step.color,
                border: step.label === "DRY" ? "1px solid rgba(255,255,255,0.15)" : "none",
                borderRadius: "2px"
              }} 
            />
            <span 
              className="text-xs"
              style={{ 
                color: step.label === "DRY" ? "#7a8c99" : "#fff",
                fontWeight: step.label.includes(">") ? "bold" : "normal"
              }}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
