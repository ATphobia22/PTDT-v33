# Tri-State Digital Twin (PTDT) & Tucker Cognitive OS

Sovereign Engineering & Flood Defense Platform  
Anchor Node: 13101 Bonebank Road, Point Township, Posey County, Indiana (NAVD88)

## Canonical Regulatory Engine

**Use the repo-root entry point:**

```bash
pip install -r requirements.txt   # from repo root
python archimedes_engine.py
```

This generates:
- `01_PE_Transmittal_and_LOMA_Letter.pdf`
- `03_IDNR_No_Rise_Certification.pdf`
- BCA JSON/CSV + SHA-256 manifest
- FastAPI server on port 8000

The file `02_mathematical_core/archimedes_sovereign_core.py` is a thin wrapper that imports the same root engine for backward compatibility.

## Key Numbers
- LAG = **377.2 ft** NAVD88
- BFE = **375.0 ft**
- Clearance = **+2.2 ft** (pure LOMA path)
- Compensatory storage safety factor = **1.20×** (IDNR 312 IAC 10)

## Directory Notes
```
archimedes_console/
├── 02_mathematical_core/     # Thin re-export of root archimedes_engine.py
├── 05_final_portal_package/  # PE letters, BCA outputs (generated)
├── infra/                    # Redis / Chroma docker-compose
├── v32_OpenMI_ICD.proto
├── v32_Evidence_Manifest.json
└── README.md
```

## Infrastructure
```bash
docker-compose -f infra/docker-compose.yml up -d
# or from repo root:
docker-compose up --build   # web (3000) + archimedes (8000)
```

## Regulatory Path
1. Run `python archimedes_engine.py`
2. Apply Indiana PE seal to generated PDFs
3. Obtain FARA from INFIP and attach
4. Submit LOMA via Online LOMC / eLOMA
5. Import BCA CSV/JSON into FEMA Toolkit for grants
