# IDNR Construction in a Floodway + FARA Checklist
**Property:** 13101 Bonebank Road, Mount Vernon, IN 47620  
**Standards:** IC 14-28-1 (Flood Control Act) | 312 IAC 10 | Indiana Floodplain Information Portal (INFIP)

## 1. Eligibility / Jurisdiction Check
- [ ] Confirm upstream drainage area ≥ 1 square mile (triggers IDNR floodway jurisdiction)
- [ ] Determine whether work is in FEMA floodway, DNR Best Available floodway (BAFL), or flood fringe
- [ ] Generate **Floodplain Analysis and Regulatory Assessment (FARA)** via INFIP for the exact site coordinates
- [ ] Download and archive the FARA PDF (IDNR does not retain a permanent copy)
- [ ] Compare FARA BFE against project LAG (377.2 ft NAVD88) and FEMA BFE (375.0 ft)

## 2. When a Construction in a Floodway Permit Is Required
Any of the following in the floodway:
- Fill, excavation, grading, bank stabilization
- Buildings, sheds, fences, bridges, private crossings
- Any obstruction that reduces conveyance or storage

**Exemptions / general licenses** may apply for certain minor activities – verify on the IDNR exemptions page before assuming a full permit is needed.

## 3. Application Package Requirements
- [ ] State Form 42946 (or online Permit e-Application)
- [ ] Statement of Affirmation (State Form 56471)
- [ ] Technical worksheets as applicable:
  - Effective Cross Sectional Flow (Companion Worksheet A)
  - Development in the Shadow
  - Fish, Wildlife, and Botanical Resources Impact Assessment (SF 57132)
- [ ] Site plans showing existing and proposed grades, structures, and floodway limits
- [ ] Hydraulic assessment / No-Rise analysis (use generated `03_IDNR_No_Rise_Certification.pdf`)
- [ ] Compensatory storage calculations (1.20× safety factor – already in Archimedes engine)
- [ ] Public notice documentation (after application is received by IDNR)

## 4. No-Rise Certification
- [ ] PE-sealed statement that the project produces **0.00 ft** rise in BFE
- [ ] Supported by technical data (LiDAR, hydraulic model, storage balance)
- [ ] Generated artifact: `03_IDNR_No_Rise_Certification.pdf`

## 5. Compensatory Storage (312 IAC 10 practice)
- [ ] V_excavation ≥ 1.20 × V_fill
- [ ] Net balance ≥ 0 (documented in BCA storage JSON and No-Rise letter)
- [ ] Excavation located to provide active flood storage

## 6. Local (Posey County) Layer
- [ ] Area Plan Commission – Improvement Location Permit (if footprint changes)
- [ ] Building Commissioner – construction permit
- [ ] Health Department – septic (if applicable)

## 7. Official Portals
- INFIP / FARA: https://experience.arcgis.com/experience/8bf315c8212f44c387f528be429327c5/
- IDNR Permit Programs: https://www.in.gov/dnr/water/regulatory-permit-programs/
- Online Permit Application: https://secure.in.gov/apps/dnr/dnr_water_application_ia
- Best Available Floodplain downloads: https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/the-indiana-best-available-floodplain-mapping/

## 8. PTDT Generated Support Documents
| Artifact | Use |
|----------|-----|
| `03_IDNR_No_Rise_Certification.pdf` | Primary No-Rise submittal |
| `bca_storage_data.json` / `bca_summary.csv` | Storage volume proof |
| `01_PE_Transmittal_and_LOMA_Letter.pdf` | Cover / certification |
| `bca_package_manifest.json` | Chain-of-custody |
