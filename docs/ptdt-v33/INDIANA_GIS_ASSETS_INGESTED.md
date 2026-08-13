# Indiana GIS assets ingested (Posey / flood XS / imagery)

## Sealed data files

| File | Path | Notes |
|---|---|---|
| IDNR effective flood XS | `data/flood_xs/FLOOD_XS_EFFECTIVE_DNR.csv` | **908** rows · **all NAVD88** · DFIRM **18129C** |
| USGS 24K quads | `data/geo/24K_USGS_Quadrangle_Boundaries.csv` | Mount Carmel, New Harmony, Mount Vernon, Caborn, … |
| Ohio River XS summary | `data/flood_xs/ohio_river_xs_navd88_summary.json` | 58 Ohio XS subset for context |

## Flood XS summary (Posey panel 18129C)

| Metric | Value |
|---|---|
| Datum | **NAVD88** (100%) |
| Top streams by count | Big Creek, McFadden Creek, Unnamed trib Big Creek, Indian Creek, Fun Creek |
| Ohio River XS | 58 rows (mix IDNR_ZONEA + NFHL lettered) |
| Example NFHL lettered | Ohio River **K** · `wsel_reg` **372.2** ft NAVD88 |
| WSEL in 370–380 ft band | **407** cross-sections |

**Authority:** These XS support **context / BAFL-adjacent planning**. Site **BFE 375.0** for Bonebank remains the LOMA regulatory anchor from Material Truth package — do not overwrite BFE with a single XS WSEL without PE hydraulic study.

## Imagery / elevation REST (Indiana)

| Service root | https://di-ingov.img.arcgis.com/arcgis/rest/services/DynamicWebMercator |
|---|---|
| Example elevation | `…/Indiana_2016_2020_Elevation/ImageServer` |
| Use in ArcGIS | Add Data from Path / New ArcGIS Server |
| Use in PTDT | Prefer **local COG** DEM; REST as discovery / fallback only |

## INDOTWISE / MicroStation (reference)

INDOTWISE 5.1 documents ProjectWise managed workspace, WMS/Map Insert, Geospatial Context WFS, plans production. Relevant for **agency plan submittals**, not runtime twin authority.

## Wabash River Heritage Corridor (2004)

Corridor commission plan emphasizes natural/cultural/recreational conservation along the Wabash — useful **heritage narrative** for grants/EHP; not a hydraulic model.

## Related

- `docs/ptdt-v33/INDIANA_GIS_INTEGRATION.md`
- `scripts/fetch_bafl_fim_urls.md`
