# Indiana GIO / 3DEP LiDAR data access

Public elevation data for Indiana is available through multiple official channels. Prefer these over private “5 cm certified” claims until a licensed survey seals site-specific products.

## Primary portals

| Resource | URL | Notes |
|----------|-----|--------|
| **IGIO Elevation Program** | https://elevation.gio.in.gov/ | Statewide elevation program; access/resources pages |
| **IndianaMap** | https://www.indianamap.org/ | Statewide GIS viewer and dataset search |
| **Purdue / iDiF LiDAR tiles** | https://lidar.digitalforestry.org/ | Countywide QL2 LiDAR + DEM tile downloads |
| **USGS The National Map Downloader** | https://apps.nationalmap.gov/downloader/ | Nationwide 3DEP lidar & DEM |
| **IU Indiana Spatial Data Portal** | https://gis.iu.edu/ (ISDP elevation pages) | County DEM mosaics (2016–2020 program) |

## What the statewide collection is

- Indiana’s **2016–2020** elevation program delivered **USGS 3DEP Quality Level 2 (QL2)** LiDAR for the state (some counties delayed for flood/weather).
- Products include point clouds, hydro-flattened bare-earth **DEMs**, and derived hillshades.
- Data are generally **public domain** for government-published 3DEP products (confirm license on the specific download page).

## Recommended workflow for this project

1. Locate **Posey County** tiles via Purdue countywide tiles or USGS TNM Downloader.
2. Pull DEM / LAS for the Bonebank AOI.
3. Transform / confirm vertical reference (**NAVD 88**) using survey control + [NGS NCAT](https://www.ngs.noaa.gov/NCAT/) if any legacy NGVD 29 points exist.
4. Site LAG/FFE for **LOMA** still require **survey-grade** PE-sealed elevations — statewide QL2 is excellent context and better-data support, not automatically an Elevation Certificate.

## Honesty note on “5 cm drone LiDAR”

Marketing claims of 5 cm DTM accuracy are only credible when backed by:

- Survey control network
- Published RMSE / accuracy report
- PE or licensed surveyor certification for the map product filed with FEMA/IDNR

Do not treat uncertified drone meshes as FIRM replacements.

## Optional local tooling

- **PDAL** for point-cloud pipelines (open source)
- **GDAL** for DEM mosaics / reprojection
- Repo GIS helpers remain **bbox / screening** utilities, not full LiDAR production
