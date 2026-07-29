# API key management

## Default: no keys required

| Capability | Key needed? |
|------------|-------------|
| MapLibre basemap (default free tiles) | **No** |
| USGS NWIS IV | **No** (public) |
| NRCS SDA | **No** (public) |
| OpenFEMA claims | **No** (public) |
| Archimedes package generate | **No** |

Copy `.env.example` → `.env` only if you enable optional features.

## Optional keys (never commit real values)

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Optional Google Gemini for `AiPdfAnalyzer` |
| `GOOGLE_MAPS_API_KEY` / `VITE_GOOGLE_MAPS_API_KEY` | Optional Google Maps (prefer MapLibre) |
| Cesium Ion token | **Not used** in default path |
| Mapbox token | **Not required** for MapLibre default |
| Databricks tokens | Only for experimental CD workflow |

## Rules

1. Keep secrets in `.env` (gitignored) or CI secrets — never in source.  
2. Prefer **server-side** proxy (`server.ts` / `federalProxies.ts`) so browser never holds federal-call credentials (currently none needed).  
3. Rotate any leaked key immediately.  
4. Document new keys in `.env.example` with empty values and a comment.

## User-Agent

Federal fetches should send a descriptive User-Agent (already: `PTDT-v33-Tri-State-Twin`) for polite API use.
