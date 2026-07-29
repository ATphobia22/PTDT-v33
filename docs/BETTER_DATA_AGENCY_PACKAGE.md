# Better Data package for federal & state agencies

## Goal

Produce a **reproducible, hash-sealed evidence set** that argues the Point Township Digital Twin supplies **better data** than approximate Zone A / coarse FIS products for:

| Agency | Decision |
|--------|----------|
| **FEMA** | LOMA (natural high ground) via Online LOMC |
| **IDNR** | FARA / BAFL / floodway or fringe determinations |
| **FEMA GO** (optional) | BRIC/FMA narrative + BCA screening inputs |

Software prepares exhibits. **Only a licensed Indiana P.E. (and surveyor as required) can seal and file.**

## Generate

```bash
# from repo root (ReportLab recommended for PDF brief)
pip install reportlab
python python/better_data_package.py
```

Output directory: **`05_better_data_agency_package/`**

| File | Agency use |
|------|------------|
| `00_evidence_manifest.json` | SHA-256 inventory of all exhibits |
| `01_better_data_comparison.json` | Machine-readable effective vs better metrics |
| `02_better_data_comparison.csv` | Spreadsheet for reviewers |
| `03_data_lineage.json` | NFHL, BAFL, NCAT, USGS, OpenFEMA, NRCS provenance |
| `04_property_exhibit.geojson` | Map placeholder (replace with surveyed geometry) |
| `05_bca_screening.*` | Screening costs/elevations for BRIC story |
| `06_AGENCY_COVER_NARRATIVE.md` | Cover letter narrative |
| `07_better_data_comparison_brief.pdf` | Printable comparison table |
| `08_submission_checklist.json` | FEMA / IDNR / BRIC checklist |

Also run Archimedes templates when needed:

```bash
python archimedes_engine.py
# → 05_final_portal_package/ (LOMA / No-Rise PDF templates)
```

## Better-data claims (what reviewers can verify)

1. **NAVD 88 only** — package generator and `assert_navd88_datum` reject NGVD 29 labels.
2. **Parcel clearance vector** — LAG 377.2 ft − BFE 375.0 ft = **+2.2 ft** (project baseline; survey must confirm).
3. **Dual-layer Indiana practice** — insurance NFHL **and** state BAFL/FARA documented in lineage.
4. **Live telemetry context** — USGS 03378500 / 03322000 via `/api/usgs-telemetry` (context, not BFE).
5. **Open federal APIs** — NFHL, OpenFEMA claims, NRCS soils as optional supporting layers.
6. **Honest hashes** — every file SHA-256; empty-content hash banned in schema.

## Official filing paths (do not automate fake APIs)

1. **FEMA LOMA:** Online LOMC + PE-sealed topo / LAG.
2. **IDNR:** INFIP → FARA PDF archived in package → e-application as required.
3. **BRIC:** FEMA GO UI + official BCA Toolkit (replace screening placeholders).

See `docs/ANTI_FABRICATION.md`, `docs/LOMA_PACKAGE_CHECKLIST.md`, `docs/INDIANA_FLOODPLAIN_STANDARDS.md`.

## Before you claim “better” to an agency

- [ ] Surveyor/PE confirms LAG, BFE source, and natural-ground status  
- [ ] Effective FIRM panel & community number verified on Map Service Center  
- [ ] FARA PDF downloaded for the exact coordinates  
- [ ] GeoJSON replaced with real structure/LAG geometry  
- [ ] BCA dollar values replaced with appraisals if used for grants  
- [ ] PE wet seal on letters in `05_final_portal_package/`  
