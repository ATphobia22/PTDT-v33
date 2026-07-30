# Zero-key 3D map stack (MapLibre)

## Goal

Interactive 3D **visualization** of the Bonebank / Posey corridor without Mapbox, Cesium Ion, or Google Maps accounts.

## What was fixed from the pasted “production-ready” HTML

| Issue in paste | Correction |
|----------------|------------|
| `unpkg.com` with empty paths | `maplibre-gl@4.7.1` CSS + JS |
| `openstreetmap.org{z}/{x}/{y}` | `https://tile.openstreetmap.org/{z}/{x}/{y}.png` |
| Fake `amazonaws.com` DEM URL | [Mapterhorn](https://tiles.mapterhorn.com/tilejson.json) free `raster-dem` |
| “GPU 2D-SWE” label | Procedural VFX only — **not** shallow-water solver |
| Missing NAVD 88 / survey caveats | HUD marks BFE/LAG as **hypothesis** |

## Demos in this repo

| File | Purpose |
|------|---------|
| `demos/ptdt-v33-sovereign.html` | OSM + terrain + extruded placeholder + stage slider flood fill |
| `demos/ptdt-v33-glsl-flow.html` | MapLibre **custom layer** + bi-phase noise flow |

Open locally (OSM tiles require network; respect OSM tile usage policy):

```bash
# from repo root
python -m http.server 8080
# open http://localhost:8080/demos/ptdt-v33-sovereign.html
```

## Offline / local LiDAR path (unchanged truth)

1. **PDAL** / WhiteboxTools → DEM GeoTIFF from LAS/LAZ  
2. **rio-rgbify** → Terrarium or Terrain-RGB tiles  
3. Serve tiles from localhost; point `raster-dem` `tiles` at `http://localhost:8080/{z}/{x}/{y}.png`  
4. Site vectors → tippecanoe → **PMTiles** (see `docs/MAPLIBRE_PMTILES.md`)

Global Mapterhorn DEM is **not** 5 cm drone LiDAR and is not survey-grade for LOMA.

## Regulatory

- Flood polygon opacity/color from the stage slider is **UI feedback**.  
- Model-of-record remains PE **HEC-RAS** + sealed elevations.  
- GLSL noise is animation, not hydrodynamics.
