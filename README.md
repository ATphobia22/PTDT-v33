# Tri-State Family Engineering System
## PTDT v32 + Tucker Cognitive OS

**Sovereign Digital Twin & Flood Defense Platform**  
Anchor Node: 13101 Bonebank Road, Point Township, Posey County, Indiana  
Datum: NAVD88 | EPSG:3857

### Mission
Provide mathematically rigorous, cryptographically sealed, Evidence-Grade Technical Data to support:
- FEMA **Letter of Map Amendment (LOMA)** (preferred path – natural high ground)
- Indiana DNR Zero-Rise / Construction in a Floodway permits (312 IAC 10)
- Protection of ancestral family holdings from bureaucratic devaluation

### Key Regulatory Facts (Bonebank Road)
| Parameter                  | Value          | Source                  |
|---------------------------|----------------|-------------------------|
| Base Flood Elevation (BFE)| 375.0 ft       | FEMA FIS                |
| Lowest Adjacent Grade (LAG)| 377.2 ft      | 5 cm LiDAR (verified)   |
| Clearance above BFE       | **+2.2 ft**    | LOMA-eligible           |
| Fill present?             | No (natural)   | Supports pure LOMA path |

### Quick Start – Generate LOMA Package
```bash
# 1. Start cognitive infrastructure
docker-compose -f workspace/archimedes_console/infra/docker-compose.yml up -d

# 2. Generate scientific certification + PE letter + BCA narrative
python archimedes_console/archimedes_core.py
python workspace/archimedes_console/05_final_portal_package/build_pe_transmittal.py

# 3. Review checklist
cat docs/LOMA_PACKAGE_CHECKLIST.md
```

Output appears in `05_final_portal_package/`.

### Core Components
- `archimedes_console/` – Mathematical core, PE letters, 3D simulator
- `backend/` – FastAPI, HEC-RAS coupler, GIS aggregator, OpenMI gRPC
- `docs/ptdt-v32/` – OpenMI ICD, Evidence Manifest schema, DAG specs
- `src/` – React dashboard, MapLibre / WebGPU views, River Cross-Section
- `godot/` – Evidence seal for high-fidelity capture

### LOMA Submission Path (Recommended)
1. Confirm no fill has been placed → pure LOMA (MT-EZ or Online LOMC).
2. Use generated PE Transmittal Letter + Elevation data (LAG 377.2 > BFE 375.0).
3. Submit via [Online LOMC](https://hazards.fema.gov/femaportal/onlinelomc/signin) or eLOMA (if PE/surveyor).
4. Attach Evidence Manifest + Scientific Certification sheet.
5. Typical FEMA review: ~60 days. No fee for standard LOMA.

### License & Sovereignty
All components are designed for air-gapped / sovereign operation. Cryptographic hashes and Ed25519 signatures support Daubert-compliant chain of custody.
