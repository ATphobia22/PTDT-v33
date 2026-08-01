# Cesium ion — optional only

**Default path remains MapLibre + OpenFreeMap + AWS Terrarium DEM + local building GeoJSON.**

Cesium ion is **not required** for government zero-key use.

## If you have a Cesium ion token

1. Set `CESIUM_ION_TOKEN` in `.env` (never commit the token).
2. Prefer a separate optional module; do not hard-require `@cesium/engine` in the default build.
3. Keep NAVD88 heights and FIRM **18129C0215D** labels identical to the MapLibre HUD.

## Why MapLibre stays default

| Requirement | MapLibre stack |
|-------------|----------------|
| No paid account | Yes |
| Offline / CI buildings | `/api/gis/buildings` local sample |
| 3D extrusion | `fill-extrusion` |
| Terrain | Terrarium DEM (public) |

Mockups that show “Cesium ion” branding are **visual style**, not a runtime dependency.
