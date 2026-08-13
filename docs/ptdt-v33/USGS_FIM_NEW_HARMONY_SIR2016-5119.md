# USGS Flood Inundation Mapping — Wabash at New Harmony (SIR 2016-5119)

**Authority:** presentation / emergency planning — **not** parcel LOMA BFE or sealed Material Truth.

## Product

| Item | Value |
|---|---|
| Report | USGS Scientific Investigations Report **2016-5119** (Fowler, 2016) |
| DOI | 10.3133/sir20165119 |
| Gage | **03378500** Wabash River at New Harmony, IN (NWS **NHRI3**) |
| Reach | **3.68 mi** (1.77 mi upstream + 1.91 mi downstream of SR 66 bridge) |
| Profiles | **17** stages, ~1 ft intervals |
| Stage range (gage datum) | **10.0 ft** (near bankfull) → **25.4 ft** (top of rating used) |
| NAVD88 elevation range | **362.67 – 378.09 ft** NAVD88 |
| Model | 1-D step-backwater (HEC-RAS class) |
| Calibration | Stage–discharge at 03378500 + **27–28 Apr 2013** high-water marks |
| DEM | LiDAR; **0.98 ft** vertical accuracy, **4.9 ft** horizontal resolution |
| Cooperators | USGS + Indiana Office of Community and Rural Affairs (OCRA) |

Access: [USGS Flood Inundation Mapper](https://www.usgs.gov/tools/flood-inundation-mapper) · AHPS hydrograph for NHRI3.

Related upstream product: Wabash near I-64 / Grayville (uses 03377500 Mt. Carmel + 03378500).

## AHPS flood categories (03378500 / NHRI3)

| Category | Stage (ft, gage) |
|---|---|
| Action | 10 |
| Minor | 15 |
| Moderate | 20 |
| Major | 23 |
| Record | **27.7** (31 Mar 1913) |

Historic crests (AHPS): 27.7 (1913), 24.4 (1937), 23.84 (1943), 23.67 (2011), 23.4 (1950).

**Gage zero (AHPS table):** 353.07 ft NGVD29-class reference in public tables — always convert via NGS NCAT / published NAVD88 offsets before comparing to site BFE **375.0** NAVD88.

## PTDT integration

```
Live stage 03378500 → WSEL_navd88 (datum bridge)
                    → optional FIM polygon @ nearest library stage (presentation)
                    → HUD: source=USGS_FIM_SIR2016-5119, authority=presentation
```

Never overwrite sealed LAG/BFE or Tucker Myers property triggers.

## Related

- `docs/ptdt-v33/USGS_FLOOD_INUNDATION_MAPPING.md`
- `docs/ptdt-v33/TRI_STATE_AGENCY_DATA_VERIFICATION.md`
- `data/property_flood_triggers.json`
