# Posey County & Indiana mapping sources (operational)

Verified public endpoints for parcels, floodplain, LiDAR, and imagery.

## County

| Resource | URL / access | Use |
|---|---|---|
| **Think GIS parcel map** | https://poseyin.wthgis.com | Official Posey parcel polygons (informational, not survey) |
| Auditor tax list | http://auditor.poseycounty65.us | Parcel search by address / name / key |
| Engage property cards | https://engage.xsoftinc.com/posey | Assessed values, improvements, forms |
| Recorder | poseycountyin.gov → Recorder | Deeds / plats (Laredo/Tapestry) |
| Online permits | evolve-public.infovisionsoftware.com/posey | Building permits |
| Mount Vernon city | https://www.mountvernonin.gov/ | Municipal context (county seat) |

FIPS: **18129**. ~20k parcels (third-party counts).

## State / federal mapping

| Resource | Agency | Use |
|---|---|---|
| **INFIP** (Floodplain Information Portal) | IDNR Division of Water | Best Available floodplain + BFE points + **FARA** generator |
| Indiana Best Available Floodplain Layer | IDNR | Regulatory under IC 14-28-1 where drainage > 1 mi² |
| NFHL / FIRM | FEMA | Insurance zones; panel **18129C0215D** (Bonebank area) |
| IndianaMap / IGIO | State GIO | Statewide parcels harvest, ortho tile footprints, DEM services |
| Indiana 2016–2020 DEM | IGIO / 3DEP | QL2 hydro-flattened bare-earth (≤10 cm vertical class) |
| OpenTopography / ISDP | Multi | Legacy statewide LiDAR (2011–2013 west includes Posey) |
| USGS 3DEP | USGS | National elevation program |
| NGS NCAT | NGS | Vertical datum transforms |

INFIP primary: https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/indiana-floodplain-information-portal/

## Imagery / elevation pipeline for PTDT

1. County/state **ortho COGs** (IGIO tile footprints → download COG)  
2. **QL2 DEM** → Horn slope + terrain mesh (MapLibre terrain / Unity heightmap)  
3. Site **5 cm LiDAR** (project seal) overrides statewide DEM at structure footprint for LAG  
4. Sealed NAVD88 LAG/BFE remain authoritative over any FIM or BAFL presentation layer  

## Related

- `docs/ptdt-v33/INDIANA_GIS_INTEGRATION.md`
- `docs/ptdt-v33/TRI_STATE_AGENCY_DATA_VERIFICATION.md`
