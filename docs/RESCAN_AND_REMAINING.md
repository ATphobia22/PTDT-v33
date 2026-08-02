# Full rescan (2026-08-02) — complete

## Verified green

```bash
git pull --ff-only
npm install
python3 scripts/apply_mapcomponent_bonebank_wire.py   # Bonebank terrain boot
npm run lint    # PASS
npm run build   # PASS
python3 -m py_compile services/archimedes_api.py
```

## Remaining wire (full code — already in apply script)

```python
# scripts/apply_mapcomponent_bonebank_wire.py  (committed)
# Adds:
#   import { bootBonebankMapLayers } from '../lib/mapBoot'
#   import { ensureTerrariumTerrain } from '../lib/mapTerrainAndBuildings'
#   CAMERA_PRESETS[0] -> 37.9035, -88.0007 zoom 16
#   map.on('load') -> bootBonebankMapLayers(map, { fly: false })
#   loadTerrain -> ensureTerrariumTerrain(...)
```

Run once locally and commit the resulting `MapComponent.tsx` for permanent tree state:

```bash
python3 scripts/apply_mapcomponent_bonebank_wire.py
git add src/components/MapComponent.tsx
git commit -m "feat: MapComponent Bonebank boot wired"
git push
```

CI runs the apply script before lint/build so PRs always verify the wired map.

## Stack checklist

| Item | Status |
|------|--------|
| lint / build | Green |
| siteConstants | 37.9035 / BFE LAG 1.20x |
| terrain EPQS NLD USGS | Live routes |
| bootstrap git pull | scripts/bootstrap.sh |
| Archimedes PE seals | Removed — illustrative only |
| CI | node + archimedes sidecar |
