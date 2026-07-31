import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as pmtiles from 'pmtiles';
import * as gisService from '../services/gisService';
import * as THREE from 'three';
import { PDT3DAssets } from '../3d-assets';
import { ProceduralPlacementManager } from '../lib/ProceduralPlacementManager';
import { dataStreamer } from '../lib/GeoSpatialDataStreamer';
import { 
  Map, 
  Building2, 
  Sliders, 
  Compass, 
  Eye, 
  RefreshCw, 
  Info, 
  Navigation, 
  Layers, 
  Globe, 
  Sun, 
  Moon, 
  Check,
  ChevronRight,
  HelpCircle,
  Activity,
  Plus,
  Minus,
  RotateCw,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Landmark,
  Microscope,
  Play,
  Pause
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ScientificProofOverlay } from './ScientificProofOverlay';
import { PoseyGISTools } from './PoseyGISTools';

interface CameraPreset {
  name: string;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
  description: string;
  year?: string;
  state?: 'IN' | 'IL' | 'KY';
}

const CAMERA_PRESETS: CameraPreset[] = [
  {
    name: 'Point Township, IN',
    center: [-88.0051, 37.8459],
    zoom: 13.8,
    pitch: 62,
    bearing: 45,
    description: 'FEMA Flood Zone Area of Interest'
  },
  {
    name: 'Mount Vernon, IN',
    center: [-87.8950, 37.9320],
    zoom: 13.5,
    pitch: 65,
    bearing: -35,
    description: 'Wabash-Ohio River Port & Industrial Hub'
  },
  {
    name: 'Old Shawneetown, IL',
    center: [-88.1345, 37.6975],
    zoom: 14.0,
    pitch: 60,
    bearing: 30,
    description: 'Historic river port and flood-prone settlement'
  },
  {
    name: 'Uniontown, KY',
    center: [-87.9353, 37.7781],
    zoom: 13.8,
    pitch: 65,
    bearing: -45,
    description: 'Coal-loading terminal and historical Ohio town'
  }
];

const HISTORIC_SITES_PRESETS: CameraPreset[] = [
  {
    name: 'Old New Harmony',
    center: [-87.9351, 38.1293],
    zoom: 15.5,
    pitch: 55,
    bearing: 15,
    description: 'Famous utopian community founded by George Rapp and Robert Owen',
    year: '1814',
    state: 'IN'
  },
  {
    name: 'Hovey Lake Archaeological Site',
    center: [-87.9272, 37.8340],
    zoom: 15.0,
    pitch: 45,
    bearing: 0,
    description: 'Prehistoric Mississippian culture settlement and earthwork mounds',
    year: '1400 AD',
    state: 'IN'
  },
  {
    name: 'Old Shawneetown Bank',
    center: [-88.1345, 37.6975],
    zoom: 15.8,
    pitch: 50,
    bearing: -10,
    description: 'Historic 1839 Greek Revival structure, oldest standing Illinois bank',
    year: '1839',
    state: 'IL'
  },
  {
    name: 'Bone Bank site',
    center: [-88.0160, 37.8930],
    zoom: 15.2,
    pitch: 45,
    bearing: -15,
    description: 'Crucial prehistoric village along the erosion-prone Wabash River bank',
    year: '1200 AD',
    state: 'IN'
  },
  {
    name: 'Uniontown Coal & River Port',
    center: [-87.9353, 37.7781],
    zoom: 15.4,
    pitch: 52,
    bearing: 25,
    description: 'Major historic Ohio River coal coaling station and shipping terminal',
    year: '1840',
    state: 'KY'
  }
];

type TileSourceType = 'openfreemap' | 'overture';
type BuildingTheme = 'thematic' | 'cyber' | 'warm' | 'glass';

interface MapComponentProps {
  layerOpacities?: {
    geospatial: number;
    hydrodynamic: number;
    structural: number;
  };
  layers?: {
    geospatial: boolean;
    hydrodynamic: boolean;
    structural: boolean;
    predictiveBounds: string;
  };
}

