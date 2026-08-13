# Owned-repo scan (ATphobia22) — accuracy / performance / size / reliability

## Public digital-twin family (active)

| Repo | Relevance to PTDT-v33 |
|---|---|
| **PTDT-v33** | Sovereign core — this system |
| **PTDT-TriState-Unified-v33** | Unified TS/PostGIS/MapLibre shaders — merge candidates for viz performance |
| **Tri-County-River-Valley-Digital-Twin** | WebGPU / Three / PDAL / COG patterns |
| **Tri-State-River-Valley-Engineering-System** | Archimedes engine, Electron, proto, docker — larger product shell |
| **Point-Township-Digital-Twin** | Earlier prototype (`v21-bleeding-edge`) — mine for scripts only |

## Code search results

| Query | Result |
|---|---|
| `bonebank` / buildings.geojson across user | **No extra FeatureCollections** outside PTDT-v33 |
| `modflow` / `mf6` / FloPy across user | **No hits** — MODFLOW6 runner remains local stub |
| Buildings in sibling twins | Empty / no searchable geojson upgrades |

**Conclusion:** Expand buildings from **survey / OSM-Microsoft-Overture** externally; do not expect a richer bonebank FC in other owned repos today.

## External tools still useful (not owned)

| Tool | Fit |
|---|---|
| Esri **OptimizeRasters** | COG / tiled TIFF / cloud proxies — size + read performance for DEM/ortho |
| OSM / Overture building footprints | Footprint expansion for `bonebank_buildings.geojson` |
| FloPy + `mf6` binary | Real MODFLOW6 (replace STALE placeholder) |

## Reliability posture retained

- RAS: soft-fail `SKIPPED` if `rascmd` missing (`backend/services/hecras_rascmd.py`)  
- MODFLOW: `STALE` keep-last-heads (`backend/services/modflow6_runner.py`)  
- FIM / BAFL: presentation + state planning; not sealed No-Rise  

## Related

- `docs/ptdt-v33/WIRING_GAP_CLOSURE.md`
- `scripts/fetch_bafl_fim_urls.md`
