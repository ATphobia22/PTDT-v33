# PTDT / Bonebank Sovereign Node — Status

**Repo:** [ATphobia22/Tri-State-Family-Engineering-System-](https://github.com/ATphobia22/Tri-State-Family-Engineering-System-)  
**Site:** 13101 Bonebank Road, Point Township, Posey County, IN (Owner TUCKER, 2.0 ac)  
**Datum:** NAVD88 · BFE 375.0 ft · LAG 377.2 ft · clearance +2.2 ft · USGS 03378500

## Done (main)

| Item | Status |
|------|--------|
| Zero-key government stack (Apache-2.0, no Mapbox/Gemini required) | Done |
| NCAT + IndianaMap parcels/BAFM + buildings GIS routes | Done (`src/server-gis-routes.ts`) |
| `registerGisRoutes` wired via assemble → `src/server-main.ts` | Done |
| Legacy Express routes recovery (TurboVec, Archimedes, FEMA/USGS/NWS offline) | Done (`npm run assemble`) |
| Site constants from Think GIS | Done (`src/lib/siteConstants.ts`) |
| Buildings service + local sample for 3D extrusion | Done |
| CI soft-fail (Databricks skip, lexical warn) | Done |
| G1P / sister-repo inventory | Done (`docs/GOVERNMENT_FREE_STACK.md`) |

## Start (government / public — no keys)

```bash
git clone https://github.com/ATphobia22/Tri-State-Family-Engineering-System-.git
cd Tri-State-Family-Engineering-System-
npm install
npm run assemble   # recovers full routes from git history or raw GitHub
npm run dev
```

Open `http://localhost:3000`. Optional: `GEMINI_API_KEY` for cloud chat only.

## Assemble recovery sources

1. `git show b61d7c8:server.ts`
2. `raw.githubusercontent.com/.../b61d7c8/server.ts`
3. Optional zlib parts under `scripts/server-main-b64/`

## Optional next (not blocking)

- MapLibre fill-extrusion layer wired in UI `MapComponent` (non-destructive)
- Full Microsoft Indiana buildings clip checked into `public/data/buildings/`
- Merge feature branches: `feat/3d-building-footprints`, `feature/ncat-indianamap-site-data`
- Re-harden lexical gate after `data.ts` PR sanitization merges
