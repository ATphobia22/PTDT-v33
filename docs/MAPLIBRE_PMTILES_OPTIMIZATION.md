# MapLibre PMTiles optimization techniques

## Archive size

| Technique | Benefit |
|-----------|---------|
| tippecanoe `--drop-densest-as-needed` / layer filters | Smaller archives |
| Limit max zoom to what the UI uses (e.g. z14–z16 for site) | Less data |
| Separate basemap (remote free tiles) from **site** PMTiles | Cache basemap; only ship project vectors |
| gzip/brotli at rest if host supports | Faster transfers |

## Runtime

| Technique | Benefit |
|-----------|---------|
| `pmtiles` protocol + HTTP **Range** | Fetch only needed tile bytes |
| CDN / object storage with CORS | Parallel range reads |
| Avoid huge single-layer planet files for one parcel | Latency |
| `maxzoom` / `minzoom` on MapLibre sources | Skip unnecessary requests |
| Prefer vector over dense raster for footprints/paths | Style client-side |

## Build pipeline (free OSS)

1. GeoJSON → **tippecanoe** or **Planetiler**  
2. Package **PMTiles** (go-pmtiles / tippecanoe)  
3. Optional **Martin** or static host  
4. MapLibre `pmtiles://` source in `MapComponent`

See also `docs/MAPLIBRE_PMTILES.md`.
