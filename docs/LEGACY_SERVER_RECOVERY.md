# Legacy server.ts route recovery

Full pre-wire `server.ts` (TurboVec, Archimedes PDF package, FEMA/DNR, twin simulate, NWS, layers, policy, SDE partition, ISO compliance, etc.) is restored via:

```bash
npm run assemble   # writes src/server-main.ts from scripts/server-main-b64/*
npm run dev        # predev runs assemble automatically
```

`registerGisRoutes(app)` is included (NCAT, parcels, BAFM, buildings, site).

Checksum (sha256 of assembled TS): `45d613f6405d671012c1f5961d94ac9b0e20c2c5644c5d90a219375521b2e1f0`

Routes restored include:
- GET /api/usgs-telemetry, /api/fema-flood-zones, /api/dnr-floodplain, /api/nws-alerts
- GET /api/layers, /api/historic-sites, /api/pdfs, /api/pdf-search, /api/scenario/:id
- GET /api/transform-elevation, /api/turbovec/backup, /api/v23/iso-compliance
- POST /api/v1/twin/simulate, /api/archimedes/generate, /api/turbovec/compress
- POST /api/chat, /api/analyze-pdf, /api/policy/validate, /api/sde/partition
- POST /api/v23/telemetry, /api/layers/toggle
- Plus /api/gis/* from registerGisRoutes
