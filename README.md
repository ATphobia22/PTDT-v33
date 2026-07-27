# Tri-State Family Engineering System
## PTDT v32 + Tucker Cognitive OS

**Sovereign Digital Twin & Flood Defense Platform**  
Anchor Node: 13101 Bonebank Road, Point Township, Posey County, Indiana  
Datum: NAVD88

### Mission
Evidence-grade technical data for:
- FEMA **Letter of Map Amendment (LOMA)** (natural high ground)
- Indiana DNR Zero-Rise / Construction in a Floodway (312 IAC 10)
- FEMA BRIC / HMGP / FMA Benefit-Cost Analysis packages

### Key Facts (Bonebank Road)
| Parameter | Value | Source |
|-----------|-------|--------|
| Base Flood Elevation (BFE) | 375.0 ft | FEMA FIS |
| Lowest Adjacent Grade (LAG) | 377.2 ft | 5 cm LiDAR |
| Clearance | **+2.2 ft** | LOMA-eligible |
| Compensatory safety factor | **1.20×** | IDNR 312 IAC 10 |
| Fill present? | No (natural grade) | Pure LOMA path |

---

### Quick Start – Regulatory Package (Python)

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Generate full LOMA + No-Rise + BCA package and start API
python archimedes_engine.py
```

**Canonical entry point:** `archimedes_engine.py` (repo root)  
The workspace file `workspace/archimedes_console/02_mathematical_core/archimedes_sovereign_core.py` is a thin re-export of the same engine.

### Live API (port 8000)
```bash
curl http://localhost:8000/api/v1/health

curl -X POST http://localhost:8000/api/v1/package/generate \
  -H "Content-Type: application/json" \
  -d '{"berm_length_ft": 300, "berm_width_ft": 10, "berm_height_ft": 3}'
```

### Artifacts (`05_final_portal_package/`)
| File | Purpose |
|------|---------|
| `01_PE_Transmittal_and_LOMA_Letter.pdf` | PE-sealed LOMA cover |
| `03_IDNR_No_Rise_Certification.pdf` | Zero-rise + 1.20× storage |
| `bca_elevation_data.json` | FEMA BCA Toolkit inputs |
| `bca_storage_data.json` | Compensatory storage |
| `bca_summary.csv` | Spreadsheet import |
| `bca_package_manifest.json` | SHA-256 receipt |

---

### Frontend (Node)
```bash
npm ci
npm run dev      # development
npm run build    # production build
```

### Docker Compose (web + Archimedes)
```bash
docker-compose up --build
# Web UI  → http://localhost:3000
# API     → http://localhost:8000
```

### Docs
- `docs/LOMA_PACKAGE_CHECKLIST.md`
- `docs/IDNR_Floodway_and_FARA_Checklist.md`
- `docs/Grant_and_Data_Requirements.md`
- `docs/Indiana_Floodplain_Mapping_Standards.md`
- `workspace/archimedes_console/README.md`

### Next Steps After Generation
1. Apply Indiana PE seal to LOMA letter and No-Rise certificate
2. Attach current FARA from INFIP
3. Submit LOMA via Online LOMC / eLOMA
4. Import `bca_summary.csv` into FEMA BCA Toolkit for BRIC/HMGP/FMA
