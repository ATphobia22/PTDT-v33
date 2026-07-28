# Frontend green path

## Local

```bash
git pull origin main
npm install
npm run build
```

Expected: `vite build` → `dist/`, then `esbuild server.ts` → `dist/server.cjs`.

## Stack (npm only — not git forks)

| Package | Source |
|---------|--------|
| vite | `vite@^6.2` npm |
| three | `three@^0.185` npm |
| MapLibre | `maplibre-gl@^5` npm |

See `docs/OSS_FORK_SCAN.md` for ATphobia22/vite and ATphobia22/three.js (upstream mirrors only).

## What broke builds (fixed)

| Issue | Fix |
|-------|-----|
| Static `three/webgpu` + `three/tsl` in DigitalTwinView | Removed; R3F valley only |
| `npm ci` vs slimmed package.json | CI uses `npm install` |
| `@base-ui` subpaths | Plain React UI primitives |

## CI

- **node-build**: hard on `npm run build`
- **python-engine**: LOMA / No-Rise / NAVD88
- **docker-verify**: Archimedes health hard
