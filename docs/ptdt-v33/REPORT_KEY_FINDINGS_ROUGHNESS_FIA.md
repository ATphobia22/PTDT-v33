# Key findings summary — refined (roughness automation · BCA · FIA)

**Date:** 2026-08-13  
**System:** PTDT-v33 · 13101 Bonebank Road, Point Township, IN  
**Use:** Engineering appendix / grant package

---

## A. Roughness calibration (automated + native)

| Item | Finding |
|---|---|
| Dominant parameter | Manning **n** |
| Native RAS | Unsteady **Automated Roughness Calibration** (Global / Sequential) adjusts **flow–roughness factors** to observed stages |
| 2D | **Calibration Regions** + optional outflow-based factors (RAS ≥ 6.6) |
| PTDT code | `hecras_roughness_calibration.py` orchestrates plan export, soft-fail compute, RMSE scoring, factor suggestions |
| Seed | Floodplain **n = 0.045** (0.030–0.050 sensitivity) |
| Anchor gage | **03378500** (+ 2013 HWMs); Myers stages ops-only |

**Rule:** Uncalibrated n excluded from sealed No-Rise exhibits.

---

## B. FEMA BCA Toolkit — flood benefits

| Item | Finding |
|---|---|
| Sealed BCR source | **Toolkit output only** (BCR ≥ 1.0 = cost-effective) |
| Paths | Full BCA or streamlined (< $1M / waiver / pre-calculated benefits) |
| Flood benefits | Avoided structure/content (DDF×values), displacement, other Toolkit categories over project life |
| Site elevations | BFE **375.0** · LAG **377.2** · FFE **382.5** NAVD88 · **+2.2 ft** clearance |
| Dual constants | Eng **1.41** / Legal PDF **2.45** → `UNVERIFIED_DUAL` until Toolkit SHA sealed |

**Rule:** HEC-FIA damages ≠ BCA Toolkit BCR.

---

## C. HEC-FIA (manuals searched)

| Manual | URL |
|---|---|
| Purpose (v3.4) | https://www.hec.usace.army.mil/confluence/fiadocs/fiaum/v3.4/introduction/purpose |
| Tech Ref | https://www.hec.usace.army.mil/confluence/fiadocs/fiatechref/latest |

**Direct damage:** $D_i = d_i(\mathrm{depth},\mathrm{occupancy}) \times v_i$; depth ≈ max depth − foundation height; depth×velocity threshold can force 100% loss.

**Estimates:** structure/content/car, ag, life loss, indirect, critical infrastructure, flood damages reduced.

**Role in PTDT:** single-event consequence narrative — not LOMA, not sealed BCR.

---

## D. Cross-cut Material Truth

| Quantity | Value |
|---|---|
| Datum | NAVD88 |
| LOMA | Pure natural high ground |
| FIM | Presentation only |
| Storage | 1.20× compensatory |
| §204 | Navigation nexus; in-kind unbooked |

---

## E. Next actions

1. Licensed RAS + `RASCMD` → real automated roughness runs  
2. PE FEMA BCA Toolkit → seal BCR  
3. Optional HEC-FIA 3.4 on sealed depth grids + structure inventory  
4. BAFL Posey + FIM grids into `data/`  

---

## Doc index

- `HEC_RAS_ROUGHNESS_AUTOMATION.md`
- `FEMA_BCA_TOOLKIT_FLOOD_BENEFITS.md`
- `HEC_FIA_MANUALS_INDEX.md`
- `HEC_RAS_ROUGHNESS_CALIBRATION.md`
- `BCR_SOURCE_CONFLICT.md`
