# Wiring gap closure — BAFL, FIM, RAS, MODFLOW, MapLibre

## 1. BAFL Posey County (manual download)

| Item | Value |
|---|---|
| Portal | https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/the-indiana-best-available-floodplain-mapping/ |
| Products | `FloodHazard_BestAvai_DNR_Water` + `Flood_Elevation_Pts_DNR_Water` by county |
| CRS | UTM 16N, NAD83 meters |
| Local path | `data/geo/bafl_posey/` (create; git-ignore large shp if needed) |
| Insurance | **BAFL ≠ NFHL** for flood insurance determinations |

Also: INFIP https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/indiana-floodplain-information-portal/ for FARA.

## 2. USGS FIM New Harmony grids (presentation only)

| Item | Value |
|---|---|
| Report | SIR 2016-5119 |
| Downloads | https://pubs.usgs.gov/sir/2016/5119/ → `depth_grids.zip`, `shapefile.zip` |
| Gage | 03378500 |
| Local path | `data/flood_xs/usgs_fim_new_harmony/` |
| Role | **Presentation** stage-indexed depths — not site No-Rise geometry |

## 3. bonebank_buildings.geojson

- Present at `data/geo/bonebank_buildings.geojson` and `frontend/public/geo/` (~1.7 KB).  
- Contains at least residence feature (`BONEBANK-RES-001`).  
- **Action:** expand with surveyed footprints / OSM-Microsoft merge; keep CRS84 for web, project to EPSG:2966 server-side for analysis.

## 4. Headless HEC-RAS (`rascmd`)

| Item | Notes |
|---|---|
| Binary | Licensed HEC-RAS install; `rascmd` on PATH |
| Invoke | `rascmd <project> -compute -silent` |
| PTDT | `backend/hecras_coupler.py` — soft-fail if missing |
| CI | Skip RAS compute if `RASCMD` unset; never fake DSS |

## 5. MODFLOW fail-closed STALE

Rule: if MODFLOW6 executable missing, non-convergent, or exchange envelope invalid → return **`status=STALE`**, keep last good heads, **do not** overwrite Evidence Graph hydro nodes.

Implement in runner:

```python
class ModflowResult:
    status: str  # "OK" | "STALE" | "FAILED"
    heads: list | None
    message: str

def run_modflow6(...) -> ModflowResult:
    if not shutil.which("mf6"):
        return ModflowResult("STALE", None, "mf6 not on PATH")
    # ... execute; on non-zero or parse failure → STALE
```

## 6. MapLibreDeckHybrid + plate SHA-256 HUD

| Check | Status |
|---|---|
| Component | `frontend/src/viz/MapLibreDeckHybrid.tsx` |
| Tile cache | `setMaxTileCacheSize` |
| Zoom culling | hillshade / extrusion minzoom |
| Frame budget | `map.on('render')` + `performance.now()` |
| Buildings URL | `/geo/bonebank_buildings.geojson` |
| Wire into App | Replace canvas simulator with `<MapLibreDeckHybrid ... />` |
| Plate seal | `build_cinematic_plates()` → surface `composition_stack.json` SHA-256 on HUD |

## BCR discrepancy (summary)

| Label | Value | Use |
|---|---|---|
| Engineering export | **1.41** | Historical package constant |
| Legal Bonding PDF | **2.45** | Narrative / alternate assumption |
| **Sealed** | **FEMA BCA Toolkit output only** | LOMA/BRIC submission |

HUD / API: `BCR_STATUS=UNVERIFIED_DUAL` until PE Toolkit run is ingested.

## Related

- `docs/ptdt-v33/HEC_RAS_CALIBRATION.md`
- `docs/ptdt-v33/USACE_SECTION_204.md`
- `docs/ptdt-v33/GRANT_STACK_AND_BRIC.md`
