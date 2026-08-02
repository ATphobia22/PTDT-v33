# Photorealistic 3D / fill tiles — what is real

## Request vs capability

V34 text asks for **5 cm drone LiDAR**, Terrain-RGB forensic mesh, and photoreal fill tiles. That product requires **owned survey data** and (for regulatory use) surveyor/PE custody. It is **not** generated from the V34 narrative alone.

## What the twin implements (zero-key)

| Layer | Source | Notes |
|-------|--------|-------|
| **Terrain mesh** | AWS Terrarium DEM tiles | MapLibre `raster-dem` + `encoding: terrarium` |
| **Hillshade** | Same DEM | Optional hillshade layer |
| **Building extrusions** | OSM / OpenFreeMap + `/api/gis/buildings` | `fill-extrusion` |
| **Flood context** | FEMA NFHL / IDNR BAFM proxies | 2D fill overlays |

Helper: `src/lib/mapTerrainAndBuildings.ts`  
`MapComponent` already lazy-loads Terrarium and OSM fill-extrusion.

## Terrarium encoding

```
height_m = (R * 256 + G + B / 256) - 32768
```
(MapLibre handles this when `encoding: "terrarium"`.)

Public tiles:
`https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png`

## Accuracy disclaimer

- Terrarium/3DEP-class DEM is **meters-scale**, not certified **±5 cm**.  
- Do not present GPU terrain as LOMA elevation evidence.  
- Site LAG/BFE remain from `BONEBANK_SITE` (survey / FIRM path).  
- Photoreal RGB textures (satellite/aerial) can be added as raster overlays (NAIP, etc.) separately from DEM.

## Optional next (human data)

1. Contract 5 cm LiDAR / photogrammetry for the parcel.  
2. Encode Terrain-RGB or quantized mesh offline.  
3. Host as PMTiles / 3D Tiles with survey metadata.  
4. PE/surveyor seals elevations for regulatory packages.
