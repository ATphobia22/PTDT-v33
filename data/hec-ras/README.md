# HEC-RAS 2D mesh attachment (stub)

This directory holds **placeholder** geometry until a PE-sealed HEC-RAS 2D run is attached.

## Contract

| File | Purpose |
|------|---------|
| `mesh_stub.geojson` | Illustrative flood-depth bins for MapLibre (not evidentiary) |
| `MANIFEST.json` | Run id, model version, seal status |

## Production path (Daubert)

1. Export HEC-RAS 2D depth raster / mesh from USACE HEC-RAS.
2. Convert to GeoJSON or COG with NAVD88 heights.
3. Replace `mesh_stub.geojson` and set `MANIFEST.json` `sealed: true` with SHA-256 of the PE package.
4. API `GET /api/hec-ras/mesh` serves the file for DepthLegend / map overlay.

Until then the UI labels overlays as **STUB** — never claim LIVE HEC-RAS.
