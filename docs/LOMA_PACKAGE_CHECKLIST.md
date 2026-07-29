# FEMA LOMA package checklist (real submission path)

**Property context:** 13101 Bonebank Road, Mount Vernon, IN 47620  
**Intended path:** Letter of Map Amendment (LOMA) — natural high ground via **FEMA Online LOMC** (not a homemade OAuth script).

Baseline constants in code (verify with PE/survey before filing):

- LAG = 377.2 ft MSL  
- BFE = 375.0 ft MSL  
- Datum = **NAVD 88**  
- Clearance = +2.2 ft  

## Phase 1 — Pre-submission verification

- [ ] **Natural ground:** No artificial fill elevating the structure footprint (pure LOMA vs LOMR-F)
- [ ] **Elevation delta:** LAG > BFE on the same vertical datum
- [ ] **Datum:** All points NAVD 88 (convert NGVD 29 via [NGS NCAT](https://www.ngs.noaa.gov/NCAT/) if needed)
- [ ] **FIRM panel / community:** Confirm current panel and community number on the effective FIRM (values in project notes must be re-checked on FEMA Map Service Center before filing)

## Phase 2 — Document assembly

| Item | Format | Notes |
|------|--------|--------|
| Deed / tax plat | PDF | Posey County Recorder / Assessor |
| Certified topographic / LiDAR work map | PDF | PE-sealed survey quality |
| PE transmittal & certification | PDF | Indiana PE (IC 25-31-1); `archimedes_engine` emits a **template** only |
| MT-EZ / Online LOMC fields | Web / PDF | Completed in FEMA Online LOMC wizard |
| Supporting hydrology context | PDF/CSV | USGS gage context (e.g. 03378500) is supporting, not a LOMA substitute |
| FARA (if Zone A / unmapped / drainage rules apply) | PDF | Generate via **INFIP**, download, archive |

Local generator output directory: `05_final_portal_package/` (templates + BCA JSON). **Does not** submit to FEMA.

## Phase 3 — Official portal steps

1. Open **FEMA Online LOMC** (current portal linked from fema.gov map amendment guidance).
2. Create application → **Letter of Map Amendment (LOMA)**.
3. Enter property address and community data from the **effective** FIRM.
4. Upload PE-sealed exhibits.
5. Submit for FEMA review (LOMA processing is typically fee-exempt when no fill is involved; timelines vary).

## Explicit non-goals (do not implement as “live federal API”)

- `https://fema.gov/oauth/token`
- `https://api.fema.gov/v1/regulatory/submissions`
- Scope `regulatory:submission:write`
- `submit_fema_package.sh` curl POST of tarballs as if it were official clearance

Those endpoints/scopes are **not** documented public FEMA GO / LOMC APIs. See `docs/ANTI_FABRICATION.md`.
