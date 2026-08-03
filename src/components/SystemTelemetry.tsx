import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Cpu, Database, Network } from 'lucide-react';

interface DataPoint {
  time: number;
  value: number;
}

const RealtimeChart: React.FC<{ data: DataPoint[]; color: string; yLabel: string; maxVal: number }> = ({ data, color, yLabel, maxVal }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const width = svgRef.current.clientWidth;
    const height = 100;
    const margin = { top: 10, right: 10, bottom: 20, left: 30 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.time) as [number, number])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, maxVal])
      .range([innerHeight, 0]);

    const line = d3.line<DataPoint>()
      .x(d => x(d.time))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    const area = d3.area<DataPoint>()
      .x(d => x(d.time))
      .y0(innerHeight)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(5).tickSize(-innerHeight).tickFormat(() => ''))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#334155').attr('stroke-dasharray', '2,2'));

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(3).tickSize(-innerWidth).tickFormat(() => ''))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#334155').attr('stroke-dasharray', '2,2'));

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).ticks(4).tickFormat(d3.timeFormat('%H:%M:%S') as any))
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('color', '#64748b')
      .call(g => g.select('.domain').remove());

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(3))
      .attr('font-size', '8px')
      .attr('font-family', 'monospace')
      .attr('color', '#64748b')
      .call(g => g.select('.domain').remove());

    // Add Area
    g.append('path')
      .datum(data)
      .attr('fill', color)
      .attr('fill-opacity', 0.2)
      .attr('d', area);

    // Add Line
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

  }, [data, color, maxVal]);

  return <svg ref={svgRef} className="w-full h-[100px]" />;
};

export function SystemTelemetry() {
  const [gpuData, setGpuData] = useState<DataPoint[]>([]);
  const [memData, setMemData] = useState<DataPoint[]>([]);
  const [netData, setNetData] = useState<DataPoint[]>([]);

  useEffect(() => {
    // Initialize data
    const now = Date.now();
    const initData = Array.from({ length: 30 }).map((_, i) => ({
      time: now - (29 - i) * 1000,
      value: 0
    }));

    setGpuData([...initData]);
    setMemData([...initData]);
    setNetData([...initData]);

    const interval = setInterval(() => {
      const time = Date.now();
      setGpuData(prev => [...prev.slice(1), { time, value: Math.random() * 80 + 10 }]);
      setMemData(prev => [...prev.slice(1), { time, value: Math.random() * 60 + 20 }]);
      setNetData(prev => [...prev.slice(1), { time, value: Math.random() * 100 }]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 font-sans text-slate-100">
      <div className="border-b border-slate-800 pb-3 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-indigo-400">
          <Cpu size={16} />
          <h2 className="text-sm font-bold uppercase tracking-wider">System Telemetry</h2>
        </div>
        <span className="text-[10px] text-emerald-400 font-mono border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 rounded">ONLINE</span>
      </div>

      <div className="flex flex-col gap-4">
        {/* GPU Chart */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1"><Cpu size={12}/> GPU Usage (%)</span>
            <span className="text-xs font-bold font-mono text-indigo-400">
              {gpuData.length > 0 ? gpuData[gpuData.length - 1].value.toFixed(1) : 0}%
            </span>
          </div>
          <RealtimeChart data={gpuData} color="#818cf8" yLabel="%" maxVal={100} />
        </div>

        {/* Memory Chart */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1"><Database size={12}/> Memory Allocation (GB)</span>
            <span className="text-xs font-bold font-mono text-emerald-400">
              {memData.length > 0 ? (memData[memData.length - 1].value * 0.64).toFixed(1) : 0} GB
            </span>
          </div>
          <RealtimeChart data={memData} color="#34d399" yLabel="GB" maxVal={100} />
        </div>

        {/* Network Chart */}
        <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1"><Network size={12}/> Network I/O (Mbps)</span>
            <span className="text-xs font-bold font-mono text-amber-400">
              {netData.length > 0 ? (netData[netData.length - 1].value * 10).toFixed(0) : 0} Mbps
            </span>
          </div>
          <RealtimeChart data={netData} color="#fbbf24" yLabel="Mbps" maxVal={100} />
        </div>
      </div>

      {/* Sovereign System Architecture & Monorepo Controls */}
      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-3.5 space-y-3 font-sans mt-2">
        <div className="flex items-center gap-2 text-indigo-400 border-b border-slate-800/60 pb-1.5">
          <Database size={13} />
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Sovereign Monorepo Controls</h3>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Operating as a unified sovereign node anchored at the geographical boundaries of 13101 Bonebank Road, Point Township, Posey County, Indiana. Platform services are initialized according to a strict priority hierarchy:
        </p>
        <div className="space-y-2 mt-2">
          {[
            { id: 'ptdt.hal', namespace: 'ptdt::hal', lang: 'C++20', pri: 100, role: 'Hardware Abstraction Layer. CPU topology, Vulkan/Metal context, high-resolution clocks.' },
            { id: 'ptdt.kernel.sim_core', namespace: 'ptdt::kernel', lang: 'C++20', pri: 150, role: 'Central simulation orchestrator. Manages clock cycles and steps physical coordinate engines.' },
            { id: 'ptdt.audit_logger', namespace: 'ptdt::audit', lang: 'Rust 1.78', pri: 200, role: 'Sovereignty auditing. Rust-backed append-only Merkle tree ledger mapping system transformations.' },
            { id: 'ptdt.integration.bus', namespace: 'ptdt::bus', lang: 'Python 3.11', pri: 250, role: 'gRPC & ZeroMQ message-broker bus managing real-time data transfers and OpenMI 2.0 mapping.' },
            { id: 'ptdt.cognitive.os', namespace: 'ptdt::cognition', lang: 'Python 3.11', pri: 300, role: 'ReAct loop execution: coordinates continuous self-healing, data retrieval, and agent workflows.' }
          ].map((mod) => (
            <div key={mod.id} className="p-2 dark:bg-[#020617] bg-slate-900 border border-slate-800/80 rounded font-mono text-[9px] space-y-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-indigo-300">
                <span>{mod.id}</span>
                <span className="px-1.5 py-0.5 bg-indigo-500/10 text-[#00D4FF] rounded text-[8px]">PRIORITY {mod.pri}</span>
              </div>
              <div className="grid grid-cols-2 text-[8px] text-slate-500">
                <span>Namespace: <span className="text-slate-400 font-bold">{mod.namespace}</span></span>
                <span className="text-right">Lang: <span className="text-slate-400 font-bold">{mod.lang}</span></span>
              </div>
              <p className="text-[9px] text-slate-400 mt-1 font-sans leading-normal">
                {mod.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
