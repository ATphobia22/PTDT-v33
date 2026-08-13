# HEC-RAS 2D Calibration Regions

**Purpose:** Override land-cover Manning **n** (or ratio n) inside polygons **without** rewriting the base land-cover layer. Geometry-specific; different plans can use different region sets.

## How they work

| Rule | Detail |
|---|---|
| Prerequisite | Geometry already has a **Manning’s n** layer (land cover or default) |
| Override | Region values **replace** land-cover n inside the polygon |
| Scope | Apply to **one geometry** only — base layer unchanged |
| Priority | Overlapping regions: **last in draw order = highest priority** (RAS Mapper attribute table → Change Order) |
| Mesh faces | n sampled at face centroid (default) or spatially varied composite |

## Create (RAS Mapper)

1. Expand **Geometry → Manning’s n → Calibration Regions**
2. **Edit Geometry** → draw polygon(s)
3. **Edit Manning’s n Values** → set n per land-cover class (or absolute override table)
4. Optionally set **Flow Roughness Factors** (RAS ≥ 6.6): n multiplier vs **outflow** from the region polygon

## Strategy for confluence models

| Region class | Typical construction |
|---|---|
| Channel | Buffer stream centerlines; high priority |
| Floodplain | Hand-draw or inundation extent polygons |
| Upland / overland | HMS subbasins or contour-derived polygons |
| Structures | Tight polygons around bridges/levees if needed |

Cover the **entire contributing domain** to each calibration gage so one point is not controlled by unadjusted cells.

## Flow-roughness factor curves (2D)

- Curve is **factor vs flow** leaving the Calibration Region (not XS flow).
- Draw region so longitudinal outflow ≈ river discharge; extend past wet/dry boundary laterally to reduce transverse leakage artifacts.

## PTDT practice

- Start land-cover n from NLCD / field notes; seed floodplain **0.045**
- Calibrate with regions to **03378500** rating + 2013 HWMs (SIR 2016-5119)
- Monte Carlo n ± band only **after** region geometry is stable
- Seal plan + region GeoJSON in evidence package (SHA-256)

## Related

- `docs/ptdt-v33/HEC_RAS_CALIBRATION.md`
- USACE RAS Mapper / 2D user manuals
