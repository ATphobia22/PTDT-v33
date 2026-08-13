# Key findings summary — roughness calibration & HEC-FIA (report)

**Date:** 2026-08-13  
**System:** PTDT-v33 / Point Township (13101 Bonebank Rd)  
**Audience:** Engineering + grant package appendix

---

## 1. HEC-RAS roughness calibration

### Finding
Manning **n** is the dominant adjustable hydraulic parameter; calibrated n from observed stages outperforms table-only estimates for regulatory work.

### Practice locked for PTDT
1. Geometry before n  
2. Channel n at bankfull, then overbank on large events  
3. Downstream → upstream progression  
4. Unsteady refinement with optional **flow–roughness factors**  
5. 2D: land-cover base + **Calibration Regions** (+ region outflow factors in RAS ≥ 6.6)  
6. Built-in **Automated Roughness Calibration** available for unsteady 1D (Global / Sequential) when observed stage series exist  

### Site anchors
- Seed floodplain **n = 0.045** (document 0.030–0.050 sensitivity)  
- Calibrate toward USGS **03378500** rating + 2013 HWMs (SIR 2016-5119 ranges)  
- Myers **03322420** stages remain **ops only** (not NAVD88 BFE)  

### Authority
Uncalibrated n must not enter sealed No-Rise / LOMA hydro exhibits. Headless `rascmd` soft-fails **SKIPPED** if licensed RAS is absent.

---

## 2. USGS / USACE HEC-FIA tools

### Finding
**HEC-FIA** is USACE HEC’s **Flood Impact Analysis** tool for **single-event consequences** (structure/content/car, agriculture, simplified life loss, critical infrastructure, flood damages reduced). Current public line **3.4.x**.

### Inputs
HEC-RAS (or other) depth/arrival/duration grids and/or DSS hydrographs + structure/ag inventories (NSI-capable).

### Explicit non-roles
- Not a 2D/1D hydraulic engine  
- Not a replacement for **FEMA BCA Toolkit** sealed BCR  
- Not LOMA elevation evidence  

### PTDT use
Optional consequence layer on sealed RAS scenarios for grant narrative and emergency/impact reporting; keep **BCR_STATUS** dual until PE Toolkit seals 1.41 vs 2.45 conflict.

---

## 3. Cross-cutting PTDT facts (for report body)

| Item | Value |
|---|---|
| BFE / LAG / FFE | 375.0 / 377.2 / 382.5 ft **NAVD88** |
| LOMA path | Pure natural high ground (**+2.2 ft**) |
| FIM grids | **Presentation only** (SIR 2016-5119) |
| BCR | Eng **1.41** vs Legal PDF **2.45** → Toolkit seals |
| §204 | CAP beneficial use — navigation nexus required; in-kind unbooked |
| Compensatory storage | **1.20×** cut ≥ fill |

---

## 4. Recommended next technical steps

1. Install licensed HEC-RAS; wire `RASCMD` for real plan compute  
2. Build 2D Calibration Regions over Bonebank / confluence domain  
3. Download BAFL Posey + FIM depth grids to `data/geo/bafl_posey/` and `data/flood_xs/usgs_fim_new_harmony/`  
4. Optional: stand up HEC-FIA 3.4 with NSI + RAS depth grid for scenario damages  
5. Run FEMA BCA Toolkit under PE for sealed BCR  

---

## References (primary)

- HEC-RAS User’s Manual — Automated Calibration of Manning’s n (unsteady)  
- HEC-RAS 2D — Flow Roughness Factor Curves in Calibration Regions  
- HEC-FIA User’s Manual / Features — https://www.hec.usace.army.mil/software/hec-fia/  
- USGS SIR 2016-5119 New Harmony FIM  

Internal: `HEC_RAS_CALIBRATION.md`, `HEC_RAS_2D_CALIBRATION_REGIONS.md`, `HEC_FIA_SCOPE.md`, `BCR_SOURCE_CONFLICT.md`
