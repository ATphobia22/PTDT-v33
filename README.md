# PTDT Sovereign Hydrodynamic Pipeline

Point Township Digital Twin — **13101 Bonebank Road**, Posey County, Indiana.

**Zero-key by design.** Government employees and the public can run the core stack with no API keys, no paid map tiles, and no SaaS accounts.

See **[docs/GOVERNMENT_FREE_STACK.md](docs/GOVERNMENT_FREE_STACK.md)** and **[docs/STATUS.md](docs/STATUS.md)**.

## Quick start

```bash
git clone https://github.com/ATphobia22/Tri-State-Family-Engineering-System-.git
cd Tri-State-Family-Engineering-System-
npm install
npm run assemble    # restore full legacy routes + GIS wire
npm run dev
```

| Layer | Source | Key? |
|-------|--------|------|
| Map + 3D buildings | MapLibre + OSM + local GeoJSON | No |
| Vertical datum | NGS NCAT public API | No |
| Parcels / BAFM | IndianaMap public REST | No |
| Flood zones | FEMA NFHL (+ offline) | No |
| Stage | USGS NWIS (+ offline) | No |
| Hydraulics / No-Rise | Archimedes (local) | No |
| Chat persona | Gemini (optional) | Optional |

License: **Apache-2.0**.

## Architecture

- **Bootstrap:** `server.ts` → `scripts/assemble-server-main.mjs` → `src/server-main.ts`
- **GIS:** `src/server-gis-routes.ts` — `/api/gis/ncat|parcels|bafm|buildings|site`
- **Site anchors:** `src/lib/siteConstants.ts` (TUCKER, 2.0 ac, BFE/LAG, gauge 03378500)
- **Python:** `archimedes_engine.py` — 1.20× compensatory storage (IN 312 IAC 10)

## CI

- Build: Node + soft lexical gate + Archimedes verify
- Databricks CD: skipped when secrets/bundle absent

## Sister repos

- [Point-Township-Digital-Twin](https://github.com/ATphobia22/Point-Township-Digital-Twin)
- [godfirst-llm-ml-protocol](https://github.com/ATphobia22/godfirst-llm-ml-protocol)
