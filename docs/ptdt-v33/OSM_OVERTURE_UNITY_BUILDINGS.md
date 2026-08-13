# OSM / Overture / Microsoft buildings → Unity Box3D world

**Goal:** Accurate **massing** for streets and structures in the Unity presentation layer.  
**Rule:** Footprints and extrusions are **presentation geometry** — they do not alter hydro seals, BFE, or LOMA LAG.

## Data sources (open)

| Source | Content | License posture | Best for |
|---|---|---|---|
| **OpenStreetMap** | Building polygons + Simple3D tags (`height`, `building:levels`, `roof:*`) | ODbL | Roads, POIs, tagged heights where present |
| **Microsoft US Building Footprints** | Statewide ML footprints (IN ≈ 3.38M) | ODbL | Dense coverage where OSM is thin |
| **Overture Maps** `theme=buildings` | Global GERS buildings (OSM + MS + others) | CDLA / Overture terms | Production footprint harvest |
| County parcels | Tax polygons | County ToS | Ownership context, not building shells |
| Project LiDAR / ortho | True heights + textures | Project | Anchor structures only |

Rural Posey / Point Township: expect **sparse** OSM `height` tags. Prefer Microsoft/Overture footprints + default rural storey height, refined by LiDAR where available.

## OSM Simple 3D tags (relevant)

| Tag | Meaning |
|---|---|
| `building=*` | Outline |
| `height=*` | Ground to roof top (m) |
| `building:levels=*` | Storeys above ground (≈ 3 m/level default if no height) |
| `min_height=*` | Elevated structures |
| `roof:shape`, `roof:height`, `roof:levels` | Roof LOD |

Reference: https://wiki.openstreetmap.org/wiki/Simple_3D_Buildings

## Recommended ingest pipeline

```
1. Clip bbox around Bonebank / Point Township (EPSG:4326 → project CRS)
2. Prefer Overture buildings Parquet OR MS Indiana GeoJSON + OSM roads/water
3. Attribute height:
     if height tag → use meters
     else if building:levels → levels * 3.0 m (rural default)
     else → 4.5 m single-storey default
4. Extrude polygon → mesh (Unity ProBuilder / custom Mesh API)
5. Place on NAVD88 DEM heightmap (render-origin relative for Box3D)
6. Texture: ortho atlas or neutral PBR — not invented “photoreal faces”
7. Seal composition_stack.json SHA-256 for cinematic plates
```

**Photorealism note:** OSM/Microsoft do **not** provide facade photos. True photoreal requires:
- licensed aerial / street imagery, or  
- site drone photogrammetry / Gaussian splat (research path), or  
- hand-authored materials  

For sovereign PTDT, prefer **accurate massing + real terrain** over synthetic facades.

## Unity / Box3D wiring

| Step | Action |
|---|---|
| CRS | Transform footprints to local meters about render origin |
| Vertical | Sample DEM at centroid; set base Y = ground (NAVD88 relative) |
| Physics | Optional Box3D static bodies for collision / debris VFX only |
| Authority | Building mesh **never** writes into sealed hydro Redis stream |

OSM Buildings JS (`osmbuildings.org`) is useful for **web** preview; Unity needs native meshes from the same GeoJSON/Parquet extract.

## Related

- `integrations/box3d-unity/`
- `docs/ptdt-v33/MAPLIBRE_DECKGL_INTEGRATION.md` (web extrusion)
- `frontend/src/viz/MapLibreDeckHybrid.tsx`
