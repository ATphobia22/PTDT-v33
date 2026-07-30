# PMTiles optimization techniques

PMTiles is a single-file archive of map tiles designed for **HTTP Range** reads. The browser (via the `pmtiles` JS protocol + MapLibre) fetches only the bytes needed for the current view — no tile server process required if object storage supports Range + CORS.

Official concepts: [docs.protomaps.com/pmtiles](https://docs.protomaps.com/pmtiles/)  
MapLibre patterns: [maplibre-pmtiles-patterns](https://github.com/maplibre/maplibre-agent-skills/blob/main/skills/maplibre-pmtiles-patterns/SKILL.md)

---

## 1. Build-time optimization (tippecanoe / Planetiler)

| Technique | Why |
|-----------|-----|
| **`--drop-densest-as-needed`** | Drops features when tiles get too heavy; keeps pan/zoom smooth |
| **`--extend-zooms-if-still-dropping`** | Preserves detail by pushing dense data to higher z |
| **Limit maxzoom** to what the UI uses (e.g. z14–z16 for a farm) | Smaller archive; less Range work |
| **Layer filters** | Only ship floodplain, berm, footprints, roads — not planet layers |
| **Separate basemap from site archive** | Cache global OSM/OpenFreeMap remotely; only host **Posey site** PMTiles |
| **Simplify geometries** before tippecanoe | Douglas–Peucker / Visvalingam on polygons |
| **Attribute pruning** | Keep only properties MapLibre styles need (`height`, `name`, …) |

Example (see `scripts/build_pmtiles_example.sh`):

```bash
tippecanoe -o site.mbtiles -zg \
  --drop-densest-as-needed \
  --extend-zooms-if-still-dropping \
  footprints.geojson floodplain.geojson
pmtiles convert site.mbtiles site.pmtiles   # if go-pmtiles installed
```

Planetiler is better for **region/country** builds; tippecanoe is ideal for **parcel-scale** GeoJSON.

---

## 2. Runtime / network optimization

| Technique | Why |
|-----------|-----|
| **HTTP Range** enabled on host | Core of PMTiles; without Range, clients fail or download the whole file |
| **CORS** `Access-Control-Allow-Origin` + expose Range headers | Browser MapLibre must read partial content |
| **CDN** (Cloudflare, CloudFront, R2+CDN) | Range responses cache well globally |
| **Immutable cache headers** | e.g. `Cache-Control: public, max-age=31536000` when the file is versioned |
| **`minzoom` / `maxzoom` on MapLibre source** | Skip requests outside useful zooms |
| **Prefer vector over dense raster** for footprints/paths | Style client-side; smaller payloads |
| **One site archive, not a world file** | Protomaps global builds are huge; extract a **bbox** for Posey |

Directory layout inside PMTiles minimizes round-trips when panning (typically a small number of Range requests per view change).

---

## 3. MapLibre client pattern

```ts
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";

const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

map.addSource("site", {
  type: "vector",
  url: "pmtiles://https://cdn.example.com/posey-bonebank.pmtiles",
  minzoom: 12,
  maxzoom: 16,
});
```

Local static server must support Range (many do; plain some simple servers do not — test with curl):

```bash
curl -I -H "Range: bytes=0-100" https://your-host/site.pmtiles
# expect HTTP 206 Partial Content
```

---

## 4. Recommended strategy for 13101 Bonebank / PTDT

```
┌─────────────────────────────┐
│ Remote free basemap style   │  demotiles / OpenFreeMap / OSM raster
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│ Site PMTiles (small)        │  footprints, berm, BAFL clip, ag paths
│ tippecanoe from GeoJSON     │  z12–z16 only
└──────────────┬──────────────┘
               │
┌──────────────▼──────────────┐
│ Optional local Terrarium    │  PDAL DEM → rio-rgbify (not in PMTiles)
└─────────────────────────────┘
```

Do **not** ship global Protomaps planet file for a single parcel UI.

---

## 5. Metrics to watch

| Metric | Target direction |
|--------|------------------|
| Archive size | Parcel layers often **&lt; 5–50 MB** if filtered |
| Range requests per pan | Low teens or less (depends on z/layers) |
| Time to first tile | CDN + 206 Partial Content |
| MapLibre FPS | Drop density / maxzoom if extrusion stutters |

---

## 6. Related

- `docs/MAPLIBRE_PMTILES.md` — basic wiring  
- `docs/PHOTOREAL_3D_PATH.md` — meshes are separate from PMTiles  
- `scripts/build_pmtiles_example.sh` — build template  

**Regulatory note:** Vector tiles are visualization. Flood limits for filings come from PE HEC-RAS / effective maps, not from tippecanoe output.
