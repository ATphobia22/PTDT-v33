# PTDT Sovereign Hydrodynamic Pipeline

Point Township Digital Twin — **13101 Bonebank Road**, Posey County, Indiana (TUCKER, 2.0 ac).

**Zero-key by design.** Core stack runs with no API keys, no paid tiles, no SaaS.

**Completion:** see [docs/PROJECT_COMPLETE.md](docs/PROJECT_COMPLETE.md).

## Quick start

```bash
git clone https://github.com/ATphobia22/Tri-State-Family-Engineering-System-.git
cd Tri-State-Family-Engineering-System-
npm install
npm run assemble
npm run dev
```

| Layer | Source | Key? |
|-------|--------|------|
| Map + buildings | MapLibre + OSM + local GeoJSON | No |
| Vertical datum | NGS NCAT public API | No |
| Parcels / BAFM | IndianaMap public REST | No |
| Stage | USGS NWIS dual gauge (+ offline seed) | No |
| Hydraulics / No-Rise | Archimedes local 1.20× | No |
| LOMA metadata | `/api/regulatory/loma-package` | No |
| Chat | Gemini | Optional |

**Anchors:** BFE 375.0 · LAG 377.2 · FFE 382.5 · FIRM 18129C0215D · Community 180194 · NAVD88

License: **Apache-2.0**.
