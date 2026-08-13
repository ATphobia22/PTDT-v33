# Key findings summary — refined (calibration heuristics · BCA streamlined · GIS)

**Date:** 2026-08-13  
**System:** PTDT-v33 · 13101 Bonebank Road, Point Township, Posey County, IN  

---

## 1. HEC-RAS automated calibration heuristics

| Layer | Finding |
|---|---|
| Native | Global / Sequential optimization of **flow–roughness factors** vs observed stages |
| External | `factor' = factor \u00d7 (1 + gain\u00b7tanh(\u0394peak))`, clamp [0.5, 2.0]; **re-run RAS** after each update |
| Gate | RMSE \u2264 **0.25 ft** \u2192 OK |
| Seed | Channel 0.035 / overbank **0.045**; zones 5k\u201380k cfs |
| Soft-fail | Missing `rascmd` \u2192 SKIPPED |

Code: `backend/services/hecras_roughness_calibration.py`

---

## 2. FEMA BCA streamlined paths

| Path | Use |
|---|---|
| Full Toolkit | Preferred for BRIC structure/hydraulic story |
| Cost < **$1M** | Streamlined documentation may apply |
| Substantial damage acquisition | Waiver path when eligible |
| Pre-calculated benefits | Only for FEMA-listed project types |

**BCR \u2265 1.0** required. Sealed BCR = Toolkit or accepted streamlined artifact + SHA-256. Dual **1.41 / 2.45** until sealed.

---

## 3. GIS / flood XS accuracy (files searched)

| Asset | Finding |
|---|---|
| `FLOOD_XS_EFFECTIVE_DNR.csv` | **908** XS, **NAVD88**, panel **18129C** |
| Ohio River | 58 XS; NFHL lettered example **K @ 372.2 ft** |
| Site BFE | Still **375.0** Material Truth (not replaced by single XS) |
| USGS 24K | Mount Carmel / New Harmony / Mount Vernon / Caborn quads indexed |
| Indiana elevation REST | `di-ingov.img.arcgis.com` \u2026 `Indiana_2016_2020_Elevation` |
| INDOTWISE 5.1 | CAD/WMS/WFS for plan production |
| WRHCC 2004 | Heritage corridor policy narrative |

---

## 4. Material Truth (unchanged)

| Quantity | Value |
|---|---|
| BFE / LAG / FFE | **375.0 / 377.2 / 382.5** ft NAVD88 |
| LOMA clearance | **+2.2 ft** |
| FIM | Presentation only |
| Storage | **1.20\u00d7** |
| \u00a7204 | Navigation nexus; in-kind unbooked |

---

## 5. Next actions

1. RAS licensed + native auto-cal on 03378500 stages  
2. PE BCA Toolkit (or documented streamlined eligibility)  
3. Keep flood XS as context; site No-Rise from sealed RAS  
4. Local COG DEM over REST for runtime hillshade  

---

## Doc index

- `HEC_RAS_CALIBRATION_HEURISTICS.md`  
- `FEMA_BCA_STREAMLINED_PATHS.md`  
- `INDIANA_GIS_ASSETS_INGESTED.md`  
- `FEMA_BCA_TOOLKIT_FLOOD_BENEFITS.md`  
- `HEC_RAS_ROUGHNESS_AUTOMATION.md`  
