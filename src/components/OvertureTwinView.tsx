import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as pmtiles from 'pmtiles';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Map, Shield, Activity, Menu, Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Spinner } from './ui/spinner';
import { Skeleton } from './ui/skeleton';

export function OvertureTwinView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [floodStage, setFloodStage] = useState(330);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const protocolAdded = useRef(false);
  const { theme } = useTheme();
  
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapStyleMode, setMapStyleMode] = useState<'thematic' | 'satellite'>('satellite');

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!protocolAdded.current) {
      const protocol = new pmtiles.Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile);
      protocolAdded.current = true;
    }

    const tilesUrl = mapStyleMode === 'satellite'
      ? ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}']
      : [
          (theme === 'dark' || theme === 'blueprint') 
            ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
            : 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
          (theme === 'dark' || theme === 'blueprint') 
            ? 'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
            : 'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
          (theme === 'dark' || theme === 'blueprint') 
            ? 'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
            : 'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
        ];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: tilesUrl,
            tileSize: 256,
          },
          'overture-buildings': {
            type: 'vector',
            url: 'pmtiles://https://overturemaps-extras-us-west-2.s3.amazonaws.com/tiles/2026-05-20.0/buildings.pmtiles',
          }
        },
        layers: [
          {
            id: 'osm-base',
            type: 'raster',
            source: 'osm',
          },
          {
            id: 'overture-buildings-3d',
            type: 'fill-extrusion',
            source: 'overture-buildings',
            'source-layer': 'buildings',
            minzoom: 12,
            paint: {
              'fill-extrusion-color': mapStyleMode === 'satellite'
                ? [
                    'interpolate',
                    ['linear'],
                    ['coalesce', ['get', 'height'], 10],
                    0, '#b45309',   // Warm brick / terracotta
                    15, '#d97706',  // Sandstone / stucco
                    45, '#475569',  // Medium concrete
                    85, '#0ea5e9',  // Reflective blue glass
                    150, '#38bdf8'  // Aluminum sky high-rise
                  ]
                : ((theme === 'dark' || theme === 'blueprint') ? '#475569' : '#cbd5e1'),
              'fill-extrusion-height': ['coalesce', ['get', 'height'], 8],
              'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
              'fill-extrusion-opacity': mapStyleMode === 'satellite' ? 0.75 : 0.85
            }
          }
        ]
      },
      center: [-88.0051, 37.8459],
      zoom: 15,
      pitch: 60,
      bearing: 15,
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);
      // Add flood plane
      map.addSource('flood-plane', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [-88.02, 37.83],
                [-87.98, 37.83],
                [-87.98, 37.86],
                [-88.02, 37.86],
                [-88.02, 37.83]
              ]]
            },
            properties: {}
          }]
        }
      });

      map.addLayer({
        id: 'flood-plane-fill',
        type: 'fill-extrusion',
        source: 'flood-plane',
        paint: {
          'fill-extrusion-color': (theme === 'dark' || theme === 'blueprint') ? '#06b6d4' : '#3b82f6',
          'fill-extrusion-height': floodStage * 0.3048,
          'fill-extrusion-opacity': 0.5
        }
      });

      // Archimedes Berm
      map.addSource('berm', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [[
                [-88.0055, 37.8455],
                [-88.0045, 37.8455],
                [-88.0045, 37.8465],
                [-88.0055, 37.8465],
                [-88.0055, 37.8455]
              ]]
            },
            properties: {}
          }]
        }
      });

      map.addLayer({
        id: 'berm-extrusion',
        type: 'fill-extrusion',
        source: 'berm',
        paint: {
          'fill-extrusion-color': (theme === 'dark' || theme === 'blueprint') ? '#22c55e' : '#10b981',
          'fill-extrusion-height': 115,
          'fill-extrusion-base': 112,
          'fill-extrusion-opacity': 0.7
        }
      });
    });

    return () => {
      map.remove();
    };
  }, [theme, mapStyleMode]); // Re-initialize map when theme or style mode changes

  useEffect(() => {
    if (mapRef.current && mapRef.current.getLayer('flood-plane-fill')) {
      mapRef.current.setPaintProperty('flood-plane-fill', 'fill-extrusion-height', floodStage * 0.3048);
    }
  }, [floodStage]);

  const flyTo = (location: string) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    
    switch (location) {
      case 'node':
        map.flyTo({ center: [-88.0051, 37.8459], zoom: 16, pitch: 60, bearing: 15, duration: 2000 });
        break;
      case 'dam':
        map.flyTo({ center: [-87.995, 37.795], zoom: 14, pitch: 45, bearing: 180, duration: 3000 });
        break;
      case 'confluence':
        map.flyTo({ center: [-88.030, 37.805], zoom: 13, pitch: 30, bearing: 90, duration: 3000 });
        break;
      case 'gauge':
        map.flyTo({ center: [-87.935, 38.130], zoom: 15, pitch: 45, bearing: 270, duration: 3000 });
        break;
    }
  };

  const downloadSnapshot = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    let buildingFeatures: any[] = [];
    try {
      if (map.getLayer('overture-buildings-3d')) {
        buildingFeatures = map.queryRenderedFeatures({ layers: ['overture-buildings-3d'] });
      }
    } catch (e) {
      console.error('Error querying rendered building features:', e);
    }

    const snapshot = {
      timestamp: new Date().toISOString(),
      node: '13101_BONEBANK_RD',
      projection: 'EPSG:3857 / NAVD88',
      viewState: {
        center: map.getCenter().toArray(),
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing()
      },
      simulatedFloodMetrics: {
        floodStageFeet: floodStage,
        floodStageMeters: Number((floodStage * 0.3048).toFixed(4)),
        impactStatus: floodStage > 375 ? 'BREACH DETECTED' : 'SECURE'
      },
      localGaugesTelemetry: {
        wabashNewHarmony: '6.55 ft',
        ohioMyersDam: '18.32 ft'
      },
      renderedOvertureBuildingsCount: buildingFeatures.length,
      renderedOvertureBuildingsSample: buildingFeatures.slice(0, 100).map((f) => ({
        id: f.id,
        properties: f.properties || {},
        geometry: f.geometry
      }))
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `PTDT_Overture_PMT_Data_Snapshot_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="relative w-full h-full bg-slate-100 dark:bg-[#020617] overflow-hidden font-sans text-slate-900 dark:text-white rounded-xl">
      
      {/* Map Loading Overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#020617] p-6 text-center animate-in fade-in duration-300">
          <div className="max-w-md w-full flex flex-col items-center gap-6">
            <Spinner size="xl" variant="primary" />
            <div className="space-y-2">
              <h3 className="text-sm font-bold tracking-widest font-mono text-indigo-600 dark:text-indigo-400 uppercase">
                LOADING OVERTURE 3D MAP...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                Connecting to Overture Maps S3 Extras Repository and fetching 3D vector buildings data structure.
              </p>
            </div>
            <div className="w-full flex justify-between gap-4 mt-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </div>
      )}

      {/* Toggle Buttons (visible when panels are closed) */}
      {!leftPanelOpen && (
        <button 
          onClick={() => setLeftPanelOpen(true)}
          className="absolute top-5 left-5 z-20 bg-white dark:bg-slate-900 p-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Open Location Menu"
        >
          <Menu size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      )}

      {!rightPanelOpen && (
        <button 
          onClick={() => setRightPanelOpen(true)}
          className="absolute top-5 right-5 z-20 bg-white dark:bg-slate-900 p-2 rounded-lg shadow-md border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          title="Open Defense Console"
        >
          <Activity size={20} className="text-slate-600 dark:text-slate-300" />
        </button>
      )}

      {/* Left Panel - Locations */}
      <div 
        className={`absolute top-5 left-5 w-72 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-indigo-500/50 p-4 rounded-lg shadow-lg dark:shadow-[0_0_20px_rgba(99,102,241,0.15)] z-10 transition-transform duration-300 ease-in-out ${leftPanelOpen ? 'translate-x-0' : '-translate-x-[150%] opacity-0'}`}
      >
        <div className="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-indigo-500/50 pb-2">
          <h1 className="m-0 text-sm uppercase font-bold tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-2">
            <Map size={16} /> Tri-River Command
          </h1>
          <button onClick={() => setLeftPanelOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <ChevronLeft size={18} />
          </button>
        </div>
        
        <div className="mb-4 text-xs space-y-1.5 font-mono bg-slate-50 dark:bg-slate-950 p-2 rounded border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between"><span>SYSTEM:</span> <span className="text-emerald-600 dark:text-emerald-500 font-bold">ONLINE</span></div>
          <div className="flex justify-between"><span>LAYER:</span> <span className="text-indigo-600 dark:text-indigo-400 font-bold">OVERTURE 3D</span></div>
          <div className="flex justify-between"><span>REGION:</span> <span className="text-indigo-600 dark:text-indigo-400 font-bold">PT. TOWNSHIP</span></div>
        </div>

        <div className="mb-4 space-y-2">
          <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
            3D Basemap Theme
          </label>
          <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setMapStyleMode('thematic')}
              className={`py-1.5 px-2 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                mapStyleMode === 'thematic'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Thematic Slate
            </button>
            <button
              onClick={() => setMapStyleMode('satellite')}
              className={`py-1.5 px-2 rounded text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                mapStyleMode === 'satellite'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Photorealistic
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <button 
            onClick={() => flyTo('node')}
            className="w-full text-left bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 px-3 py-2 text-xs transition-colors rounded font-medium text-slate-700 dark:text-slate-200"
          >
            1. TRI-STATE CORE (Home)
          </button>
          <button 
            onClick={() => flyTo('dam')}
            className="w-full text-left bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 px-3 py-2 text-xs transition-colors rounded font-medium text-slate-700 dark:text-slate-200"
          >
            2. J.T. MYERS DAM (Source)
          </button>
          <button 
            onClick={() => flyTo('confluence')}
            className="w-full text-left bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 px-3 py-2 text-xs transition-colors rounded font-medium text-slate-700 dark:text-slate-200"
          >
            3. THE CONFLUENCE (Tri-State)
          </button>
          <button 
            onClick={() => flyTo('gauge')}
            className="w-full text-left bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 px-3 py-2 text-xs transition-colors rounded font-medium text-slate-700 dark:text-slate-200"
          >
            4. WABASH GAUGE (New Harmony)
          </button>
        </div>
      </div>

      {/* Right Panel - Controls */}
      <div 
        className={`absolute top-5 right-5 w-80 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-indigo-500/50 p-4 rounded-lg shadow-lg dark:shadow-[0_0_20px_rgba(99,102,241,0.15)] z-10 transition-transform duration-300 ease-in-out ${rightPanelOpen ? 'translate-x-0' : 'translate-x-[150%] opacity-0'}`}
      >
        <div className="flex justify-between items-center mb-3 border-b border-slate-200 dark:border-indigo-500/50 pb-2">
          <h2 className="m-0 text-sm uppercase font-bold tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
            <Shield size={16} className="text-indigo-600 dark:text-indigo-400" /> Defense Console
          </h2>
          <button onClick={() => setRightPanelOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <ChevronRight size={18} />
          </button>
        </div>
        
        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded border border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex justify-between mb-2 text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">WABASH (New Harmony):</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">6.55 ft</span>
          </div>
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">OHIO (Myers Dam):</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">18.32 ft</span>
          </div>
        </div>
        
        <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300 uppercase tracking-wide">
          Simulated Flood Stage: <span className="font-mono text-indigo-600 dark:text-indigo-400">{floodStage.toFixed(1)} ft</span> MSL
        </label>
        
        <input 
          type="range" 
          min="320" 
          max="380" 
          step="0.5" 
          value={floodStage}
          onChange={(e) => setFloodStage(parseFloat(e.target.value))}
          className="w-full mb-4 accent-indigo-600 dark:accent-indigo-500"
        />
        
        <div className="flex justify-between items-center text-xs mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Impact Status:</span>
          {floodStage > 375 ? (
            <span className="font-bold text-red-600 dark:text-red-500 animate-pulse bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded border border-red-200 dark:border-red-900/50">BREACH DETECTED</span>
          ) : (
            <span className="font-bold text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded border border-emerald-200 dark:border-emerald-900/50">SECURE</span>
          )}
        </div>

        <button 
          onClick={downloadSnapshot}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2 px-4 text-[10px] font-mono font-bold bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all cursor-pointer border border-transparent hover:border-indigo-400 uppercase tracking-wider"
          title="Download Current Overture PMT Data Snapshot"
        >
          <Download size={14} className="text-[#00D4FF]" /> DOWNLOAD SNAPSHOT
        </button>
      </div>

      <div ref={mapContainer} className="w-full h-full z-0" />
    </div>
  );
}

export default OvertureTwinView;
