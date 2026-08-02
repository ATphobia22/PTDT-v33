# PTDT Sovereign Terrain Module

## Endpoints

| Route | Purpose |
|-------|---------|
| `GET /api/terrain/epqs?lat=&lon=&units=Feet` | USGS EPQS 3DEP point elevation |
| `GET /api/terrain/fuse?lat=&lon=&ncat=0\|1` | EPQS + site BFE/LAG + optional NCAT |
| `POST /api/terrain/encode` | `{ height_m, encoding: mapbox\|terrarium }` → RGB |
| `GET /api/terrain/maplibre-config` | Client-ready Terrarium + buildings descriptor |
| `GET /api/transform-elevation` | Existing NCAT ortho height transform |

## Decode / encode

**Mapbox Terrain-RGB**

`h = -10000 + (R*65536 + G*256 + B) * 0.1`

**Terrarium** (default visual DEM)

`h = R*256 + G + B/256 - 32768`

Helpers: `src/lib/sovereignTerrain.ts`

## MapLibre integration

```ts
import { integrateBonebankTerrainAndBuildings } from "./lib/mapTerrainAndBuildings";
// after map load:
await integrateBonebankTerrainAndBuildings(map);
```

`MapComponent` already lazy-loads Terrarium DEM; call the helper for explicit Bonebank focus + `/api/gis/buildings` extrusions.

## Accuracy

- EPQS: interpolated 3DEP; USGS states these are **not** official surveyed elevations.
- Terrarium: visualization mesh only.
- Regulatory: `BONEBANK_SITE.bfe_ft_navd88` / `lag_ft_navd88`.
