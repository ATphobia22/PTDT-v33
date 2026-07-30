# Photoreal 3D path (houses, streets, sim-grade look) — free / no commercial map keys

Google Maps / Cesium Ion **photoreal 3D tiles** require accounts and API keys. This project stays on a **zero-key** ladder with increasing fidelity.

## Three tiers (all implemented or documented)

| Tier | What you see | How | Photoreal? |
|------|--------------|-----|------------|
| **1 · OSM extrusions** | Real building footprints, height from tags | Overpass → GeoJSON → MapLibre `fill-extrusion` | No — solid volumes |
| **2 · Mesh houses** | Game-like house at property | MapLibre custom layer + **Three.js** (procedural or glTF) | Medium — swap in textured glTF |
| **3 · Terrain** | Rolling ground | Mapterhorn DEM or **self-hosted** Terrarium from LiDAR | Ground only |

Demo: `demos/ptdt-v33-photoreal-path.html`

```bash
python -m http.server 8080
# http://localhost:8080/demos/ptdt-v33-photoreal-path.html
```

## Path to “high-end video game” fidelity (still free OSS)

### A. Textured glTF houses (best next step)

1. Model in **Blender** (or download CC0 farmhouse from Poly Haven / Kenney).  
2. Export **glTF/GLB**.  
3. Load with Three.js `GLTFLoader` inside the MapLibre custom layer (same pattern as [MapLibre three.js example](https://maplibre.org/maplibre-gl-js/docs/examples/add-a-3d-model-using-threejs/)).  
4. Place at survey coordinates (NAVD 88 horizontal from GPS/survey).

### B. True site photoreal (drone)

1. Fly site (FAA rules).  
2. **OpenDroneMap** or WebODM → textured mesh + orthophoto + DEM.  
3. Optional: **3D Gaussian splat** tools (open research pipelines) for view-dependent realism.  
4. Serve mesh tiles or a single glTF; overlay flood GeoJSON from HEC-RAS **results** (not the other way around).

### C. Streets like “Google Street View”

| Need | Free approach |
|------|----------------|
| Road network | OSM ways in MapLibre |
| Street-level imagery | Mapillary (API terms) or your own 360 capture — not zero-config |
| Continuous city photoreal | Google Photorealistic 3D Tiles / Cesium ion — **out of zero-key scope** |

Rural Posey County is better served by **your own drone mesh** than global commercial 3D tiles.

## What not to claim

- Extruded OSM ≠ as-built architecture  
- Procedural house ≠ 13101 Bonebank surveyed structure  
- Global DEM ≠ 5 cm LiDAR  
- Pretty flood fill ≠ PE HEC-RAS inundation  

## Related repo docs

- `docs/ZERO_KEY_MAP_STACK.md`  
- `docs/MAPLIBRE_PMTILES.md`  
- `docs/BLENDER_VIZ_OPTIONAL.md`  
