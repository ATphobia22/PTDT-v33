# Agency data room index (13101 Bonebank Road)

Single index of materials to present federal and state reviewers.

## A. Mapping & elevation

| Item | Location |
|------|----------|
| Better data comparison brief | `05_better_data_agency_package/07_*.pdf` |
| Comparison CSV/JSON | `05_better_data_agency_package/01_*.json`, `02_*.csv` |
| NAVD 88 policy | `docs/NAVD88_DATUM.md` |
| LAG verification protocol | `docs/LAG_Verification_Protocol.md` |
| Indiana dual-layer (NFHL/BAFL/FARA) | `docs/INDIANA_FLOODPLAIN_STANDARDS.md` |

## B. Regulatory templates

| Item | Location |
|------|----------|
| PE LOMA transmittal template | `05_final_portal_package/01_PE_Transmittal_and_LOMA_Letter.pdf` |
| IDNR No-Rise template | `05_final_portal_package/03_IDNR_No_Rise_Certification.pdf` |
| Case study template | `05_final_portal_package/05_FEMA_LOMA_Forensic_Case_Study.pdf` |
| LOMA checklist | `docs/LOMA_PACKAGE_CHECKLIST.md` |
| IDNR checklist | `docs/IDNR_PERMIT_CHECKLIST.md` |

## C. Live / open data connectors

| Layer | Endpoint |
|-------|----------|
| USGS stage/discharge | `GET /api/usgs-telemetry` |
| FEMA NFHL zones | `GET /api/fema-flood-zones` |
| IDNR BAFL | `GET /api/dnr-floodplain` |
| NGS NCAT datum | `GET /api/transform-elevation` |
| OpenFEMA claims | `GET /api/openfema-claims` |
| NRCS soils | `GET /api/nrcs-soil` |

## D. Integrity

| Item | Location |
|------|----------|
| Better-data manifest | `05_better_data_agency_package/00_evidence_manifest.json` |
| Evidence JSON Schema | `schemas/evidence_manifest.schema.json` |
| Anti-fabrication policy | `docs/ANTI_FABRICATION.md` |

## E. How to regenerate

```bash
python python/better_data_package.py
python archimedes_engine.py   # optional LOMA/No-Rise PDF templates
```
