# Frontend green path

## Local

```bash
git pull origin main
npm install
npm run build
```

Expected: `vite build` writes `dist/`, then `esbuild server.ts` writes `dist/server.cjs`.

## What broke builds (fixed)

| Issue | Fix |
|-------|-----|
| Static `three/webgpu` + `three/tsl` imports in DigitalTwinView while init path disabled | Removed; 3D uses WebGPU3DValley + R3F |
| `npm ci` vs slimmed package.json (puppeteer / @base-ui removed) | CI uses `npm install` |
| `@base-ui` subpath resolution | Plain React button/dialog/tabs |

## CI

- **node-build**: hard on `npm run build`
- **python-engine**: hard LOMA/No-Rise/NAVD88
- **docker-verify**: hard Archimedes health; web image soft
