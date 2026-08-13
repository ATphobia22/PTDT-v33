/**
 * MapLibre GL JS + deck.gl hybrid viewport.
 * Authority: presentation-only. Never writes HydroLayer or freeboard.
 * DEM/ortho served as COG (OptimizeRasters / gdal_translate -of COG).
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
}

const BUILDINGS_GEOJSON = '/geo/bonebank_buildings.geojson';

export function MapLibreDeckHybrid({
  stageFt,
  twinState,
  layerVisibility,
  onMapReady,
}: HybridMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);

  const buildDeckLayers = useCallback(() => {
    const layers = [];

    if (layerVisibility.extrudedBuildings !== false) {
      layers.push(
        new GeoJsonLayer({
          id: 'buildings-extrusion',
          data: BUILDINGS_GEOJSON,
          extruded: true,
          wireframe: false,
          getElevation: (f: any) => f.properties?.height_m ?? 7.2,
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
  }, [twinState, layerVisibility]);

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
            id: 'terrain-hillshade',
            type: 'hillshade',
            source: 'dem',
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
    });

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      'top-right'
    );
    map.addControl(new maplibregl.ScaleControl({ unit: 'imperial' }), 'bottom-left');

    const overlay = new MapboxOverlay({
      interleaved: true,
      layers: buildDeckLayers(),
    });
    map.addControl(overlay as any);
    overlayRef.current = overlay;

    map.on('load', () => {
      if (layerVisibility.flood100Yr !== false) {
        map.addSource('ras-flood', {
          type: 'geojson',
          data: '/api/v1/ras/extent?authority=presentation',
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

    mapRef.current = map;

    return () => {
      overlay.finalize();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    overlayRef.current?.setProps({ layers: buildDeckLayers() });
  }, [buildDeckLayers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (map.getLayer('ras-flood-fill')) {
      map.setPaintProperty('ras-flood-fill', 'fill-opacity', Math.min(0.75, 0.4 + stageFt * 0.01));
    }
  }, [stageFt]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full"
      data-authority="presentation-only"
      data-datum="NAVD88"
      data-services={JSON.stringify(INDIANA_GIS_SERVICES)}
    />
  );
}
