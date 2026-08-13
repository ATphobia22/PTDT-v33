# USGS HEC-RAS / FIM model inventory — Wabash near New Harmony

**Daubert constraint:** Hydrodynamics authority = USACE **HEC-RAS** (or TUFLOW). Custom solvers banned for sealed state.

## SIR 2016-5119 (New Harmony FIM)

| Item | Value |
|---|---|
| Report | USGS SIR **2016-5119** (Fowler) |
| Software | **HEC-RAS 4.1.0** (USACE 2010) — **1-D steady** step-backwater |
| Geometry aid | **HEC-GeoRAS** |
| Gage | **03378500** |
| Stages | 10.0–25.4 ft (gage) → ~**362.67–378.09 ft NAVD88** |
| n-values (report) | Channel **0.023–0.044**; overbank **0.048–0.144** |
| Calibration | Rating + **27–28 Apr 2013** HWMs |
| Public data package | `depth_grids.zip` + `shapefile.zip` (`wabnewhIN.shp`) from pubs.usgs.gov/sir/2016/5119/downloads/ |

**Important:** FIM publications typically release **inundation polygons / depth grids**, not always the full editable `.prj` / geometry project tree. Treat published grids as **presentation library**. For regulatory No-Rise, run **current HEC-RAS** (6.x/7.x) on sealed site geometry with PE oversight.

Gage datum note (NWIS): ~**352.71 ft NAVD88** published for 03378500 — always reconcile stage→NAVD88 before comparing to site BFE **375.0**.

## Related reach (upstream)

| Report | Model | Notes |
|---|---|---|
| SIR **2017-5140** (Boldt) | **SRH-2D** (not HEC-RAS) | ~30 mi near I-64 / Grayville; calibrated to **03377500** + **03378500** |

## PTDT integration (fail-closed)

```
USGS FIM grids / BAFL  →  presentation only
HEC-RAS project (site) →  sealed RAS extent + No-Rise runs
Archimedes              →  regulatory gates (BFE, 1.20× storage) — not a 2-D solver
MODFLOW6 runner         →  fail-closed; STALE on failure; never overwrites RAS
```

Exchange envelope fields (from design docs): datum, units, timestamp, CRS, source model, run ID, quality, provenance, uncertainty.

## Related

- `docs/ptdt-v33/USGS_FIM_NEW_HARMONY_SIR2016-5119.md`
- `docs/ptdt-v33/DAUBERT_AND_SOLVER_AUTHORITY.md`
- HEC-RAS software: https://www.hec.usace.army.mil/software/hec-ras/download.aspx
