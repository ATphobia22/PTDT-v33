# HUD design & accuracy — Tri-State / Bonebank

## Visual style (from product mockups)

Match the dark slate glass panels in the flood-stage and Cesium mockups:

- `bg-slate-950/90 backdrop-blur-xl border border-slate-800`
- Accent bars: blue (stage), emerald (clearance / OK), amber/rose (risk)
- Mono labels `text-[8px]–10px] uppercase tracking-widest`
- Large stage number in blue (`text-[28px] font-black font-mono`)

## What is real vs mock

| Element | Source of truth |
|---------|-----------------|
| BFE 375.0 / LAG 377.2 / +2.2 ft | `BONEBANK_SITE` + Archimedes |
| Owner TUCKER, 2.0 ac, S35 T7S R14W | Think GIS / siteConstants |
| Live gage height & cfs | USGS 03378500 via `/api/usgs-telemetry` |
| Risk bands | Approximate NWS categories for 03378500 |
| Franklin NC / 35.62 ac / coastal flyovers | **Not** this project — style only |
| Township-wide 156 assets / 18.7 ft stage | Demo art; replaced with live stage + site-scale risk |

## Units

- **Gage height (ft)** at New Harmony is **not** NAVD88 water-surface elevation at the house.
- HUD labels stage as gage height; BFE/LAG remain NAVD88 orthometric.

## Live check (example 2026-08-01)

USGS 03378500 ~ **2.92 ft**, **11,600 cfs** → risk **NORMAL** (below action ~15 ft).

Mock art showing 18.7 / 20.3 ft is a **flood scenario**, not current conditions.

## Cesium / flyover notes

Prefer MapLibre + free tiles for zero-key government use. Cesium ion branding in mockups is optional and not required for core HUD accuracy.
