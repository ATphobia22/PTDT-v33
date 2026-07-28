const fs = require('fs');
const content = fs.readFileSync('src/components/NextGenDigitalTwin.tsx', 'utf-8');

const sidebarStart = content.indexOf('{/* Sidebar Controls & Telemetry Data Panel */}');
const functionEnd = content.indexOf('function LayerToggle');

const before = content.substring(0, sidebarStart);
const after = content.substring(functionEnd);

const newSidebar = `{/* Sidebar Controls & Telemetry Data Panel */}
      <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto max-h-[500px] md:max-h-none z-10">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase flex items-center gap-1.5 font-mono">
            <Settings2 className="w-4 h-4 text-indigo-400" />
            Control Hub
          </h2>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Toggle high-fidelity layers and execute real-time 3D hydraulic simulations.
          </p>
        </div>

        {/* Simulation Water Level Controller */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/60 space-y-3">
          <div 
            className="flex items-center justify-between border-b border-slate-800/50 pb-2 cursor-pointer select-none"
            onClick={() => toggleMenu("sim")}
          >
            <span className="text-xs font-semibold text-indigo-200 uppercase font-mono flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              River stage
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold font-mono text-cyan-400 px-1.5 py-0.5 bg-cyan-950/40 rounded border border-cyan-800/30">
                {waterLevel.toFixed(2)} m
              </span>
              {openMenus.sim ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
            </div>
          </div>
          {openMenus.sim && (
            <>
              <div className="space-y-1">
                <input 
                  type="range" 
                  min="0.5" 
                  max="6.0" 
                  step="0.05" 
                  value={waterLevel} 
                  onChange={(e) => setWaterLevel(parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-mono text-slate-500">
                  <span>0.5m (Min)</span>
                  <span>3.0m (Moderate)</span>
                  <span>6.0m (Extreme)</span>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setSimRunning(!simRunning)}
                  className={\`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-bold tracking-wider transition-all cursor-pointer border \${
                    simRunning 
                      ? "bg-red-950/40 border-red-500/40 text-red-400 hover:bg-red-900/30" 
                      : "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/30"
                  }\`}
                >
                  {simRunning ? <Pause size={12} /> : <Play size={12} />}
                  {simRunning ? "HALT CYCLE" : "SIMULATE SURGE"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* GIS Interactive Layers */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/60 space-y-2">
          <div 
            className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-2 cursor-pointer select-none"
            onClick={() => toggleMenu("layers")}
          >
            <span className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1 uppercase">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Sovereign GIS Layers
            </span>
            {openMenus.layers ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
          </div>
          {openMenus.layers && (
            <div className="space-y-1">
              <LayerToggle 
                active={activeLayers.femaNfhl} 
                onClick={() => toggleLayer("femaNfhl")} 
                label="FEMA NFHL (3D Extruded)" 
                colorClass="bg-red-500"
              />
              <LayerToggle 
                active={activeLayers.dnrFloodplain} 
                onClick={() => toggleLayer("dnrFloodplain")} 
                label="DNR Best Available (3D)" 
                colorClass="bg-purple-500"
              />
              <LayerToggle 
                active={activeLayers.historicSites} 
                onClick={() => toggleLayer("historicSites")} 
                label="Historic Sites Points" 
                colorClass="bg-yellow-500"
              />
              <LayerToggle 
                active={activeLayers.waterSimulation} 
                onClick={() => toggleLayer("waterSimulation")} 
                label="Confluence Hydrology Simulation" 
                colorClass="bg-blue-500"
              />
            </div>
          )}
        </div>

        {/* USGS Stream Telemetry Gauges List */}
        <div className="flex-1 flex flex-col gap-2 min-h-[150px] p-3 bg-slate-950 rounded-lg border border-slate-800/60">
          <div 
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => toggleMenu("usgs")}
          >
            <span className="text-xs font-semibold text-slate-300 font-mono uppercase flex items-center gap-1">
              USGS Gauges ({usgsGages.length})
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); fetchTelemetry(); }}
                disabled={syncStatus === "syncing"}
                className="p-1 hover:bg-slate-800 rounded transition-colors text-indigo-400 disabled:opacity-50"
              >
                <RefreshCw size={12} className={syncStatus === "syncing" ? "animate-spin" : ""} />
              </button>
              {openMenus.usgs ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
            </div>
          </div>
          {openMenus.usgs && (
            <div className="flex flex-col gap-1.5 overflow-y-auto pr-1 mt-1">
              {usgsGages.map((gage: any) => (
                <button
                  key={gage.gauge_id}
                  onClick={() => {
                    setSelectedGage(gage);
                    // Move map to selected gauge coordinate
                    if (mapRef.current) {
                      mapRef.current.easeTo({
                        center: [gage.lng, gage.lat],
                        zoom: 12.8,
                        pitch: 55,
                        duration: 1500
                      });
                    }
                  }}
                  className={\`w-full p-2 rounded text-left border text-xs font-mono transition-all flex flex-col gap-1 cursor-pointer \${
                    selectedGage?.gauge_id === gage.gauge_id
                      ? "bg-indigo-950/30 border-indigo-500/50 text-indigo-300"
                      : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/30"
                  }\`}
                >
                  <div className="font-semibold text-slate-200 truncate">{gage.name}</div>
                  <div className="flex justify-between items-center text-[10px]">
                    <span>Stage Height: <span className="text-cyan-400 font-bold">{gage.water_level_stage_ft}ft</span></span>
                    <span>Flow: <span className="text-emerald-400 font-bold">{gage.discharge_cfs.toLocaleString()} cfs</span></span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Selected Gauge Detailed Stats */}
        {selectedGage && (
          <div className="p-3 bg-slate-950 rounded-lg border border-indigo-500/20 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex justify-between items-start border-b border-slate-800 pb-1.5">
              <div>
                <h4 className="text-[11px] font-bold text-slate-200 uppercase truncate max-w-[180px]">{selectedGage.name}</h4>
                <p className="text-[9px] text-indigo-400 font-mono mt-0.5">{selectedGage.gauge_id}</p>
              </div>
              <button 
                onClick={() => setSelectedGage(null)}
                className="text-slate-500 hover:text-slate-300 p-0.5"
              >
                ×
              </button>
            </div>

            <div className="h-20 w-full mt-1.5">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockGageHistory}>
                  <Line type="monotone" dataKey="stage" stroke="#06b6d4" strokeWidth={1.5} dot={{ r: 2 }} />
                  <Tooltip 
                    contentStyle={{ background: "#020617", border: "1px solid #1e293b", borderRadius: "4px" }}
                    labelStyle={{ color: "#94a3b8", fontSize: "8px", fontFamily: "monospace" }}
                    itemStyle={{ color: "#22d3ee", fontSize: "9px", fontFamily: "monospace" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[8px] text-slate-500 font-mono text-center">
              Real-time trend analysis (interpolated stage height)
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

`;

fs.writeFileSync('src/components/NextGenDigitalTwin.tsx', before + newSidebar + after);
