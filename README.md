# Tri-State Family Engineering System / PTDT

Sovereign **zero-key-first** digital twin stack for **13101 Bonebank Road**, Point Township, Posey County, Indiana (Section 35, T7S, R14W).

Locked site anchors (NAVD88):

| Constant | Value |
|----------|-------|
| BFE | **375.0 ft** |
| LAG | **377.2 ft** |
| Clearance | **+2.2 ft** |
| Compensatory factor | **1.20×** |
| USGS gauges | **03378500** (Wabash @ New Harmony), **03322000** (Ohio @ J.T. Myers) |

## Architecture

| Layer | Stack | Port |
|-------|--------|------|
| Twin UI + Express gateway | React, Vite, MapLibre, TypeScript | **3000** |
| Optional Archimedes sidecar | FastAPI Manning + storage + unsigned PDF | **8000** |

Live / proxy routes (Node):

- `GET /api/usgs-telemetry` — dual-gauge NWIS
- `GET /api/terrain/*` — EPQS fuse, Terrarium config, DEM encode helpers
- `GET /api/gis/*` — site, buildings, BAFM, parcels, NCAT
- `GET /api/nld/*` — USACE NLD FeatureServer proxy
- `GET /api/reference-thresholds` — FoS / rise **reference only**

**Honesty boundary:** Manning, storage math, and ReportLab PDFs are **illustrative / unsigned**. They are **not** PE-sealed No-Rise, LOMA, or grant BCR certifications.

## Quick start (includes `git pull`)

```bash
git clone https://github.com/ATphobia22/Tri-State-Family-Engineering-System-.git
cd Tri-State-Family-Engineering-System-

# Recommended: pull + install
bash scripts/bootstrap.sh

# Or one-shot pull + install + dev server
bash scripts/dev_up.sh

# Manual equivalent
git pull --ff-only
npm install
npm run dev
```

Open **http://localhost:3000**

### Verify

```bash
npm run lint    # tsc --noEmit
npm run build   # Vite + esbuild server
# with server running:
npm run smoke   # scripts/smoke_node_apis.sh
```

### Optional Archimedes sidecar

```bash
pip install -r services/requirements-archimedes.txt
python services/archimedes_api.py
# http://127.0.0.1:8000/api/v1/health
```

### Docker

```bash
docker-compose up --build
```

Set secrets via environment (see `.env.example`). Do not commit real API keys or DB passwords.

## Docs index

- `docs/SOVEREIGN_TERRAIN_MODULE.md` — EPQS / Terrarium / MapLibre
- `docs/V34_PASTE_AUDIT.md` — what was accepted vs rejected from V34 pastes
- `docs/PHOTOREAL_3D_AND_TERRAIN_TILES.md` — DEM vs survey limits
- `certification/` — unsigned checklists (CIF / NWP27 / 401 context)

## License / use

Intended to stay usable for government and municipal staff without paid map keys where possible (MapLibre, OpenFreeMap, USGS, public NLD).
