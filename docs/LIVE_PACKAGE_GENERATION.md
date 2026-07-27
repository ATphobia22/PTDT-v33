# Live Package Generation – Wired Integration

## One-Command Full Package

```bash
# From repo root or the mathematical core directory
python workspace/archimedes_console/02_mathematical_core/generate_full_package.py
```

This single command produces the complete LOMA + FEMA BRIC/HMA package:

| Artifact | Purpose |
|----------|---------|
| `bca_elevation_data.json` | LAG / BFE / clearance for BCA Toolkit |
| `bca_storage_data.json` | 1.20× compensatory storage proof |
| `bca_summary.csv` | Spreadsheet-ready import |
| `bca_package_manifest.json` | BCA integrity hash |
| `01_PE_Transmittal_Letter.pdf` | PE-sealed LOMA cover letter |
| `02_FEMA_BRIC_BCA_Narrative.pdf` | Grant narrative |
| `FULL_PACKAGE_MANIFEST.json` | Master manifest + SHA-256 |

All files land in `workspace/archimedes_console/05_final_portal_package/`.

## Live API Endpoint

Start the sovereign core:

```bash
python workspace/archimedes_console/02_mathematical_core/archimedes_sovereign_core.py
```

Then call:

```bash
curl -X POST http://localhost:8000/api/v1/package/generate \
  -H "Content-Type: application/json" \
  -d '{"berm_length_ft": 300, "berm_width_ft": 10, "berm_height_ft": 3}'
```

Or the simulation endpoint (now also returns elevation clearance):

```bash
curl -X POST http://localhost:8000/api/v1/twin/simulate \
  -H "Content-Type: application/json" \
  -d '{"usgs_stage_ft": 381.2, "discharge_cfs": 142000}'
```

## Health Check

```bash
curl http://localhost:8000/api/v1/health
```

Returns current LAG, BFE, and clearance values.

## Next Steps After Generation
1. Apply Indiana PE seal to `01_PE_Transmittal_Letter.pdf`
2. Submit LOMA via Online LOMC / eLOMA
3. Import `bca_summary.csv` into FEMA BCA Toolkit for BRIC / HMGP / FMA
4. Retain `FULL_PACKAGE_MANIFEST.json` for audit trail
