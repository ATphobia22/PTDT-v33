import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Waves } from 'lucide-react';

const generateData = () => {
  const data = [];
  let time = new Date();
  time.setMinutes(time.getMinutes() - 30);
  
  let currentFlow = 1200;
  for (let i = 0; i < 30; i++) {
    currentFlow = currentFlow + (Math.random() - 0.4) * 100;
    if (currentFlow < 500) currentFlow = 500;
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      flow: Math.round(currentFlow),
      historicalThreshold: 1500
    });
    time.setMinutes(time.getMinutes() + 1);
  }
  return data;
};

export const HydraulicFlowMonitor: React.FC = () => {
  const [data, setData] = useState(generateData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev.slice(1)];
        const lastFlow = prev[prev.length - 1].flow;
        let nextFlow = lastFlow + (Math.random() - 0.4) * 150;
        if (nextFlow < 500) nextFlow = 500;
        
        const time = new Date();
        newData.push({
          time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          flow: Math.round(nextFlow),
          historicalThreshold: 1500
        });
        return newData;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-950/90 backdrop-blur-xl border border-slate-800 rounded-sm p-4 flex flex-col gap-3 min-w-[320px] shadow-2xl relative overflow-hidden flex-1">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
          <Waves size={12} className="text-cyan-500" />
          HEC-RAS 2D Solver Flow Monitor
        </div>
        <div className="flex items-center gap-1">
           <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
           <span className="text-[8px] font-black text-cyan-500 uppercase tracking-tighter">Live Stream</span>
        </div>
      </div>
      
      <div className="h-[120px] w-full mt-2 overflow-hidden flex items-center justify-center">
        <LineChart width={300} height={120} data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis dataKey="time" stroke="#475569" fontSize={8} tickMargin={5} minTickGap={20} />
          <YAxis stroke="#475569" fontSize={8} tickFormatter={(val) => `${val} cfs`} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.9)', border: '1px solid #1e293b', fontSize: '10px' }}
            itemStyle={{ color: '#06b6d4' }}
          />
          <ReferenceLine y={1500} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Safety Threshold', fill: '#ef4444', fontSize: 8 }} />
          <Line type="monotone" dataKey="flow" stroke="#06b6d4" strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </div>
      
      <div className="flex justify-between items-end mt-1">
         <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">Current Runoff</span>
            <span className="text-[14px] text-cyan-400 font-black font-mono">{data[data.length - 1].flow} cfs</span>
         </div>
         <div className="flex flex-col items-end">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">Solver Delta</span>
            <span className={`text-[12px] font-black font-mono ${data[data.length - 1].flow > 1500 ? 'text-rose-400' : 'text-emerald-400'}`}>
               {((data[data.length - 1].flow / 1500) * 100).toFixed(1)}%
            </span>
         </div>
      </div>
    </div>
  );
};
