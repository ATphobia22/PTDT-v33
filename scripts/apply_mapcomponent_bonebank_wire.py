#!/usr/bin/env python3
"""Idempotent MapComponent Bonebank wire — run from repo root."""
from pathlib import Path
import re

p = Path("src/components/MapComponent.tsx")
text = p.read_text(encoding="utf-8")
if "bootBonebankMapLayers" in text and "37.9035" in text:
    print("already wired")
    raise SystemExit(0)

if "from './PoseyGISTools'" in text and "mapBoot" not in text:
    text = text.replace(
        "import { PoseyGISTools } from './PoseyGISTools';",
        "import { PoseyGISTools } from './PoseyGISTools';\n"
        "import { bootBonebankMapLayers, bonebankCamera } from '../lib/mapBoot';\n"
        "import { BONEBANK_SITE } from '../lib/siteConstants';\n"
        "import { ensureTerrariumTerrain } from '../lib/mapTerrainAndBuildings';",
    )

old = """  {
    name: 'Point Township, IN',
    center: [-88.0051, 37.8459],
    zoom: 13.8,
    pitch: 62,
    bearing: 45,
    description: 'FEMA Flood Zone Area of Interest'
  },"""
new = """  {
    name: 'Point Township, IN',
    center: [-88.0007, 37.9035],
    zoom: 16,
    pitch: 58,
    bearing: 28,
    description: '13101 Bonebank Road — BFE 375.0 / LAG 377.2 NAVD88'
  },"""
text = text.replace(old, new)

pattern = r"  const loadTerrain = useCallback\(\(mapInstance: maplibregl\.Map\) => \{[\s\S]*?\}, \[terrainLoaded\]\);"
replacement = """  const loadTerrain = useCallback((mapInstance: maplibregl.Map) => {
    if (!mapInstance || terrainLoaded) return;
    try {
      ensureTerrariumTerrain(mapInstance, { exaggeration: 1.35 });
      setTerrainLoaded(true);
      setTerrainActive(true);
      console.log('Tri-State 3D Terrain Mesh loaded (Terrarium DEM).');
    } catch (err) {
      console.warn('Terrain DEM source failed to initialize:', err);
    }
  }, [terrainLoaded]);"""
text, n = re.subn(pattern, replacement, text, count=1)
if n != 1:
    print("warn: loadTerrain replace count", n)

needle = "    map.on('load', () => {\n      setMapLoaded(true);\n\n      // 1. Add Navigation and Terrain Controls"
repl = """    map.on('load', () => {
      setMapLoaded(true);

      // Bonebank terrain + local building extrusions (Terrarium + /api/gis/buildings)
      void bootBonebankMapLayers(map, { fly: false }).then((r) => {
        setBuildingCount((c) => (r.buildings > 0 ? r.buildings : c));
        setTerrainLoaded(true);
        setTerrainActive(true);
      }).catch((e) => console.warn('[MapComponent] bonebank boot', e));

      // 1. Add Navigation and Terrain Controls"""
if needle in text:
    text = text.replace(needle, repl)
else:
    print("warn: load boot needle not found")

p.write_text(text, encoding="utf-8")
print("wired", p)
