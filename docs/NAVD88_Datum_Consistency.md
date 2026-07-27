# NAVD 88 Datum Consistency Architecture

**Open-source compliance standard for PTDT v32**

## Why it matters
Mixing **NGVD 29** and **NAVD 88** (or unlabeled “MSL”) is a common cause of FEMA technical rejection. Local conversion factors vary; do **not** use a generic “~3 ft” statewide offset. Use the community **FIS** conversion or **NGS NCAT** at the site coordinates.

## Hard checks (code)

```bash
python navd88_hard_check.py
```

`navd88_hard_check.py` (stdlib only):
- Allows only **NAVD88**
- Blocks **NGVD29** and ambiguous **MSL**
- Optionally verifies LAG ≥ BFE for pure LOMA path

Integrated into `archimedes_engine.py` before package emission.

## Artifact requirements
| Output | Datum field |
|--------|-------------|
| PE LOMA letter | Explicit “NAVD88” in body |
| IDNR No-Rise | Explicit “NAVD88” |
| BCA JSON / CSV | `vertical_datum: "NAVD88"` |
| Package manifest | `vertical_datum` + evidence chain |
| Spatial twin HUD | “EPSG:3857 / NAVD88” |

## Free software stack
| Role | Tool | License |
|------|------|---------|
| Package PDFs | ReportLab | BSD |
| API | FastAPI + Uvicorn | MIT / BSD |
| Map / twin | **MapLibre GL JS** | BSD |
| Basemap | OpenFreeMap / OSM | ODbL / free tiles |
| Datum check | Pure Python | — |
| Optional HEC-RAS HDF5 | h5py | BSD |

**No Cesium Ion account required.** Use `archimedes_console/tri_river_simulator_maplibre.html`.

## Project elevations (Bonebank Road)
| Metric | Value | Datum |
|--------|-------|-------|
| BFE | 375.0 ft | NAVD88 |
| LAG | 377.2 ft | NAVD88 |
| FFE | 382.5 ft | NAVD88 |
| Clearance | +2.2 ft | — |
