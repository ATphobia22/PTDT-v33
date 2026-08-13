/**
 * MapLibre GL JS + deck.gl hybrid viewport.
 * Authority: presentation-only. Never writes HydroLayer or freeboard.
 * Perf: tile cache, zoom culling, render budget, COG tile paths.
 */
import React, { useEffect, useRef, useCallback } from 'react';
import maplibregl, { Map } from 'maplibre-gl';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { GeoJsonLayer } from '@deck.gl/layers';
import type { TwinStateName } from '../core/TwinStateManager';
import { BONEBANK_SITE, INDIANA_GIS_SERVICES } from '../constants/siteConstants';
import 'maplibre-gl/dist/maplibre-gl.css';

export interface HybridMapProps {
  stageFt: number;
  twinState: TwinStateName;
  layerVisibility: Record<string, boolean>;
  onMapReady?: (map: Map) => void;
  /** Max tiles retained for DEM+imagery (MapLibre internal cache). Default 250. */
  maxTileCacheSize?: number;
  /** Min zoom to show hillshade. Default 11. */
  hillshadeMinZoom?: number;
  /** Min zoom to show building extrusion. Default 13. */
  extrusionMinZoom?: number;
  /** Target frame budget ms (desktop). Default 16. */
  frameBudgetMs?: number;
  /** Called when consecutive frames exceed budget. */
  onFrameBudgetExceeded?: (ms: number) => void;
}

const BUILDINGS_GEOJSON = '/geo/bonebank_buildings.geojson';
/** Prefer worker parse: MapLibre loads GeoJSON URL async; deck uses same URL. */
const RAS_EXTENT_URL = '/api/v1/ras/extent?authority=presentation';

export function MapLibreDeckHybrid({
  stageFt,
  twinState,
  layerVisibility,
  onMapReady,
  maxTileCacheSize = 250,
  hillshadeMinZoom = 11,
  extrusionMinZoom = 13,
  frameBudgetMs = 16,
  onFrameBudgetExceeded,
}: HybridMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const lastRenderT = useRef<number>(0);
  const zoomRef = useRef<number>(BONEBANK_SITE.zoom);

  const buildDeckLayers = useCallback(() => {
    const layers = [];
    const showExtrusion =
      layerVisibility.extrudedBuildings !== false &&
      zoomRef.current >= extrusionMinZoom;

    if (showExtrusion) {
      layers.push(
        new GeoJsonLayer({
          id: 'buildings-extrusion',
          data: BUILDINGS_GEOJSON,
          extruded: true,
          wireframe: false,
          pickable: false,
          getElevation: (f: { properties?: { height_m?: number } }) =>
            f.properties?.height_m ?? 7.2,
          getFillColor:
            twinState === 'CRITICAL_INUNDATION'
              ? [239, 68, 68, 220]
              : [56, 189, 248, 200],
          material: { ambient: 0.35, diffuse: 0.6, shininess: 32 },
          updateTriggers: { getFillColor: twinState },
          parameters: { depthTest: true },
        })
      );
    }
    return layers;
  }, [twinState, layerVisibility, extrusionMinZoom]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
        sources: {
          dem: {
            type: 'raster-dem',
            tiles: ['/tiles/dem/{z}/{x}/{y}.webp'],
            tileSize: 512,
            maxzoom: 16,
            encoding: 'mapbox',
          },
          indiana_imagery: {
            type: 'raster',
            tiles: [
              'https://imagery.indianamap.org/arcgis/rest/services/Imagery/Indiana_Current_Imagery/MapServer/tile/{z}/{y}/{x}',
            ],
            tileSize: 256,
            attribution: 'IndianaMap / IGIC',
          },
          floodDepth: {
            type: 'raster',
            tiles: ['/tiles/flood100/{z}/{x}/{y}.webp'],
            tileSize: 256,
            maxzoom: 16,
          },
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': '#0f172a' },
          },
          {
            id: 'indiana-imagery',
            type: 'raster',
            source: 'indiana_imagery',
            paint: { 'raster-opacity': 0.85 },
          },
          {
            id: 'flood-depth-raster',
            type: 'raster',
            source: 'floodDepth',
            paint: { 'raster-opacity': 0.45 },
            minzoom: 10,
          },
          {
            id: 'terrain-hillshade',
            type: 'hillshade',
            source: 'dem',
            minzoom: hillshadeMinZoom,
            paint: {
              'hillshade-exaggeration': 0.55,
              'hillshade-shadow-color': '#020617',
              'hillshade-highlight-color': '#e2e8f0',
            },
          },
        ],
        terrain: { source: 'dem', exaggeration: 1.0 },
      },
      center: BONEBANK_SITE.center,
      zoom: BONEBANK_SITE.zoom,
      pitch: 55,
      bearing: -20,
      maxPitch: 85,
      antialias: true,
      attributionControl: true,
      maxTileCacheSize,
    } as maplibregl.MapOptions & { maxTileCacheSize?: number });

    try {
      (map as unknown as { setMaxTileCacheSize?: (n: number) => void }).setMaxTileCacheSize?.(
        maxTileCacheSize
      );
    } catch {
      /* older maplibre */
    }

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );
    map.addControl(new maplibregl.ScaleControl({ unit: 'imperial' }), 'bottom-left');

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: buildDeckLayers(),
    });
    map.addControl(overlay as unknown as maplibregl.IControl);
    overlayRef.current = overlay;

    map.on('load', () => {
      if (layerVisibility.flood100Yr !== false) {
        map.addSource('ras-flood', {
          type: 'geojson',
          data: RAS_EXTENT_URL,
        });
        map.addLayer({
          id: 'ras-flood-fill',
          type: 'fill',
          source: 'ras-flood',
          paint: {
            'fill-color': [
              'interpolate',
              ['linear'],
              ['get', 'depth_ft'],
              0, '#0ea5e9',
              3, '#14b8a6',
              6, '#eab308',
              10, '#f97316',
              15, '#ef4444',
            ],
            'fill-opacity': 0.55,
          },
        });
      }
      onMapReady?.(map);
    });

    map.on('zoom', () => {
      const z = map.getZoom();
      zoomRef.current = z;
      if (map.getLayer('terrain-hillshade')) {
        map.setLayoutProperty(
          'terrain-hillshade',
          'visibility',
          z >= hillshadeMinZoom ? 'visible' : 'none'
        );
      }
      overlayRef.current?.setProps({ layers: buildDeckLayers() });
    });

    map.on('render', () => {
      const now = performance.now();
      if (lastRenderT.current > 0) {
        const dt = now - lastRenderT.current;
        if (dt > frameBudgetMs) {
          onFrameBudgetExceeded?.(dt);
        }
      }
      lastRenderT.current = now;
    });

    mapRef.current = map;

    return () => {
      overlay.finalize();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    overlayRef.current?.setProps({ layers: buildDeckLayers() });
  }, [buildDeckLayers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (map.getLayer('ras-flood-fill')) {
      map.setPaintProperty(
        'ras-flood-fill',
        'fill-opacity',
        Math.min(0.75, 0.4 + stageFt * 0.01)
      );
    }
  }, [stageFt]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      data-authority="presentation-only"
      data-datum="NAVD88"
      data-services={JSON.stringify(INDIANA_GIS_SERVICES)}
      data-tile-cache={maxTileCacheSize}
    />
  );
}
