# Regulatory Status — Tri-State Family Engineering System
**Property:** 13101 Bonebank Road, Mount Vernon, IN 47620  
**System:** PTDT v32 / Archimedes Sovereign Engine

This document stabilizes technical claims against federal and state requirements so forensic data is legally defensible.

---

## Verification Results & Regulatory Alignment

| Claim | Status | Authority |
|-------|--------|-----------|
| USGS **03378500** = Wabash River at New Harmony, IN | **Verified** | USGS NWIS |
| LOMA requires LAG ≥ BFE on natural ground | **Verified** | 44 CFR Part 70; FEMA LOMA guidance |
| Project baseline LAG **377.2 ft** / BFE **375.0 ft** (+2.2 ft) | **Project baseline** — PE/surveyor must field-confirm | Archimedes locked values |
| All elevations in **NAVD88** | **Required** | MT-1 Technical Guidance; FIS practice |
| PE seal under **IC 25-31-1** | **Verified** | Indiana Code |
| Single lot → **MT-EZ** or **Online LOMC** | **Verified** | FEMA forms |

### Corrected / refined claims
- **USGS gauge** = regional hydrologic calibration only; **does not** prove site LAG.
- **5 cm LiDAR** = “better data” exceeding typical ~1 m Risk MAP grids; **not** a FEMA mandate. Certified elevations are the mandate.
- **NGVD29 conversion** = use local FIS / NGS NCAT at site coordinates — **not** a fixed “~3 ft” statewide factor.

---

## Correct Evidence Chain

1. **Site survey / certified LiDAR** → establish LAG **377.2 ft NAVD88** (PE or Licensed Surveyor).
2. **BFE determination** → **375.0 ft** from effective FIS or INFIP **FARA** (same datum).
3. **Hydrodynamic context** → optional calibration against USGS **03378500** via Archimedes.
4. **Certification** → Indiana PE seal on transmittal + elevation form (IC 25-31-1).
5. **Submission** → FEMA **Online LOMC** or MT-EZ package.

Generate supporting artifacts:
```bash
pip install -r requirements.txt
python archimedes_engine.py
```

---

## FEMA Processing Timeline (Official)

| Milestone | Typical window |
|-----------|----------------|
| Completeness notice | Within **30 days** of receipt |
| LOMA / MT-1 determination | Within **60 days** of complete data |
| Upper-bound / Online LOMC FAQ language | Up to **90 days** in some cases |
| eLOMA (licensed professionals only) | Often minutes if criteria met |

Source: FEMA LOMA page; Online LOMC FAQ.

---

## Repository Artifacts

| Path | Role |
|------|------|
| `docs/LAG_Verification_Protocol.md` | Full forensic protocol |
| `docs/LOMA_PACKAGE_CHECKLIST.md` | Submission checklist |
| `docs/IDNR_Floodway_and_FARA_Checklist.md` | IDNR / FARA path |
| `docs/Indiana_Floodplain_Mapping_Standards.md` | BAFL / INFIP |
| `docs/Grant_and_Data_Requirements.md` | BRIC / BCA |
| `archimedes_engine.py` | Live package generator + API |
| `05_final_portal_package/` | PE letters, BCA JSON/CSV, SHA-256 manifest |

---

## Status

**Deployment-ready for PE sealing and Online LOMC filing** once:
- [ ] PE/surveyor confirms site LAG on natural grade
- [ ] Real PE name/license applied to PDFs
- [ ] Current FARA attached
- [ ] Datum confirmed NAVD88 throughout
