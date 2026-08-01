# Legacy server.ts route recovery

## What was recovered

The full pre-wire Express server (TurboVec, Archimedes PDF package, FEMA/DNR offline, twin simulate, NWS, layers, policy, SDE partition, ISO 23247, chat offline mode, WebSocket telemetry, etc.) lives in git history at:

**commit** `b61d7c819ed9a09fee74dd1cd157225d4aaad38e` path `server.ts`

## How recovery works

```bash
npm run assemble   # or: node scripts/assemble-server-main.mjs --force
npm run dev        # predev runs assemble automatically
```

`scripts/assemble-server-main.mjs` will:

1. `git show b61d7c8:server.ts`
2. Patch in `registerGisRoutes(app)` (zero-key NCAT / parcels / BAFM / buildings / site)
3. Rewrite imports for `src/server-main.ts`
4. Write `src/server-main.ts`

`server.ts` at repo root is a thin bootstrap that runs assemble then `import "./src/server-main.ts"`.

## Routes included after assemble

- GET `/api/usgs-telemetry`, `/api/fema-flood-zones`, `/api/dnr-floodplain`, `/api/nws-alerts`
- GET `/api/layers`, `/api/historic-sites`, `/api/pdfs`, `/api/pdf-search`, `/api/scenario/:id`
- GET `/api/transform-elevation`, `/api/turbovec/backup`, `/api/v23/iso-compliance`
- POST `/api/v1/twin/simulate`, `/api/archimedes/generate`, `/api/turbovec/compress`
- POST `/api/chat`, `/api/analyze-pdf`, `/api/policy/validate`, `/api/sde/partition`
- POST `/api/v23/telemetry`, `/api/layers/toggle`
- Plus `/api/gis/*` from `registerGisRoutes`

## Manual one-liner (if assemble fails)

```bash
git show b61d7c819ed9a09fee74dd1cd157225d4aaad38e:server.ts > /tmp/legacy-server.ts
node scripts/assemble-server-main.mjs --force
```

Requires a full clone (not a shallow clone missing that commit).
