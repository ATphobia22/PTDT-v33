# Indiana DNR flood zones — BAFL, floodway, INFIP

## Dual layer (do not conflate)

| Layer | Agency | Use |
|---|---|---|
| **NFHL / FIRM** | FEMA | NFIP insurance, LOMC |
| **Best Available Floodplain Layer (BAFL)** | IDNR Division of Water | Local permitting, planning, **IC 14-28-1** floodway jurisdiction where adopted |

BAFL adds ~**18k–19k** stream miles of Zone-A-quality studies (BFE + floodway) beyond detailed FEMA AE. **Cannot** be used alone for flood-insurance rating.

## Jurisdiction triggers

| Condition | Action |
|---|---|
| Upstream drainage **> 1 mi² (640 ac)** | Full IDNR floodway review under Flood Control Act |
| Unmapped / Zone A / known flood-prone | **FARA** via INFIP |
| Construction in mapped floodway | IDNR Construction in a Floodway permit path |

Approximate BAFL floodways are acceptable for **general** IC 14-28-1 jurisdiction screening; use caution — not FIRM-publishable detail.

## Download / services

| Product | Access |
|---|---|
| BAFL by county (shp, UTM 16N NAD83) | https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/the-indiana-best-available-floodplain-mapping/ |
| Flood elevation points (BFE, NAVD88) | Same page (`Flood_Elevation_Pts_DNR_Water`) |
| INFIP map + **FARA** generator | IDNR INFIP portal |
| REST | `gisdata.in.gov` Best Available Flood Hazard Layer MapServer |

Posey County: download **FloodHazard_BestAvai_DNR_Water** + elevation points; load beside NFHL panel **18129C0215D**.

## PTDT authority rule

```
BAFL / FARA BFE  →  regulatory screening + package exhibits
Sealed LiDAR LAG →  LOMA Material Truth (375.0 / 377.2)
USGS FIM         →  scenario plates only
```

## Related

- `docs/ptdt-v33/POSEY_INDIANA_MAPPING_SOURCES.md`
- `docs/ptdt-v33/TRI_STATE_AGENCY_DATA_VERIFICATION.md`
- IC 14-28-1 · 312 IAC 10
