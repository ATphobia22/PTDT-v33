import React, { useState, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { 
  Layers, Map as MapIcon, ShieldAlert, Navigation, Settings2, 
  Waves, Building2, Trees, Ship, Info, Sliders, Play, Pause, RefreshCw 
} from "lucide-react";
import { fetchFemaFloodZones, fetchIndianaHistoricSites, fetchDnrFloodplain } from "../services/gisService";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function NextGenDigitalTwin() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    basemap: true,
    femaNfhl: true,
    dnrFloodplain: true,
    historicSites: true,
    telemetryGages: true,
    waterSimulation: true
  });

  const [waterLevel, setWaterLevel] = useState(2.5); // Simulation water depth in meters
  const [selectedGage, setSelectedGage] = useState<any>(null);
  const [simRunning, setSimRunning] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing">("idle");
  const [usgsGages, setUsgsGages] = useState<any[]>([]);

  // Bounding box for Point Township / Posey County confluence
  const bbox: [number, number, number, number] = [-88.1, 37.8, -87.9, 38.0];

  // Fetch telemetry gauges from local USGS API
  const fetchTelemetry = async () => {
    setSyncStatus("syncing");
    try {
      const res = await fetch("/api/usgs-telemetry");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setUsgsGages(json.data);
          
          // Plot coordinates for New Harmony and Uniontown
          const mappedGages = json.data.map((gage: any) => {
            let lat = 37.893;
            let lng = -88.016;
            if (gage.gauge_id.includes("03377500")) {
              lat = 38.129; // New Harmony
              lng = -87.935;
            } else if (gage.gauge_id.includes("03322000")) {
              lat = 37.791; // Uniontown Dam
              lng = -87.994;
            }
            return { ...gage, lat, lng };
          });
          setUsgsGages(mappedGages);
        }
      }
    } catch (err) {
      console.warn("Telemetry load error:", err);
    } finally {
      setTimeout(() => setSyncStatus("idle"), 600);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Water simulation animation effect
  useEffect(() => {
    let interval: any;
    if (simRunning) {
      interval = setInterval(() => {
        setWaterLevel((prev) => {
          const next = prev + 0.15;
          return next > 6.0 ? 0.5 : next; // Loop back
        });
      }, 800);
    }
    return () => clearInterval(interval);
  }, [simRunning]);

  // Initializing Maplibre Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Use a high-quality dark themed basemap
    const darkStyle = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: darkStyle,
      center: [-88.005, 37.893], // Point Township, IN
      zoom: 11.2,
      pitch: 45,
      bearing: -15
    });

    mapRef.current = map;

    map.on("load", async () => {
      setMapLoaded(true);

      // 1. Add FEMA Flood Zones Source & Layers (Dynamic/Fallback from server)
      try {
        const femaGeoJson = await fetchFemaFloodZones(bbox);
        map.addSource("fema-nfhl", {
          type: "geojson",
          data: femaGeoJson as any
        });

        // 3D Extruded FEMA zones to represent flood height threat
        map.addLayer({
          id: "fema-extrusion",
          type: "fill-extrusion",
          source: "fema-nfhl",
          layout: {
            visibility: activeLayers.femaNfhl ? "visible" : "none"
          },
          paint: {
            "fill-extrusion-color": [
              "case",
              ["==", ["get", "FLD_ZONE"], "AE"],
              "#ef4444", // Red for high risk floodway
              "#f97316"  // Orange for other flood risk zones
            ],
            "fill-extrusion-height": 18, // 18m threat profile
            "fill-extrusion-opacity": 0.28,
            "fill-extrusion-base": 0
          }
        });

        // Add matching wireframe outlines
        map.addLayer({
          id: "fema-outline",
          type: "line",
          source: "fema-nfhl",
          layout: {
            visibility: activeLayers.femaNfhl ? "visible" : "none"
          },
          paint: {
            "line-color": "#ef4444",
            "line-width": 1.5,
            "line-opacity": 0.5
          }
        });
      } catch (e) {
        console.error("Maplibre failed to parse FEMA layer:", e);
      }

      // 2. Add DNR Floodplain Source & Layers
      try {
        const dnrGeoJson = await fetchDnrFloodplain(bbox);
        map.addSource("dnr-floodplain", {
          type: "geojson",
          data: dnrGeoJson as any
        });

        map.addLayer({
          id: "dnr-extrusion",
          type: "fill-extrusion",
          source: "dnr-floodplain",
          layout: {
            visibility: activeLayers.dnrFloodplain ? "visible" : "none"
          },
          paint: {
            "fill-extrusion-color": "#a855f7", // Neon Purple
            "fill-extrusion-height": 12,
            "fill-extrusion-opacity": 0.22,
            "fill-extrusion-base": 0
          }
        });

        map.addLayer({
          id: "dnr-outline",
          type: "line",
          source: "dnr-floodplain",
          layout: {
            visibility: activeLayers.dnrFloodplain ? "visible" : "none"
          },
          paint: {
            "line-color": "#a855f7",
            "line-width": 1,
            "line-opacity": 0.4
          }
        });
      } catch (e) {
        console.error("Maplibre failed to load DNR layer:", e);
      }

      // 3. Add Indiana Historic Sites
      try {
        const historicGeoJson = await fetchIndianaHistoricSites(bbox);
        map.addSource("historic-sites", {
          type: "geojson",
          data: historicGeoJson as any
        });

        map.addLayer({
          id: "historic-sites-points",
          type: "circle",
          source: "historic-sites",
          layout: {
            visibility: activeLayers.historicSites ? "visible" : "none"
          },
          paint: {
            "circle-radius": 8,
            "circle-color": "#eab308", // Yellow
            "circle-stroke-width": 2,
            "circle-stroke-color": "#1e1b4b",
            "circle-opacity": 0.95
          }
        });

        // Label Layer for Historic Sites
        map.addLayer({
          id: "historic-labels",
          type: "symbol",
          source: "historic-sites",
          layout: {
            "text-field": ["get", "NAME"],
            "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
            "text-size": 10,
            "text-offset": [0, 1.5],
            "text-anchor": "top",
            visibility: activeLayers.historicSites ? "visible" : "none"
          },
          paint: {
            "text-color": "#fef08a",
            "text-halo-color": "#090d16",
            "text-halo-width": 1.5
          }
        });

        // Dynamic popups on clicking historic sites
        map.on("click", "historic-sites-points", (e) => {
          if (!e.features || e.features.length === 0) return;
          const feat = e.features[0];
          const name = feat.properties?.NAME || "Historic Landmark";
          const coordinates = (feat.geometry as any).coordinates.slice();

          new maplibregl.Popup({ className: "custom-gis-popup" })
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-2 font-mono text-xs dark:bg-slate-950 dark:text-slate-100 bg-white text-slate-900 border border-slate-800 rounded shadow-md">
                <div class="font-bold text-yellow-400 border-b border-yellow-500/20 pb-1 mb-1 uppercase">${name}</div>
                <div>Type: Historical Landmark</div>
                <div>Status: Tracked in Sovereign Registry</div>
                <div class="mt-1 text-[10px] text-slate-400">Posey County, Indiana GIS</div>
              </div>
            `)
            .addTo(map);
        });

        // Change cursor on hover
        map.on("mouseenter", "historic-sites-points", () => map.getCanvas().style.cursor = "pointer");
        map.on("mouseleave", "historic-sites-points", () => map.getCanvas().style.cursor = "");
      } catch (e) {
        console.error("Maplibre failed to load historic sites:", e);
      }

      // 4. Dynamic Water Simulation Geometry (confluence of Wabash and Ohio rivers)
      const generateConfluencePolygon = (level: number) => {
        // Broadly approximate coordinates around the rivers
        // As level rises, coordinates swell out slightly
        const delta = (level - 0.5) * 0.0035;
        return {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "Confluence Inundation Area" },
              geometry: {
                type: "Polygon",
                coordinates: [[
                  [-88.08 - delta, 37.84 - delta],
                  [-87.94 + delta, 37.84 - delta],
                  [-87.92 + delta, 37.94 + delta],
                  [-87.98, 37.92 + delta],
                  [-88.04 - delta, 37.96 + delta],
                  [-88.08 - delta, 37.84 - delta]
                ]]
              }
            }
          ]
        };
      };

      map.addSource("water-sim", {
        type: "geojson",
        data: generateConfluencePolygon(waterLevel) as any
      });

      map.addLayer({
        id: "water-sim-extrusion",
        type: "fill-extrusion",
        source: "water-sim",
        layout: {
          visibility: activeLayers.waterSimulation ? "visible" : "none"
        },
        paint: {
          "fill-extrusion-color": "#2563eb", // Deep Royal Blue
          "fill-extrusion-height": ["*", waterLevel, 4], // Swells in 3D too
          "fill-extrusion-opacity": 0.55,
          "fill-extrusion-base": 0
        }
      });
    });

    return () => {
      if (mapRef.current) {
        try {
          map.remove();
        } catch (e) {
          console.warn("Error removing Maplibre:", e);
        }
      }
      mapRef.current = null;
    };
  }, []);

  // Reactive updates of layers when state changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const toggle = (layerId: string, visible: boolean) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, "visibility", visible ? "visible" : "none");
      }
    };

    toggle("fema-extrusion", activeLayers.femaNfhl);
    toggle("fema-outline", activeLayers.femaNfhl);
    toggle("dnr-extrusion", activeLayers.dnrFloodplain);
    toggle("dnr-outline", activeLayers.dnrFloodplain);
    toggle("historic-sites-points", activeLayers.historicSites);
    toggle("historic-labels", activeLayers.historicSites);
    toggle("water-sim-extrusion", activeLayers.waterSimulation);
  }, [activeLayers, mapLoaded]);

  // Handle water level slider adjustments
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const source = map.getSource("water-sim") as maplibregl.GeoJSONSource;
    if (source) {
      // Swell confluence geometry based on water depth
      const delta = (waterLevel - 0.5) * 0.0035;
      source.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "Confluence Inundation Area" },
            geometry: {
              type: "Polygon",
              coordinates: [[
                [-88.08 - delta, 37.84 - delta],
                [-87.94 + delta, 37.84 - delta],
                [-87.92 + delta, 37.94 + delta],
                [-87.98, 37.92 + delta],
                [-88.04 - delta, 37.96 + delta],
                [-88.08 - delta, 37.84 - delta]
              ]]
            }
          }
        ]
      } as any);
    }

    if (map.getLayer("water-sim-extrusion")) {
      map.setPaintProperty("water-sim-extrusion", "fill-extrusion-height", waterLevel * 6);
      
      // Interpolate opacity/color based on water severity
      const color = waterLevel > 4.5 ? "#b91c1c" : (waterLevel > 2.8 ? "#d97706" : "#2563eb");
      map.setPaintProperty("water-sim-extrusion", "fill-extrusion-color", color);
    }
  }, [waterLevel, mapLoaded]);

  const toggleLayer = (layer: keyof typeof activeLayers) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Mock historical chart data for the selected gauge
  const mockGageHistory = [
    { time: "08:00", stage: waterLevel * 0.9, flow: 21300 },
    { time: "10:00", stage: waterLevel * 0.95, flow: 24500 },
    { time: "12:00", stage: waterLevel * 1.05, flow: 28900 },
    { time: "14:00", stage: waterLevel * 1.0, flow: 27100 },
    { time: "16:00", stage: waterLevel * 1.12, flow: 32000 }
  ];

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative bg-slate-950 font-sans overflow-hidden">
      {/* 3D Map Viewport */}
      <div className="flex-1 relative min-h-[350px] md:min-h-0">
        <div ref={mapContainerRef} className="absolute inset-0 z-0" />
        
        {/* HUD Overlay - Top Left */}
        <div className="absolute top-4 left-4 z-10 p-3 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-800 text-xs text-white max-w-sm font-mono flex flex-col gap-1.5 shadow-2xl pointer-events-none">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-1.5 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold tracking-wider uppercase text-emerald-400">Maplibre 3D Engine</span>
          </div>
          <div className="text-[10px] text-slate-300">
            Render Mode: <span className="text-cyan-400 font-bold">Hardware Accelerated (WebGL)</span>
          </div>
          <div className="text-[10px] text-slate-300">
            Simulation Extent: <span className="text-yellow-400 font-bold">Wabash-Ohio Confluence</span>
          </div>
          <div className="text-[10px] text-slate-300">
            BBox: <span className="text-slate-400">[-88.1, 37.8, -87.9, 38.0]</span>
          </div>
        </div>

        {/* HUD Legend - Bottom Left */}
        <div className="absolute bottom-6 left-6 z-10 p-3 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[10px] text-white font-mono space-y-2 shadow-xl pointer-events-auto">
          <div className="font-bold border-b border-slate-800 pb-1 text-slate-300 uppercase tracking-widest text-[9px]">Sovereign Legend</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500/50 border border-red-500 rounded" />
              <span>FEMA AE Zones (3D Extruded)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500/50 border border-purple-500 rounded" />
              <span>DNR Best Available Floodplain</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-400" />
              <span>Indiana Historic Sites (Registry)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-1.5 bg-blue-500/80 rounded" />
              <span>Active Dynamic Water Model</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Controls & Telemetry Data Panel */}
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
          <div className="flex items-center justify-between border-b border-slate-800/50 pb-2">
            <span className="text-xs font-semibold text-indigo-200 uppercase font-mono flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              River stage
            </span>
            <span className="text-xs font-bold font-mono text-cyan-400 px-1.5 py-0.5 bg-cyan-950/40 rounded border border-cyan-800/30">
              {waterLevel.toFixed(2)} m
            </span>
          </div>

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
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-bold tracking-wider transition-all cursor-pointer border ${
                simRunning 
                  ? "bg-red-950/40 border-red-500/40 text-red-400 hover:bg-red-900/30" 
                  : "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 hover:bg-emerald-900/30"
              }`}
            >
              {simRunning ? <Pause size={12} /> : <Play size={12} />}
              {simRunning ? "HALT CYCLE" : "SIMULATE SURGE"}
            </button>
          </div>
        </div>

        {/* GIS Interactive Layers */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/60 space-y-2">
          <span className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1 uppercase border-b border-slate-800 pb-1.5 mb-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Sovereign GIS Layers
          </span>
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
        </div>

        {/* USGS Stream Telemetry Gauges List */}
        <div className="flex-1 flex flex-col gap-2 min-h-[150px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300 font-mono uppercase">
              USGS Gauges ({usgsGages.length})
            </span>
            <button 
              onClick={fetchTelemetry}
              disabled={syncStatus === "syncing"}
              className="p-1 hover:bg-slate-800 rounded transition-colors text-indigo-400 disabled:opacity-50"
            >
              <RefreshCw size={12} className={syncStatus === "syncing" ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="flex flex-col gap-1.5 overflow-y-auto pr-1">
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
                className={`w-full p-2 rounded text-left border text-xs font-mono transition-all flex flex-col gap-1 cursor-pointer ${
                  selectedGage?.gauge_id === gage.gauge_id
                    ? "bg-indigo-950/30 border-indigo-500/50 text-indigo-300"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/30"
                }`}
              >
                <div className="font-semibold text-slate-200 truncate">{gage.name}</div>
                <div className="flex justify-between items-center text-[10px]">
                  <span>Stage Height: <span className="text-cyan-400 font-bold">{gage.water_level_stage_ft}ft</span></span>
                  <span>Flow: <span className="text-emerald-400 font-bold">{gage.discharge_cfs.toLocaleString()} cfs</span></span>
                </div>
              </button>
            ))}
          </div>
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

function LayerToggle({ active, onClick, label, colorClass }: { active: boolean, onClick: () => void, label: string, colorClass: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between w-full p-1.5 rounded text-left transition-all text-xs font-mono cursor-pointer ${
        active ? "bg-slate-900 text-slate-200" : "text-slate-500 hover:bg-slate-900/40"
      }`}
    >
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${colorClass} ${active ? "" : "opacity-40"}`} />
        <span>{label}</span>
      </div>
      <div className={`w-7 h-3.5 rounded-full transition-colors relative ${active ? "bg-indigo-600" : "bg-slate-800"}`}>
        <div className={`absolute top-0.5 left-0.5 w-2.5 h-2.5 rounded-full bg-white transition-transform ${active ? "translate-x-3.5" : ""}`} />
      </div>
    </button>
  );
}
