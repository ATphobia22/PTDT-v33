# Tri-State Family Engineering System
## PTDT v32 + Tucker Cognitive OS

**Sovereign Digital Twin & Flood Defense Platform**  
Anchor Node: 13101 Bonebank Road, Point Township, Posey County, Indiana  
Datum: NAVD88 | EPSG:3857

### Mission
Provide mathematically rigorous, cryptographically sealed, Evidence-Grade Technical Data to support:
- FEMA **Letter of Map Amendment (LOMA)** (preferred path – natural high ground)
- Indiana DNR Zero-Rise / Construction in a Floodway permits (312 IAC 10)
- FEMA BRIC / HMGP / FMA grant Benefit-Cost Analysis packages
- Protection of ancestral family holdings from bureaucratic devaluation

### Key Regulatory Facts (Bonebank Road)
| Parameter                  | Value          | Source                  |
|---------------------------|----------------|-------------------------|
| Base Flood Elevation (BFE)| 375.0 ft       | FEMA FIS                |
| Lowest Adjacent Grade (LAG)| 377.2 ft      | 5 cm LiDAR (verified)   |
| Clearance above BFE       | **+2.2 ft**    | LOMA-eligible           |
| Compensatory safety factor| **1.20×**      | IDNR 312 IAC 10 aligned |
| Fill present?             | No (natural)   | Supports pure LOMA path |

### Quick Start – Live Unified Package
```bash
# Generate complete LOMA + No-Rise + BCA package and start API
python workspace/archimedes_console/02_mathematical_core/archimedes_sovereign_core.py
```

This single command:
1. Builds PE Transmittal & LOMA Letter (PDF)
2. Builds IDNR No-Rise Certification (PDF)
3. Exports BCA elevation + storage data (JSON + CSV)
4. Writes SHA-256 package manifest
5. Launches FastAPI on port 8000

### Live API Endpoints
```bash
# Health
curl http://localhost:8000/api/v1/health

# Hydraulic simulation
curl -X POST http://localhost:8000/api/v1/twin/simulate \
  -H "Content-Type: application/json" \
  -d '{"usgs_stage_ft": 381.2, "discharge_cfs": 142000}'

# Full regulatory + BCA package
curl -X POST http://localhost:8000/api/v1/package/generate \
  -H "Content-Type: application/json" \
  -d '{"berm_length_ft": 300, "berm_width_ft": 10, "berm_height_ft": 3}'
```

### Artifacts Produced (`05_final_portal_package/`)
| File | Purpose |
|------|---------|
| `01_PE_Transmittal_and_LOMA_Letter.pdf` | PE-sealed LOMA cover letter |
| `03_IDNR_No_Rise_Certification.pdf` | Zero-rise + 1.20× storage proof |
| `bca_elevation_data.json` | FEMA BCA Toolkit elevation inputs |
| `bca_storage_data.json` | Compensatory storage metrics |
| `bca_summary.csv` | Spreadsheet / Toolkit import |
| `bca_package_manifest.json` | SHA-256 integrity receipt |

### Core Components
- `workspace/archimedes_console/02_mathematical_core/` – Unified live engine + package generator
- `backend/` – HEC-RAS coupler, GIS aggregator, OpenMI
- `docs/` – LOMA checklist, BCA notes, live generation guide
- `src/` – React / MapLibre / WebGPU dashboard
- `godot/` – Evidence seal

### LOMA + Grant Submission Path
1. Run the unified generator (above).
2. Apply Indiana PE seal to the LOMA letter and No-Rise certificate.
3. Submit LOMA via [Online LOMC](https://hazards.fema.gov/femaportal/onlinelomc/signin) or eLOMA.
4. Import `bca_summary.csv` / JSON into FEMA BCA Toolkit for BRIC / HMGP / FMA.
5. Retain the SHA-256 manifest for audit trail.

### License & Sovereignty
Designed for air-gapped / sovereign operation. Cryptographic hashes support Daubert-compliant chain of custody.
