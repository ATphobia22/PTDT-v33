# Full rescan (2026-08-02)

## Commands run (clean clone)

```bash
git pull --ff-only
npm install
npm run lint   # tsc --noEmit — PASS
npm run build  # vite + esbuild server.cjs — PASS
python3 -m py_compile services/archimedes_api.py  # PASS
```

## MapComponent wire (Bonebank boot)

```ts
import { bootBonebankMapLayers } from '../lib/mapBoot';
import { ensureTerrariumTerrain } from '../lib/mapTerrainAndBuildings';

// CAMERA_PRESETS[0]: center [-88.0007, 37.9035], zoom 16
// map.on('load'): void bootBonebankMapLayers(map, { fly: false })
// loadTerrain: ensureTerrariumTerrain(mapInstance, { exaggeration: 1.35 })
```

## Stack status

| Area | Status |
|------|--------|
| Node lint/build | Green |
| siteConstants | Enriched |
| Terrain / EPQS / NLD / USGS | Routes registered |
| CI workflow | Fixed to archimedes sidecar |
| Archimedes PE claims | Stripped / illustrative |
| Bootstrap git pull | scripts/bootstrap.sh |
