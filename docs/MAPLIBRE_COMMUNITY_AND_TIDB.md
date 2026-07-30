# MapLibre community activity & TiDB (OSS Insight context)

## MapLibre

- Org: [maplibre.org](https://maplibre.org/) / [github.com/maplibre](https://github.com/maplibre)  
- GL JS: vector maps, fill-extrusion, custom WebGL layers, optional terrain  
- No Mapbox token required for the library itself  
- Terrain demos often use free DEM hosts (e.g. Mapterhorn tilejson) or self-hosted Terrarium  

Track stars/PRs/issues via [OSS Insight](https://ossinsight.io/) Data Explorer or GitHub directly — useful to pick maintained versions for `package.json` / unpkg pins.

## TiDB Cloud warehouse (OSS Insight backend)

OSS Insight stores GH Archive-scale events in **TiDB** (PingCAP). That is **their** analytics warehouse, not a dependency of PTDT.

| Use TiDB? | When |
|-----------|------|
| No (default) | PTDT / Archimedes: FastAPI, optional Postgres/PostGIS later, SQLite for local drafts |
| Optional | Only if you deliberately build a multi-tenant event analytics product |

Do **not** add TiDB to Archimedes Docker or CI unless product scope expands.

## Recommended stack for this project

MapLibre GL + OSM or OpenFreeMap-style + PMTiles + optional PostGIS — all free OSS, no OSS Insight/TiDB required for flood screening.
