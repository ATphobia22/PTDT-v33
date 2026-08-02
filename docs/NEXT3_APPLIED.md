# Next 3 suggestions applied

1. **Enriched `siteConstants`** — parcel_id, FIRM, FFE, dual USGS IDs, clearance, tighter AOI/center (37.9035, -88.0007).
2. **CI fixed** — `.github/workflows/build.yml` runs real `npm ci` + lint + build; Python job targets `services/archimedes_api.py` (not missing `archimedes_engine`).
3. **`src/lib/mapBoot.ts`** — `bootBonebankMapLayers(map)` for Terrarium + `/api/gis/buildings` extrusions + fly-to.

### Wire into MapComponent (optional one-liner after map load)

```ts
import { bootBonebankMapLayers } from '../lib/mapBoot';
// inside map.on('load', ...)
void bootBonebankMapLayers(map);
```

Existing lazy `loadTerrain` remains valid; boot helper is the preferred single call.
