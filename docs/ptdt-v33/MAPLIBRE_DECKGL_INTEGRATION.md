# MapLibre GL JS + deck.gl hybrid

**Authority:** presentation-only. Never mutates HydroLayer, freeboard, or regulatory evidence.

## Architecture

```
MapLibre GL JS (base map)
  ├─ raster-dem  /tiles/dem/{z}/{x}/{y}.webp   (COG → terrain + hillshade)
  ├─ raster      Indiana Current Imagery WMTS  (IGIC / presentation)
  ├─ raster      /tiles/flood100/...           (sealed flood depth tiles)
  ├─ geojson     /api/v1/ras/extent?authority=presentation
  └─ MapboxOverlay (interleaved: true)
       └─ deck.gl GeoJsonLayer buildings-extrusion
```

## Integration points

| Concern | Implementation |
|---------|----------------|
| Site camera | `BONEBANK_SITE` from siteConstants |
| Twin state | CRITICAL_INUNDATION → red extrusion |
| Stage | fill-opacity driven by stageFt |
| Datum | data-datum=NAVD88 |
| Authority | data-authority=presentation-only |

## Dependencies

- maplibre-gl
- @deck.gl/mapbox (MapboxOverlay)
- @deck.gl/layers (GeoJsonLayer)

TurboVec WebGPU is separate (band math). Align Box3D renderOrigin with map local frame.