export function MapComponent({ layers: externalLayers, layerOpacities }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const protocolAdded = useRef(false);
  const { theme, toggleTheme } = useTheme();

  // Component UI State
  const [mapLoaded, setMapLoaded] = useState(false);
  const [sourceType, setSourceType] = useState<TileSourceType>('openfreemap');
  const [buildingTheme, setBuildingTheme] = useState<BuildingTheme>('thematic');
  const [heightMultiplier, setHeightMultiplier] = useState<number>(1.0);
  const [buildingOpacity, setBuildingOpacity] = useState<number>(0.8);
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<'3d' | 'gis'>('gis');
  const [activePreset, setActivePreset] = useState<string>('Point Township, IN');
  const [buildingCount, setBuildingCount] = useState<number>(0);
  const [tilesLoading, setTilesLoading] = useState<boolean>(false);
  const [is3D, setIs3D] = useState<boolean>(true);
  const [showProof, setShowProof] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  
  // Infrastructure & Ecology States
  const [showTrees, setShowTrees] = useState<boolean>(true);
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [showStructures, setShowStructures] = useState<boolean>(true);

  // Regional Data States
  const [historicSites, setHistoricSites] = useState<any>(null);
  const [femaZones, setFemaZones] = useState<any>(null);
  const [dnrFloodplain, setDnrFloodplain] = useState<any>(null);

  const assetLoader = useRef(new PDT3DAssets());
  const threeLayerRef = useRef<any>(null);
  const placementManager = useRef<ProceduralPlacementManager | null>(null);

  // High-performance states to minimize initial memory overhead
  const [isIntersecting, setIsIntersecting] = useState(true);
  const [terrainLoaded, setTerrainLoaded] = useState(false);
  const [terrainActive, setTerrainActive] = useState(false);

  // Helper to dynamically load high-density terrain mesh data on-demand
  const loadTerrain = useCallback((mapInstance: maplibregl.Map) => {
    if (!mapInstance || terrainLoaded) return;
    try {
      // Configure on-demand AWS terrarium DEM tiles encoding to render real-time elevations
      mapInstance.addSource('terrain-dem', {
        type: 'raster-dem',
        tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
        encoding: 'terrarium',
        tileSize: 256,
        maxzoom: 15
      });
      
      mapInstance.setTerrain({ source: 'terrain-dem', exaggeration: 1.5 });
      setTerrainLoaded(true);
      setTerrainActive(true);
      console.log('Tri-State 3D Terrain Mesh lazy-loaded dynamically on navigation.');
    } catch (err) {
      console.warn('Terrain DEM source failed to initialize:', err);
    }
  }, [terrainLoaded]);

  // Calculates/estimates current screen building elements
  const updateBuildingCount = useCallback(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    try {
      const activeLayerId = sourceType === 'overture' ? '3d-buildings-overture' : 
        (map.getLayer('3d-buildings-osm') ? '3d-buildings-osm' : '3d-buildings-osm-fallback');

      if (!map.getLayer(activeLayerId)) return;

      const features = map.queryRenderedFeatures({ layers: [activeLayerId] });
      const count = features.length;
      setBuildingCount(prev => prev === count ? prev : count);
    } catch (e) {
      // Quiet fail if layers not loaded fully
    }
  }, [sourceType]);

  // Helper to build robust MapLibre Expression syntax for Extrusion colors
  const getBuildingPaintProperties = useCallback((source: TileSourceType): any => {
    const heightKey = source === 'overture' ? 'height' : 'render_height';
    
    switch (buildingTheme) {
      case 'cyber':
        return {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', heightKey], 10],
            0, '#ec4899',   // Electric Pink
            15, '#a855f7',  // Deep Purple
            45, '#3b82f6',  // Cyber Blue
            100, '#06b6d4', // Bright Cyan
            250, '#10b981'  // Emerald green high-rise
          ],
        };
      case 'warm':
        return {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', heightKey], 8],
            0, '#ea580c',   // Terracotta / Burnt Orange
            15, '#f59e0b',  // Soft Sandstone
            50, '#d97706',  // Amber Clay
            150, '#b45309'  // Dark brick
          ],
        };
      case 'glass':
        return {
          'fill-extrusion-color': [
            'interpolate',
            ['linear'],
            ['coalesce', ['get', heightKey], 12],
            0, '#e2e8f0',   // Translucent white
            20, '#bae6fd',  // Soft blue glass
            75, '#38bdf8',  // Mirror cyan
            180, '#0284c7'  // Deep blue spire
          ],
        };
      case 'thematic':
      default:
        // Elegant slate color schema matching dark/light themes
        return {
          'fill-extrusion-color': (theme === 'dark' || theme === 'blueprint') 
            ? [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', heightKey], 10],
                0, '#1e293b',   // Slate 800
                30, '#334155',  // Slate 700
                80, '#475569',  // Slate 600
                200, '#64748b'  // Slate 500
              ]
            : [
                'interpolate',
                ['linear'],
                ['coalesce', ['get', heightKey], 10],
                0, '#f1f5f9',   // Slate 50
                30, '#e2e8f0',  // Slate 200
                80, '#cbd5e1',  // Slate 300
                200, '#94a3b8'  // Slate 400
              ],
        };
    }
  }, [buildingTheme, theme]);

  // Setup Intersection Observer to lazy load the entire map canvas only when visible
  useEffect(() => {
    if (!mapContainer.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect(); // Map stays loaded once triggered
        }
      },
      { threshold: 0.05, rootMargin: '120px' } // Pre-triggers map load slightly before visible
    );

    observer.observe(mapContainer.current);
    return () => observer.disconnect();
  }, []);

  // Initialize PMTiles Protocol globally
  useEffect(() => {
    if (!protocolAdded.current) {
      try {
        const protocol = new pmtiles.Protocol();
        maplibregl.addProtocol('pmtiles', protocol.tile);
        protocolAdded.current = true;
      } catch (err) {
        console.warn('PMTiles protocol already registered or failed to register:', err);
      }
    }
  }, []);

  
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !layerOpacities || !mapRef.current.isStyleLoaded()) return;
    
    // We assume MapLibre is loaded
    const externalLayers = [
      { id: 'geo-mesh-data', key: 'geospatial' },
      { id: 'hydro-live-data', key: 'hydrodynamic' },
      { id: 'structural-live-data', key: 'structural' }
    ];
    
    externalLayers.forEach(layer => {
      if (mapRef.current!.getLayer(layer.id)) {
        const op = (layerOpacities as any)[layer.key] / 100;
        mapRef.current!.setPaintProperty(layer.id, 'fill-opacity', op);
        if (mapRef.current!.getLayer(layer.id + '-line')) {
           mapRef.current!.setPaintProperty(layer.id + '-line', 'line-opacity', op);
        }
      }
    });
  }, [layerOpacities, mapLoaded]);

  // Main Map Re-initialization when theme, source type, or intersection changes
  useEffect(() => {
    if (!mapContainer.current || !isIntersecting) return;

    // Determine the base map style
    // OpenFreeMap Liberty and Bright styles are perfect open-source options
    let styleUrl = (theme === 'dark' || theme === 'blueprint') 
      ? 'https://tiles.openfreemap.org/styles/dark' 
      : 'https://tiles.openfreemap.org/styles/liberty';

    // Fallback CartoDB styles if OpenFreeMap styles are sluggish
    const baseStyle = {
      version: 8 as const,
      sources: {
        'carto': {
          type: 'raster' as const,
          tiles: [
            (theme === 'dark' || theme === 'blueprint') 
              ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
              : 'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
          ],
          tileSize: 256
        }
      },
      layers: [
        {
          id: 'carto-base',
          type: 'raster' as const,
          source: 'carto'
        }
      ]
    };

    const initialPreset = CAMERA_PRESETS.find(p => p.name === activePreset) || CAMERA_PRESETS[0];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: sourceType === 'openfreemap' ? styleUrl : baseStyle as any,
      center: initialPreset.center,
      zoom: initialPreset.zoom,
      pitch: initialPreset.pitch,
      bearing: initialPreset.bearing,
      transformRequest: (url, resourceType) => {
        if (resourceType === 'Glyphs' && url.includes('/fonts/')) {
          const decoded = decodeURIComponent(url);
          const isBold = decoded.toLowerCase().includes('bold') || 
                         decoded.toLowerCase().includes('semibold') || 
                         decoded.toLowerCase().includes('medium') ||
                         decoded.toLowerCase().includes('black');
          const targetFont = isBold ? 'Metropolis Bold' : 'Metropolis Regular';
          const newUrl = url.replace(/\/fonts\/[^\/]+\//, `/fonts/${encodeURIComponent(targetFont)}/`);
          return { url: newUrl };
        }
        return { url };
      }
    });

    mapRef.current = map;

    map.on('load', () => {
      setMapLoaded(true);

      // 1. Add Navigation and Terrain Controls
      map.addControl(new maplibregl.NavigationControl({ showCompass: true, showZoom: true }));

      // 2. Configure building sources and 3D layers based on selected source type
      if (sourceType === 'overture') {
        // PMTiles Overture Buildings Source
        map.addSource('overture-buildings', {
          type: 'vector',
          url: 'pmtiles://https://data.source.coop/protomaps/openstreetmap/tiles/v3.pmtiles',
        });

        map.addLayer({
          id: '3d-buildings-overture',
          type: 'fill-extrusion',
          source: 'overture-buildings',
          'source-layer': 'buildings',
          minzoom: 12,
          paint: getBuildingPaintProperties('overture'),
          layout: {
            visibility: 'visible'
          }
        });
      } else {
        // OpenFreeMap OSM Vector Buildings Layer
        const sourceExists = map.getSource('openmaptiles');
        
        if (sourceExists) {
          // Hide standard flat buildings
          const layers = map.getStyle().layers;
          if (layers) {
            layers.forEach(layer => {
              if (layer.id.includes('building') && layer.type !== 'fill-extrusion') {
                map.setLayoutProperty(layer.id, 'visibility', 'none');
              }
              if (layer.id.includes('forest') || layer.id.includes('wood') || layer.id.includes('park')) {
                map.setLayoutProperty(layer.id, 'visibility', 'none');
              }
            });
          }

          // 1. Specialized Residential Layer (Houses)
          map.addLayer({
            id: '3d-houses',
            type: 'fill-extrusion',
            source: 'openmaptiles',
            'source-layer': 'building',
            filter: ['all', 
              ['any', ['==', ['get', 'type'], 'house'], ['==', ['get', 'class'], 'residential'], ['==', ['get', 'class'], 'house']],
              ['!=', ['get', 'type'], 'barn']
            ],
            paint: {
              'fill-extrusion-color': (theme === 'dark' || theme === 'blueprint') ? '#1e293b' : '#f8fafc',
              'fill-extrusion-height': ['*', ['coalesce', ['get', 'render_height'], 15], heightMultiplier],
              'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
              'fill-extrusion-opacity': buildingOpacity
            }
          });

          // 2. Specialized Agricultural Layer (Barns)
          map.addLayer({
            id: '3d-barns',
            type: 'fill-extrusion',
            source: 'openmaptiles',
            'source-layer': 'building',
            filter: ['any', ['==', ['get', 'type'], 'barn'], ['==', ['get', 'class'], 'barn']],
            paint: {
              'fill-extrusion-color': (theme === 'dark' || theme === 'blueprint') ? '#451a03' : '#92400e',
              'fill-extrusion-height': ['*', ['coalesce', ['get', 'render_height'], 25], heightMultiplier],
              'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
              'fill-extrusion-opacity': buildingOpacity
            }
          });

          // 3. 3D Road Network (Draped Line)
          map.addLayer({
            id: '3d-roads-highspeed',
            type: 'line',
            source: 'openmaptiles',
            'source-layer': 'transportation',
            filter: ['all', ['==', ['get', 'class'], 'primary']],
            layout: { 'line-cap': 'round', 'line-join': 'round' },
            paint: {
              'line-color': (theme === 'dark' || theme === 'blueprint') ? '#00D4FF' : '#4f46e5',
              'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 15, 4],
              'line-opacity': 0.8
            }
          });

          // 4. Ecological Canopy (Trees/Forests)
          map.addLayer({
            id: '3d-canopy',
            type: 'fill-extrusion',
            source: 'openmaptiles',
            'source-layer': 'landuse',
            filter: ['any', ['==', ['get', 'class'], 'wood'], ['==', ['get', 'class'], 'forest']],
            paint: {
              'fill-extrusion-color': (theme === 'dark' || theme === 'blueprint') ? '#064e3b' : '#14532d',
              'fill-extrusion-height': 15,
              'fill-extrusion-base': 0,
              'fill-extrusion-opacity': 0.4
            }
          });

          map.addLayer({
            id: '3d-buildings-osm',
            type: 'fill-extrusion',
            source: 'openmaptiles',
            'source-layer': 'building',
            minzoom: 12,
            paint: getBuildingPaintProperties('openfreemap'),
            layout: {
              visibility: 'visible'
            }
          });
        }
      }

      // Add Custom Three.js Layer for Detailed Assets
      const customLayer: maplibregl.CustomLayerInterface = {
        id: '3d-detailed-assets',
        type: 'custom',
        renderingMode: '3d',
        onAdd: function (map, gl) {
          this.camera = new THREE.Camera();
          this.scene = new THREE.Scene();

          // Lights
          const light1 = new THREE.DirectionalLight(0xffffff, 1);
          light1.position.set(0, -70, 100).normalize();
          this.scene.add(light1);

          const light2 = new THREE.DirectionalLight(0xffffff, 0.5);
          light2.position.set(0, 70, 100).normalize();
          this.scene.add(light2);

          const ambLight = new THREE.AmbientLight(0x404040, 1);
          this.scene.add(ambLight);

          this.map = map;
          this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
          });

          this.renderer.autoClear = false;
          this.clock = new THREE.Clock();
          this.lastPerfUpdate = 0;

          placementManager.current = new ProceduralPlacementManager(this.scene, map);

          this.updateProceduralAssets = () => {
            if (!this.map || !placementManager.current) return;
            const features = this.map.queryRenderedFeatures({ 
              layers: ['3d-houses', '3d-barns', '3d-canopy', '3d-roads-highspeed'] 
            });
            placementManager.current.update(features);
          };

          this.map.on('moveend', this.updateProceduralAssets);
          this.updateProceduralAssets();
        },
        render: function (gl: any, matrix: any) {
          let m_array: number[];
          if (matrix && Array.isArray(matrix)) {
            m_array = matrix;
          } else if (gl && gl.defaultProjectionData) {
            m_array = gl.defaultProjectionData.mainMatrix;
          } else {
            return;
          }

          const m = new THREE.Matrix4().fromArray(m_array);
          this.camera.projectionMatrix = m;

          let drawCalls = 0;
          let assetCount = 0;

          if (placementManager.current) {
            placementManager.current.render(this.camera);
            assetCount = this.scene.children.length;
            drawCalls = assetCount;
          }

          // Throttle performance updates
          const now = performance.now();
          if (now - this.lastPerfUpdate > 1000) {
            window.dispatchEvent(new CustomEvent('pdt-performance-update', {
              detail: { drawCalls, assetCount, fps: 0 }
            }));
            this.lastPerfUpdate = now;
          }

          this.renderer.resetState();
          this.renderer.render(this.scene, this.camera);
          this.map.triggerRepaint();
        }
      };

      if (!map.getLayer('3d-detailed-assets')) {
        map.addLayer(customLayer);
        threeLayerRef.current = customLayer;
      }

      // Estimate rendered features
      updateBuildingCount();
    });

    map.on('dataloading', () => {
      // setTilesLoading(true); // Avoid rapid state updates
    });

    map.on('idle', () => {
      // setTilesLoading(false);
      // updateBuildingCount();
    });

    let fetchTimeout: any = null;
    map.on('moveend', () => {
      const bounds = map.getBounds();
      const bbox: [number, number, number, number] = [bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth()];

      if (fetchTimeout) clearTimeout(fetchTimeout);
      fetchTimeout = setTimeout(async () => {
        try {
          const regionData = await dataStreamer.fetchRegionData(bbox);
          if (placementManager.current && regionData.length > 0) {
            regionData.forEach(feature => {
              if (feature.type === 'historic') {
                placementManager.current?.placeAsset('house', feature.coordinates as [number, number], 0, feature.id);
              }
            });
          }
        } catch (error) {
          console.error("Regional data stream error:", error);
        }
      }, 800);

      // Lazy-load high-density terrain mesh when near a Tri-State location
      const center = map.getCenter();
      const allLocations = [...CAMERA_PRESETS, ...HISTORIC_SITES_PRESETS];
      const isNearAnyLocation = allLocations.some(site => {
        const dx = site.center[0] - center.lng;
        const dy = site.center[1] - center.lat;
        return Math.sqrt(dx * dx + dy * dy) < 0.15; // Within ~10-15 miles range
      });

      if (isNearAnyLocation && !terrainLoaded) {
        loadTerrain(map);
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [sourceType, theme, isIntersecting, updateBuildingCount]); // Re-initialize when the data source, global theme, or intersection changes

  // Reactive updates for theme styling, heights, and opacity (without full map reload)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.isStyleLoaded()) return;

    const activeLayerId = sourceType === 'overture' ? '3d-buildings-overture' : 
      (map.getLayer('3d-buildings-osm') ? '3d-buildings-osm' : '3d-buildings-osm-fallback');

    if (map.getLayer(activeLayerId)) {
      const paintProps = getBuildingPaintProperties(sourceType);
      
      // Update building heights with multiplier
      map.setPaintProperty(
        activeLayerId, 
        'fill-extrusion-height', 
        sourceType === 'overture'
          ? ['*', ['coalesce', ['get', 'height'], 8], heightMultiplier]
          : ['*', ['coalesce', ['get', 'render_height'], ['get', 'height'], 12], heightMultiplier]
      );

      // Update building min-height base
      map.setPaintProperty(
        activeLayerId, 
        'fill-extrusion-base', 
        sourceType === 'overture'
          ? ['coalesce', ['get', 'min_height'], 0]
          : ['coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0]
      );

      // Update opacity
      map.setPaintProperty(activeLayerId, 'fill-extrusion-opacity', buildingOpacity);

      // Update colors
      map.setPaintProperty(activeLayerId, 'fill-extrusion-color', paintProps['fill-extrusion-color']);
    }
  }, [buildingTheme, heightMultiplier, buildingOpacity, mapLoaded, sourceType, getBuildingPaintProperties]);

  // Handle Digital Twin Multiphysics Layer Toggles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.isStyleLoaded()) return;

    // Apply Hydrodynamic Water Shading
    const layers = map.getStyle()?.layers;
    if (layers) {
      layers.forEach(layer => {
        // Find water layers (usually named 'water', 'waterway', 'ocean', etc.)
        if (layer.id.includes('water') && layer.type === 'fill') {
          if (externalLayers?.hydrodynamic) {
            // Emissive volumetric shader simulation matching Turbovec scale
            map.setPaintProperty(layer.id, 'fill-color', [
               'interpolate', ['linear'], ['zoom'],
               12, '#003bff', // Severe Inundation
               15, '#00d4ff'  // Minor Low-Elevation Spill
            ]);
            map.setPaintProperty(layer.id, 'fill-opacity', 0.85);
            map.setPaintProperty(layer.id, 'fill-outline-color', '#00ffb7'); // Shallow saturation edge
          } else {
            // Reset to default
            map.setPaintProperty(layer.id, 'fill-color', (theme === 'dark' || theme === 'blueprint') ? '#0f172a' : '#94a3b8');
            map.setPaintProperty(layer.id, 'fill-opacity', 1);
            map.setPaintProperty(layer.id, 'fill-outline-color', 'transparent');
          }
        }
      });
    }

    // Add or Update Floating Telemetry Tags
    const TELEMETRY_SOURCE_ID = 'telemetry-tags-source';
    const TELEMETRY_LAYER_ID = 'telemetry-tags-layer';

    if (externalLayers?.hydrodynamic) {
      if (!map.getSource(TELEMETRY_SOURCE_ID)) {
        map.addSource(TELEMETRY_SOURCE_ID, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [-88.0051, 37.8459] }, // Near Point Township
                properties: { label: 'MAIN ST BRIDGE', metric: '18.2 ft' }
              },
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [-87.8950, 37.9320] }, // Near Mount Vernon
                properties: { label: 'RIVERSIDE DEPOT', metric: '17.8 ft' }
              },
              {
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [-88.1345, 37.6975] }, // Near Old Shawneetown
                properties: { label: 'WATER DEPTH', metric: '2.6 ft' }
              }
            ]
          }
        });

        map.addLayer({
          id: TELEMETRY_LAYER_ID,
          type: 'symbol',
          source: TELEMETRY_SOURCE_ID,
          layout: {
            'text-field': ['concat', ['get', 'label'], '\n', ['get', 'metric']],
            'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
            'text-size': 11,
            'text-offset': [0, -2],
            'text-anchor': 'bottom',
            'text-justify': 'center',
            'text-allow-overlap': true,
          },
          paint: {
            'text-color': '#00D4FF',
            'text-halo-color': 'rgba(0, 20, 40, 0.9)',
            'text-halo-width': 2,
            'text-halo-blur': 1,
          }
        });
      } else {
        map.setLayoutProperty(TELEMETRY_LAYER_ID, 'visibility', 'visible');
      }
    } else {
      if (map.getLayer(TELEMETRY_LAYER_ID)) {
        map.setLayoutProperty(TELEMETRY_LAYER_ID, 'visibility', 'none');
      }
    }
  }, [externalLayers, mapLoaded, theme]);

  // Cinematic Isometric Camera Rig (360 Sweep)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !isSimulating) return;

    let animationId: number;
    
    const rotateCamera = (timestamp: number) => {
      // 360 degrees per 240 seconds (very slow cinematic sweep)
      const speed = 360 / 240000;
      const rotation = (timestamp * speed) % 360;
      
      map.rotateTo(rotation, { duration: 0 });
      animationId = requestAnimationFrame(rotateCamera);
    };
    
    animationId = requestAnimationFrame(rotateCamera);
    return () => cancelAnimationFrame(animationId);
  }, [mapLoaded, isSimulating]);

  // Handle Component Toggles (Roads, Trees, Structures)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.isStyleLoaded()) return;

    const toggleVisibility = (layerId: string, visible: boolean) => {
      if (map.getLayer(layerId)) {
        map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    };

    toggleVisibility('3d-houses', showStructures);
    toggleVisibility('3d-barns', showStructures);
    toggleVisibility('3d-buildings-osm', showStructures);
    toggleVisibility('3d-buildings-overture', showStructures);
    toggleVisibility('3d-roads-highspeed', showRoads);
    toggleVisibility('3d-canopy', showTrees);
    toggleVisibility('historic-sites-layer', showStructures);
    toggleVisibility('fema-flood-layer', externalLayers?.hydrodynamic || false);
    toggleVisibility('dnr-flood-layer', externalLayers?.hydrodynamic || false);
  }, [showStructures, showRoads, showTrees, mapLoaded, externalLayers?.hydrodynamic]);

  // Update Regional Data Layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !map.isStyleLoaded()) return;

    const updateSource = (id: string, data: any) => {
      const source = map.getSource(id) as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(data || { type: "FeatureCollection", features: [] });
      } else if (data) {
        map.addSource(id, { type: 'geojson', data });
      }
    };

    updateSource('historic-sites-source', historicSites);
    updateSource('fema-flood-source', femaZones);
    updateSource('dnr-flood-source', dnrFloodplain);

    // Ensure layers exist
    if (historicSites && !map.getLayer('historic-sites-layer')) {
      map.addLayer({
        id: 'historic-sites-layer',
        type: 'fill-extrusion',
        source: 'historic-sites-source',
        paint: {
          'fill-extrusion-color': '#fbbf24',
          'fill-extrusion-height': 20,
          'fill-extrusion-base': 0,
          'fill-extrusion-opacity': 0.8
        }
      });
    }

    if (femaZones && !map.getLayer('fema-flood-layer')) {
      map.addLayer({
        id: 'fema-flood-layer',
        type: 'fill',
        source: 'fema-flood-source',
        paint: {
          'fill-color': '#3b82f6',
          'fill-opacity': 0.3,
          'fill-outline-color': '#2563eb'
        }
      });
    }

    if (dnrFloodplain && !map.getLayer('dnr-flood-layer')) {
      map.addLayer({
        id: 'dnr-flood-layer',
        type: 'fill',
        source: 'dnr-flood-source',
        paint: {
          'fill-color': '#10b981',
          'fill-opacity': 0.25,
          'fill-outline-color': '#059669'
        }
      });
    }

  }, [historicSites, femaZones, dnrFloodplain, mapLoaded]);

  const handleZoomIn = () => {
    mapRef.current?.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut({ duration: 300 });
  };

  const handlePitchUp = () => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      pitch: Math.min(map.getPitch() + 10, 85),
      duration: 300
    });
  };

  const handlePitchDown = () => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      pitch: Math.max(map.getPitch() - 10, 0),
      duration: 300
    });
  };

  const handleRotateLeft = () => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      bearing: map.getBearing() - 15,
      duration: 300
    });
  };

  const handleRotateRight = () => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({
      bearing: map.getBearing() + 15,
      duration: 300
    });
  };

  const handleToggle3D = () => {
    const map = mapRef.current;
    if (!map) return;
    if (is3D) {
      map.easeTo({ pitch: 0, bearing: 0, duration: 800 });
      setIs3D(false);
    } else {
      map.easeTo({ pitch: 55, bearing: 15, duration: 800 });
      setIs3D(true);
    }
  };

  const handlePresetClick = (preset: CameraPreset) => {
    const map = mapRef.current;
    if (!map) return;

    setActivePreset(preset.name);

    // Prioritize and lazy-load high-density terrain mesh when navigating to a new Tri-State location
    if (!terrainLoaded) {
      loadTerrain(map);
    }

    map.flyTo({
      center: preset.center,
      zoom: preset.zoom,
      pitch: preset.pitch,
      bearing: preset.bearing,
      essential: true,
      duration: 3500
    });
  };

  const resetView = () => {
    const allPresets = [...CAMERA_PRESETS, ...HISTORIC_SITES_PRESETS];
    const current = allPresets.find(p => p.name === activePreset) || CAMERA_PRESETS[0];
    mapRef.current?.flyTo({
      center: current.center,
      zoom: current.zoom,
      pitch: current.pitch,
      bearing: current.bearing,
      duration: 1500
    });
  };

  return (
    <div className="relative flex w-full h-full min-h-[500px] overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" id="maplibre-3d-canvas" />

      {/* Scientific Proof Overlay */}
      {showProof && <ScientificProofOverlay onClose={() => setShowProof(false)} />}

      {/* Map Loading overlay */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm transition-all duration-500">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white animate-bounce shadow-lg shadow-indigo-500/20 mb-4">
            <Building2 className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold tracking-wider uppercase font-mono text-slate-300">
            Initializing 3D Pipeline...
          </span>
          <span className="text-xs text-slate-500 font-mono mt-1">
            Loading vector building tiles
          </span>
        </div>
      )}

      {/* Floating Map Controls */}
      {mapLoaded && (
        <div className="absolute top-16 right-4 z-40 flex flex-col items-center gap-1.5 p-1.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 shadow-xl backdrop-blur-md">
          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            title="Zoom In"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
          
          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            title="Zoom Out"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
          >
            <Minus className="h-4 w-4" />
          </button>

          <div className="h-[1px] w-5 bg-slate-200 dark:bg-slate-800 my-0.5" />

          {/* Pitch Up */}
          <button
            onClick={handlePitchUp}
            title="Tilt Up"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
          >
            <ChevronUp className="h-4 w-4" />
          </button>

          {/* Pitch Down */}
          <button
            onClick={handlePitchDown}
            title="Tilt Down"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
          >
            <ChevronDown className="h-4 w-4" />
          </button>

          <div className="h-[1px] w-5 bg-slate-200 dark:bg-slate-800 my-0.5" />

          {/* Rotate Left */}
          <button
            onClick={handleRotateLeft}
            title="Rotate Left"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Rotate Right */}
          <button
            onClick={handleRotateRight}
            title="Rotate Right"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
          >
            <RotateCw className="h-4 w-4" />
          </button>

          <div className="h-[1px] w-5 bg-slate-200 dark:bg-slate-800 my-0.5" />

          {/* Toggle 3D Perspective */}
          <button
            onClick={handleToggle3D}
            title={is3D ? "Switch to 2D Plan View" : "Switch to 3D Perspective"}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer ${
              is3D 
                ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Eye className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Real-time Tile Synchronizing State Indicator */}
      {tilesLoading && mapLoaded && (
        <div className="absolute top-4 right-4 z-40 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-500/20 bg-slate-950/80 text-[11px] font-mono font-bold text-indigo-400 shadow-xl backdrop-blur-sm animate-pulse">
          <RefreshCw className="h-3 w-3 animate-spin text-indigo-400" />
          <span>Syncing pipeline...</span>
        </div>
      )}

      {/* Floating Panel Toggle */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <Sliders className="h-5 w-5" />
        </button>
      )}

      {/* Control Panel Sidebar */}
      <div 
        className={`absolute top-4 left-4 bottom-4 z-30 w-80 rounded-xl border border-slate-200/60 dark:border-slate-800/60 bg-white/95 dark:bg-slate-950/95 shadow-2xl backdrop-blur-md transition-all duration-300 flex flex-col overflow-hidden ${
          isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-[340px] opacity-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white leading-none">Tri-State 3D</h2>
              <span className="text-[9px] font-mono tracking-widest uppercase text-indigo-600 dark:text-indigo-400 font-semibold mt-1 block">
                Extrusion Engine
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white cursor-pointer transition-all"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={() => setSidebarTab('3d')}
            className={`flex-1 py-2 text-[10px] font-bold tracking-wider uppercase transition-colors ${
              sidebarTab === '3d'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-slate-900'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            3D Control
          </button>
          <button
            onClick={() => setSidebarTab('gis')}
            className={`flex-1 py-2 text-[10px] font-bold tracking-wider uppercase transition-colors ${
              sidebarTab === 'gis'
                ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400 bg-white dark:bg-slate-900'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Posey GIS
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
          
          {sidebarTab === 'gis' ? (
            <PoseyGISTools />
          ) : (
            <>
              {/* Scientific Proof Toggle */}
          <button
            onClick={() => setShowProof(!showProof)}
            className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-all cursor-pointer ${
              showProof 
                ? 'bg-indigo-600 border-indigo-600 text-white' 
                : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            <Microscope className="h-4 w-4" />
            <div className="text-left">
              <div className="text-xs font-bold leading-tight">Scientific Proof</div>
              <div className="text-[9px] opacity-70">FEMA/INdnr Metrics Analysis</div>
            </div>
          </button>

          {/* Animate Simulation Toggle */}
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`w-full p-3 rounded-lg border flex items-center gap-3 transition-all cursor-pointer ${
              isSimulating 
                ? 'bg-emerald-600 border-emerald-600 text-white' 
                : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
            }`}
          >
            {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <div className="text-left">
              <div className="text-xs font-bold leading-tight">Animate Simulation</div>
              <div className="text-[9px] opacity-70">Cinematic 3D Sweep</div>
            </div>
          </button>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
              Vector Tile Source
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
              <button
                onClick={() => setSourceType('openfreemap')}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold font-mono transition-all cursor-pointer ${
                  sourceType === 'openfreemap'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                OpenStreetMap
              </button>
              <button
                onClick={() => setSourceType('overture')}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold font-mono transition-all cursor-pointer ${
                  sourceType === 'overture'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Overture PMT
              </button>
            </div>
          </div>

          {/* Aesthetic Themes Selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
              3D Building Palette
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'thematic', name: 'Thematic', desc: 'Classic structural', color: 'bg-slate-500' },
                { id: 'cyber', name: 'Cyber Neon', desc: 'Sci-Fi spectrum', color: 'bg-fuchsia-500' },
                { id: 'warm', name: 'Warm Terracotta', desc: 'Brick & clay', color: 'bg-amber-600' },
                { id: 'glass', name: 'Glass Tower', desc: 'Reflective sky', color: 'bg-sky-400' }
              ].map((themeOpt) => (
                <button
                  key={themeOpt.id}
                  onClick={() => setBuildingTheme(themeOpt.id as BuildingTheme)}
                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all flex flex-col gap-1 ${
                    buildingTheme === themeOpt.id
                      ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className={`h-2.5 w-2.5 rounded-full ${themeOpt.color}`} />
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">
                      {themeOpt.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500">
                    {themeOpt.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Height and Opacity Sliders */}
          <div className="space-y-4 pt-1">
            {/* Height Multiplier */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  Elevation Scale
                </label>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {heightMultiplier.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={heightMultiplier}
                onChange={(e) => setHeightMultiplier(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Opacity Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
                  Extrusion Opacity
                </label>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {Math.round(buildingOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={buildingOpacity}
                onChange={(e) => setBuildingOpacity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Map Controls Checkboxes */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
              Physical Asset Overlays
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                <input
                  type="checkbox"
                  checked={showStructures}
                  onChange={(e) => setShowStructures(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                Houses & Barns (3D)
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                <input
                  type="checkbox"
                  checked={showRoads}
                  onChange={(e) => setShowRoads(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                Regional Road Network
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                <input
                  type="checkbox"
                  checked={showTrees}
                  onChange={(e) => setShowTrees(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                Ecological Canopy (Trees)
              </label>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
              View Filters
            </label>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer hover:text-slate-900 dark:hover:text-white">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                Show Streets & Landmark Labels
              </label>

              {/* Dynamic 3D Terrain Mesh Status indicator */}
              <div className="mt-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-[10px]">
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className="text-slate-400 dark:text-slate-500">3D Terrain Mesh:</span>
                  {terrainActive ? (
                    <span className="text-emerald-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      ACTIVE (LAZY)
                    </span>
                  ) : (
                    <span className="text-amber-500 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      STANDBY (SAVER)
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-sans leading-tight mt-0.5">
                  Terrain elevation data lazy-loads on navigating to any Tri-State location to conserve WebGL memory overhead.
                </p>
                {!terrainActive && (
                  <button
                    onClick={() => {
                      if (mapRef.current) loadTerrain(mapRef.current);
                    }}
                    className="mt-1.5 px-2 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-mono text-[9px] text-center font-bold tracking-wider uppercase cursor-pointer transition-all border border-indigo-500/10 shadow-sm"
                  >
                    Generate Terrain Mesh
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Quick Camera Preset Focus */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">
              Municipal Center Focus
            </label>
            <div className="space-y-1.5">
              {CAMERA_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handlePresetClick(preset)}
                  className={`w-full p-2 rounded-lg text-left cursor-pointer transition-all border flex flex-col ${
                    activePreset === preset.name
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-[11px] font-bold leading-tight">
                    {preset.name}
                  </span>
                  <span className={`text-[9px] leading-tight mt-0.5 ${
                    activePreset === preset.name ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {preset.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Tri-State Historical Landmarks Preset Focus */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
              <Landmark className="h-3.5 w-3.5" />
              <label className="text-[10px] font-bold uppercase tracking-wider font-mono">
                Tri-State Historical Sites
              </label>
            </div>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
              {HISTORIC_SITES_PRESETS.map((site) => (
                <button
                  key={site.name}
                  onClick={() => handlePresetClick(site)}
                  className={`w-full p-2 rounded-lg text-left cursor-pointer transition-all border flex flex-col ${
                    activePreset === site.name
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[11px] font-bold leading-tight flex items-center gap-1">
                      {site.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {site.year && (
                        <span className={`text-[8px] px-1 py-0.5 rounded font-mono font-bold ${
                          activePreset === site.name ? 'bg-amber-800 text-amber-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {site.year}
                        </span>
                      )}
                      {site.state && (
                        <span className={`text-[8px] px-1 py-0.5 rounded font-mono font-bold ${
                          activePreset === site.name ? 'bg-amber-700 text-amber-200' : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        }`}>
                          {site.state}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[9px] leading-tight mt-1 ${
                    activePreset === site.name ? 'text-amber-100' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {site.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
            </>
          )}
        </div>

        {/* Sidebar Footer with Live Telemetry Stats */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-emerald-500 animate-pulse" />
            Extrusions: {buildingCount > 0 ? buildingCount.toLocaleString() : 'Scanning'}
          </span>
          <button 
            onClick={resetView}
            className="text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <Compass className="h-3 w-3" /> Reset Camera
          </button>
        </div>
      </div>

      {/* Legend overlay (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 px-3 py-2 rounded-lg bg-slate-950/85 border border-slate-800/80 backdrop-blur-sm shadow-xl flex flex-col gap-2 text-[10px] font-mono text-slate-300 pointer-events-none">
        <span className="text-slate-500 uppercase tracking-wider font-bold border-b border-slate-800/50 pb-1 mb-1">
          LEGEND
        </span>
        {externalLayers?.hydrodynamic ? (
          <>
            <span className="text-[9px] text-slate-400 mb-0.5">WATER DEPTH (FT)</span>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#001428] border border-slate-700" />
              <span>&gt; 6.0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#003366] border border-slate-700" />
              <span>4.0 - 6.0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#005599] border border-slate-700" />
              <span>2.0 - 4.0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#0077CC] border border-slate-700" />
              <span>0.5 - 2.0</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#00D4FF] border border-slate-700" />
              <span>0 - 0.5</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[#0f172a] border border-slate-700" />
              <span>DRY</span>
            </div>
          </>
        ) : (
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              <span>Low-Rise</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span>Mid-Rise</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              <span>Skyscraper</span>
            </div>
            <div className="h-3 w-[1px] bg-slate-800" />
            <span className="text-slate-500 uppercase tracking-wider font-bold">
              3D Mode Enabled
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MapComponent;
