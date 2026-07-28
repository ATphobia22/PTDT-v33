import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export function RiverCrossSection({ surgeStage = 377.2 }: { surgeStage?: number }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resizing
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Mock static riverbed cross-section profile (Distance in ft vs Elevation in ft NAVD88)
  const riverbedData = [
    { distance: 0, elevation: 395 },
    { distance: 50, elevation: 390 },
    { distance: 120, elevation: 368 }, // West Bank
    { distance: 180, elevation: 352 }, // River Channel Bottom
    { distance: 280, elevation: 350 }, // Deepest Point
    { distance: 380, elevation: 354 }, // Channel Bottom East
    { distance: 440, elevation: 370 }, // East Bank
    { distance: 500, elevation: 392 },
    { distance: 550, elevation: 395 },
  ];

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    // 1. Setup Canvas Dimensions & Margins
    const margin = { top: 10, right: 20, bottom: 20, left: 30 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    // Clear previous SVG contents for clean re-renders
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", dimensions.width).attr("height", dimensions.height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 2. Define Scales
    const xScale = d3.scaleLinear()
      .domain([0, d3.max(riverbedData, d => d.distance) || 550])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([340, 400]) // Clamped to structural elevation bounds
      .range([height, 0]);

    // 3. Gridlines & Axes (Cognitive HUD Styling)
    g.append("g")
      .attr("class", "grid-lines")
      .attr("stroke", "#1e293b")
      .attr("stroke-dasharray", "2,2")
      .attr("opacity", 0.5)
      .call(d3.axisLeft(yScale).tickSize(-width).tickFormat(() => ""))
      .call(g => g.select(".domain").remove());

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .attr("font-size", "9px")
      .attr("font-family", "monospace")
      .attr("color", "#64748b")
      .call(g => g.select(".domain").remove());

    g.append("g")
      .call(d3.axisLeft(yScale).ticks(4))
      .attr("font-size", "9px")
      .attr("font-family", "monospace")
      .attr("color", "#64748b")
      .call(g => g.select(".domain").remove());

    // 4. Generate Riverbed Terrain Geometry
    const terrainArea = d3.area<{ distance: number, elevation: number }>()
      .x(d => xScale(d.distance))
      .y0(height)
      .y1(d => yScale(d.elevation))
      .curve(d3.curveMonotoneX);

    const terrainLine = d3.line<{ distance: number, elevation: number }>()
      .x(d => xScale(d.distance))
      .y(d => yScale(d.elevation))
      .curve(d3.curveMonotoneX);

    // Render Ground Fill
    g.append("path")
      .datum(riverbedData)
      .attr("d", terrainArea)
      .attr("fill", "#0f172a");

    // Render Ground Stroke Boundary
    g.append("path")
      .datum(riverbedData)
      .attr("d", terrainLine)
      .attr("fill", "none")
      .attr("stroke", "#334155")
      .attr("stroke-width", 1.5);

    // 5. Generate Dynamic Water Inundation Geometry
    const waterData = riverbedData.map(d => ({
      distance: d.distance,
      elevation: Math.min(surgeStage, d.elevation)
    }));

    const waterArea = d3.area<{ distance: number, elevation: number }>()
      .x(d => xScale(d.distance))
      .y0(d => yScale(d.elevation)) // Bottom clamped to terrain
      .y1(yScale(surgeStage))       // Top surface flat line
      .curve(d3.curveMonotoneX);

    // Render Water Body
    g.append("path")
      .datum(waterData)
      .attr("d", waterArea)
      .attr("fill", "url(#water-gradient)")
      .attr("opacity", 0.7);

    // Render Dynamic Water Surface Line
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(surgeStage))
      .attr("y2", yScale(surgeStage))
      .attr("stroke", "#38bdf8")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4");

    // 6. SVG Definitions: Holographic Gradients
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "water-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#38bdf8").attr("stop-opacity", 0.8);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#1e3a8a").attr("stop-opacity", 0.2);

  }, [surgeStage, dimensions]);

  return (
    <div className="flex flex-col gap-2 w-full h-full font-sans text-slate-100">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-sky-400 tracking-wider">HYDRODYNAMIC CROSS-SECTION</span>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
          LIVE STAGE: {surgeStage.toFixed(2)} FT
        </span>
      </div>
      <div className="flex-1 w-full relative" ref={containerRef}>
        <svg ref={svgRef} className="absolute top-0 left-0 overflow-visible" />
      </div>
      <div className="text-[9px] text-slate-500 font-mono text-right mt-1 border-t border-slate-800/50 pt-1">
        Vertical Datum: NAVD88 | Target: 13101 Bonebank Rd Profile
      </div>
    </div>
  );
}
