# Document batch scan — keep / reject

Sources: Virtual IDE PDF, HUD accuracy PDF, V34 note, free-tools note, PTDT v32/33 exec summary, 3D buildings PDF, Sovereign docker/FastAPI PDF, Family businesses PDF, Magic3D arXiv.

## Keep (aligned with live stack)

| Item | Status in repo |
|------|----------------|
| BFE 375.0 / LAG 377.2 / +2.2 / FFE 382.5 / 1.20× / NAVD88 | `siteConstants` |
| Parcel 65-09-35-200-001.000-009; coords ~37.9035, -88.0007 | `siteConstants` |
| Dual USGS 03378500 + 03322000 | `/api/usgs-telemetry` |
| Gage height ≠ WSE NAVD88 labeling | HUD accuracy doc |
| HEC-RAS/SWMM not LIVE until PE runs | PE_GATED / illustrative |
| NCAT / IndianaMap / BAFM / buildings | GIS routes |
| USACE NLD public FeatureServer | `/api/nld/*` |
| Free tools catalog (SWMM, ANUGA, TELEMAC, ADONIS) | toolkit doc |
| FoS 1.40 / 1.10 **reference only** | `usaceReferenceThresholds` |
| Zero-key MapLibre path | core stack |
| Tailwind IDE color tokens (ideBg, ideAccent, …) | `public/virtual-workspace.html` |
| Docker multi-service **template** | `docker-compose.yml` (env secrets) |
| dataretrieval / USGS pattern | already via NWIS |

## Reject / do not claim as shipped truth

- V34 planetary monorepo (domain-a clinical, EarthOS, Vitess, Houdini FlowBridge, Olive 60 fps, Apple Foundation Models as product requirements)
- Automated PE-grade LOMA/No-Rise generation without Indiana PE
- Numerical Validation Engine / HLL vs HEC-RAS RMSE as certified
- Magic3D / TRELLIS / ComfyUI as regulatory mesh pipeline
- Hardcoded DB passwords in compose (`securepass123`)
- SIG_MLDSA_FIPS204 seals without real crypto module
- Family business narrative as engineering evidence (optional heritage doc only if user maintains)
- Virtual IDE “167 commits” / bootDocker as functional CI

## HUD accuracy (from HUD.pdf) — still the rule

1. Live USGS for stage/discharge  
2. Single `BONEBANK_SITE` source of truth  
3. Label gage height vs BFE/LAG separately  
4. No false LIVE on HEC-RAS/SWMM  
5. UTC labels must use real UTC  

## Virtual IDE PDF

Useful as **UI chrome reference** (Tailwind CDN tokens, panel layout). Not a substitute for the React/Vite app.
