with open("src/components/OvertureTwinView.tsx", "r") as f:
    content = f.read()

import re

# We will just rewrite the whole file for OvertureTwinView.tsx since we are making significant UI changes.
new_content = """import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as pmtiles from 'pmtiles';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Map, Shield, Activity, Menu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function OvertureTwinView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [floodStage, setFloodStage] = useState(330);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const protocolAdded = useRef(false);
  const { theme } = useTheme();
  
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!protocolAdded.current) {
      const protocol = new pmtiles.Protocol();
      maplibregl.addProtocol('pmtiles', protocol.tile);
      protocolAdded.current = true;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              theme === 'dark' 
                ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
                : 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              theme === 'dark' 
                ? 'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
                : 'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
              theme === 'dark' 
                ? 'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
                : 'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
            ],
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
              'fill-extrusion-color': theme === 'dark' ? '#475569' : '#cbd5e1',
              'fill-extrusion-height': ['get', 'height'],
              'fill-extrusion-opacity': 0.8
            }
          }
        ]
      },
      center: [-88.0051, 37.8459],
      zoom: 15,
      pitch: 60,
      bearing: 15,
      antialias: true
    });

    mapRef.current = map;

    map.on('load', () => {
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
          'fill-extrusion-color': theme === 'dark' ? '#06b6d4' : '#3b82f6',
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
          'fill-extrusion-color': theme === 'dark' ? '#22c55e' : '#10b981',
          'fill-extrusion-height': 115,
          'fill-extrusion-base': 112,
          'fill-extrusion-opacity': 0.7
        }
      });
    });

    return () => {
      map.remove();
    };
  }, [theme]); // Re-initialize map when theme changes

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

  return (
    <div className="relative w-full h-full bg-slate-100 dark:bg-[#020617] overflow-hidden font-sans text-slate-900 dark:text-white rounded-xl">
      
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
        
        <div className="space-y-2">
          <button 
            onClick={() => flyTo('node')}
            className="w-full text-left bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 px-3 py-2 text-xs transition-colors rounded font-medium text-slate-700 dark:text-slate-200"
          >
            1. SOVEREIGN NODE (Home)
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
      </div>

      <div ref={mapContainer} className="w-full h-full z-0" />
    </div>
  );
}

export default OvertureTwinView;
"""

with open("src/components/OvertureTwinView.tsx", "w") as f:
    f.write(new_content)
