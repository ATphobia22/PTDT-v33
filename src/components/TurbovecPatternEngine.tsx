import React, { useState, useEffect } from "react";
import { Zap } from 'lucide-react';

export function TurbovecPatternEngine({ frameCount }: { frameCount: number }) {
  // Mock data representing turbovec vector matches
  const [matches, setMatches] = useState([
    { event: "May 1937 Floods", confidence: 94.2 },
    { event: "Jan 2011 Crest", confidence: 81.5 }
  ]);
  const [latency, setLatency] = useState(0.42);

  // Simulate updating vector matches as time slider/frame changes
  useEffect(() => {
    // Jitter to simulate active SIMD scanning based on the slider/frame input
    const jitterConf1 = 90 + Math.random() * 8;
    const jitterConf2 = 75 + Math.random() * 12;
    const calcLatency = (0.2 + Math.random() * 0.4).toFixed(2);
    
    setMatches([
      { event: "May 1937 Floods", confidence: parseFloat(jitterConf1.toFixed(1)) },
      { event: "Jan 2011 Crest", confidence: parseFloat(jitterConf2.toFixed(1)) }
    ]);
    setLatency(parseFloat(calcLatency));
  }, [frameCount]);

  return (
    <div className="flex flex-col justify-between h-full w-full font-sans text-slate-100">
      <div>
        <div className="text-[#00D4FF] font-bold mb-2 flex items-center gap-2 text-xs uppercase tracking-wider">
          <Zap size={14} className="text-[#00D4FF] fill-[#00D4FF]" /> Turbovec Pattern Engine
        </div>
        <div className="text-[10px] text-slate-400 grid border-b border-slate-700/50 pb-1 mb-2">
          4-Bit Quantized Sub-Surface Vector Engine Matches
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-2 flex-1">
        <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1">
          <span className="text-white">{matches[0].event}</span>
          <span className="text-emerald-400 font-bold">{matches[0].confidence}% Conf</span>
        </div>
        <div className="flex justify-between items-center text-[11px] border-b border-white/5 pb-1">
          <span className="text-white">{matches[1].event}</span>
          <span className="text-amber-400 font-bold">{matches[1].confidence}% Conf</span>
        </div>
      </div>

      <div className="text-[9px] text-slate-500 font-mono mt-auto border-t border-slate-800/50 pt-1 text-right">
        Engine Latency: <span className="text-emerald-400">&lt; {latency}ms</span> | Pure Local VPC
      </div>
    </div>
  );
}
