# USGS Flood Inundation Mapping (FIM) methodology

## Standard pipeline (USGS SIRs)

1. **Hydraulic model** — HEC-RAS 1-D step-backwater and/or 2-D; sometimes SRH-2D  
2. **Calibrate** to stage–discharge at the reference gage + high-water marks  
3. **Profiles** — water-surface elevations at fixed stage steps (often 1 ft) from action/bankfull through extreme recorded stage  
4. **Intersect** profiles with DEM (LiDAR-derived) in RAS Mapper / GIS  
5. **Export** inundation **polygons** + **depth grids** per stage  
6. Publish mapper + download package (grids are **stage-indexed**, presentation-oriented)

## New Harmony package (SIR 2016-5119)

| Item | Value |
|---|---|
| Reach | 3.68 mi on Wabash about gage **03378500** |
| Engine | 1-D step-backwater (report) |
| DEM | LiDAR ~0.98 ft vertical / 4.9 ft horizontal class |
| Calibration | Rating + Apr 2013 HWMs |
| Products | `depth_grids.zip`, `shapefile.zip` |
| Download | https://pubs.usgs.gov/sir/2016/5119/ |

## Authority boundary (PTDT)

| Product | Use |
|---|---|
| FIM depth grids | **Presentation** / situational awareness only |
| Site No-Rise / LOMA | **Sealed site HEC-RAS** + surveyed elevations — **not** FIM grids |
| Datum | Confirm NAVD88 vs gage datum before any numeric compare |

## Related

- `docs/ptdt-v33/USGS_FIM_NEW_HARMONY_SIR2016-5119.md`
- `docs/ptdt-v33/USGS_HEC_RAS_MODEL_INVENTORY.md`
