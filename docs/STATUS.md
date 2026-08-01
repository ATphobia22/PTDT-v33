# PTDT / Bonebank Sovereign Node — Status

**Repo:** [ATphobia22/Tri-State-Family-Engineering-System-](https://github.com/ATphobia22/Tri-State-Family-Engineering-System-)  
**Site:** 13101 Bonebank Road · TUCKER · 2.0 ac · S35 T7S R14W  
**Datum:** NAVD88 · BFE 375.0 · LAG 377.2 · FFE 382.5 · +2.2 ft  
**FEMA:** Community 180194 · FIRM **18129C0215D**  
**Gauges:** 03378500 (Wabash) + 03322000 (Myers / UNWK2)

## Done

| Item | Status |
|------|--------|
| Zero-key gov stack | Done |
| GIS routes (NCAT, parcels, BAFM, buildings) | Done |
| HUD live stage + scenario strip BASE/CURRENT/FORECAST | Done |
| PDF regulatory extraction → siteConstants + docs | Done |
| Dual-gauge Myers bridge (Python) | Done |
| Compensatory factor locked **1.20×** | Done |
| Depth legend (UI bins; HEC-RAS mesh STUB) | Done |
| Cesium ion optional — MapLibre remains default | Documented |

## Start

```bash
npm install && npm run assemble && npm run dev
```

See `docs/PDF_EXTRACTED_REGULATORY_FACTS.md` and `docs/HUD_DESIGN_AND_ACCURACY.md`.
