import React, { useMemo } from "react";

interface DataPoint {
  time: string;
  match1: number; // May 1937 Floods similarity
  match2: number; // Jan 2011 Crest similarity
}

export function TurbovecScorePlot({ scenarioHorizon }: { scenarioHorizon: number }) {
  // Generate a continuous curve of cosine similarity scores based on the active scenarioHorizon
  const plotData = useMemo(() => {
    const points: DataPoint[] = [];
    for (let h = 0; h <= 72; h += 4) {
      // Create a smooth mathematical wave for May 1937 (Match #1)
      const base1 = 82 + Math.sin(h / 8) * 8;
      // Add a secondary wave for Jan 2011 (Match #2)
      const base2 = 70 + Math.cos(h / 12) * 12;

      // Peak near the current scenarioHorizon input to represent active scenario similarity focus
      const proximity1 = Math.max(0, 10 - Math.abs(h - scenarioHorizon)) * 0.8;
      const proximity2 = Math.max(0, 10 - Math.abs(h - scenarioHorizon)) * 0.5;

      points.push({
        time: `T+${h}h`,
        match1: Math.min(100, Math.max(0, parseFloat((base1 + proximity1).toFixed(1)))),
        match2: Math.min(100, Math.max(0, parseFloat((base2 + proximity2).toFixed(1)))),
      });
    }
    return points;
  }, [scenarioHorizon]);

  // SVG dimensions
  const width = 280;
  const height = 90;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };

  const usableWidth = width - padding.left - padding.right;
  const usableHeight = height - padding.top - padding.bottom;

  // Simple min/max helpers for scaling
  const minVal = 50;
  const maxVal = 100;

  const scaleX = (index: number, total: number) => {
    return padding.left + (index / (total - 1)) * usableWidth;
  };

  const scaleY = (value: number) => {
    const ratio = (value - minVal) / (maxVal - minVal);
    return padding.top + usableHeight - ratio * usableHeight;
  };

  // Build path strings for May 1937 (Match 1) and Jan 2011 (Match 2)
  const path1 = useMemo(() => {
    if (plotData.length === 0) return "";
    return plotData
      .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(i, plotData.length)} ${scaleY(p.match1)}`)
      .join(" ");
  }, [plotData]);

  const path2 = useMemo(() => {
    if (plotData.length === 0) return "";
    return plotData
      .map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(i, plotData.length)} ${scaleY(p.match2)}`)
      .join(" ");
  }, [plotData]);

  // Find active points matching the current scenarioHorizon
  const activeIndex = Math.min(
    plotData.length - 1,
    Math.max(0, Math.round((scenarioHorizon / 72) * (plotData.length - 1)))
  );
  const activePoint = plotData[activeIndex];

  return (
    <div className="flex flex-col h-full justify-between font-mono text-[10px] text-slate-400">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[#00D4FF] font-bold text-[9px] uppercase tracking-wider">
          COSINE SIMILARITY TRACE
        </span>
        <span className="text-[8px] text-slate-500">
          Range: 50% - 100%
        </span>
      </div>

      <div className="relative flex-1 bg-[#000a14]/60 border border-slate-800/40 rounded p-1">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
          {/* Gradients */}
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00FF00" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#00FF00" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFF00" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#FFFF00" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[50, 75, 100].map((val) => (
            <line
              key={val}
              x1={padding.left}
              y1={scaleY(val)}
              x2={width - padding.right}
              y2={scaleY(val)}
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="2 2"
            />
          ))}

          {/* X axis labels */}
          {["T+0", "T+36", "T+72"].map((label, idx) => {
            const x = padding.left + (idx / 2) * usableWidth;
            return (
              <text
                key={label}
                x={x}
                y={height - 5}
                fill="rgba(122,140,153,0.7)"
                fontSize="7"
                textAnchor="middle"
              >
                {label}
              </text>
            );
          })}

          {/* Y axis labels */}
          {[50, 75, 100].map((val) => (
            <text
              key={val}
              x={padding.left - 5}
              y={scaleY(val) + 2.5}
              fill="rgba(122,140,153,0.7)"
              fontSize="7"
              textAnchor="end"
            >
              {val}%
            </text>
          ))}

          {/* Line 2 (Jan 2011 Crest) */}
          <path
            d={path2}
            fill="none"
            stroke="#ffdd00"
            strokeWidth="1.2"
            opacity="0.85"
            strokeDasharray="1 1"
          />

          {/* Line 1 (May 1937 Floods) */}
          <path
            d={path1}
            fill="none"
            stroke="#00ffb7"
            strokeWidth="1.5"
            opacity="0.95"
          />

          {/* Active scrubber indicator vertical bar */}
          {activePoint && (
            <>
              <line
                x1={scaleX(activeIndex, plotData.length)}
                y1={padding.top}
                x2={scaleX(activeIndex, plotData.length)}
                y2={height - padding.bottom}
                stroke="#00D4FF"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                opacity="0.6"
              />
              {/* Highlight active nodes */}
              <circle
                cx={scaleX(activeIndex, plotData.length)}
                cy={scaleY(activePoint.match1)}
                r="3"
                fill="#00ffb7"
                stroke="#000"
                strokeWidth="0.8"
              />
              <circle
                cx={scaleX(activeIndex, plotData.length)}
                cy={scaleY(activePoint.match2)}
                r="2.5"
                fill="#ffdd00"
                stroke="#000"
                strokeWidth="0.8"
              />
            </>
          )}
        </svg>
      </div>

      <div className="flex justify-between items-center text-[8px] mt-1 text-[#7a8c99]">
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ffb7]" />
          <span>1937 Floods: {activePoint?.match1}%</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ffdd00]" style={{ borderRadius: '0px' }} />
          <span>2011 Crest: {activePoint?.match2}%</span>
        </div>
      </div>
    </div>
  );
}
