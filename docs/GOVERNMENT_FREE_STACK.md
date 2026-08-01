# Government-Free Stack — Zero Keys, Zero Hoops

**Audience:** FEMA, IDNR, Posey County, Point Township staff, municipal engineers, and any .gov user who needs to run the Bonebank digital twin without procurement delays or SaaS accounts.

## Promise

| Capability | Cost | Auth |
|---|---|---|
| Archimedes BFE / compensatory storage | Free | None |
| NCAT vertical datum (NGS public API) | Free | None |
| IndianaMap parcels / BAFM (public REST) | Free | None |
| FEMA NFHL flood zones (public REST + offline fallback) | Free | None |
| USGS NWIS stage (public REST + offline fallback) | Free | None |
| Building footprints (local sample + Microsoft ODbL clip) | Free | None |
| MapLibre 3D extrusion | Free (OSS) | None |
| OpenStreetMap basemap tiles | Free | None |
| Gemini chat persona | Optional | Key only if you want cloud AI |
| Databricks CD | Optional | Skipped without secrets |

## ATphobia22 owned assets used in this design

Public / relevant repos under [ATphobia22](https://github.com/ATphobia22):

| Repo | Role |
|---|---|
| **Tri-State-Family-Engineering-System-** (this) | Production Node + GIS + HUD |
| **Point-Township-Digital-Twin** | Parallel Python twin (HEC-RAS coupler, LiDAR, USGS bridge, GIS aggregator) |
| **PTDT-v33** | Sovereign core experiments (Archimedes / No-Rise / OSS photoreal) |
| **godfirst-llm-ml-protocol** | G1P open governance standard — free for all nations/developers |

Private family / studio repos (MiniDeni, TuckerB2B, Quantum-Studio, etc.) are **not** required to operate the municipal twin.

## External free data (no account)

- [Overture Maps](https://overturemaps.org/) — ODbL buildings theme (S3 / Azure public)
- [Microsoft USBuildingFootprints](https://github.com/microsoft/USBuildingFootprints) — ODbL, free download
- [NGS NCAT](https://geodesy.noaa.gov/api/) — official vertical transforms
- IndianaMap / IDNR public FeatureServers
- FEMA NFHL MapServer
- USGS Water Services

## How a government employee starts (5 minutes)

```bash
git clone https://github.com/ATphobia22/Tri-State-Family-Engineering-System-.git
cd Tri-State-Family-Engineering-System-
npm install   # or npm ci
# optional: pip install -r requirements.txt && python archimedes_engine.py
npm run dev   # or: npx tsx server.ts
```

Open `http://localhost:3000`. No signup. No credit card. No Mapbox token.

### Enable GIS routes (one-time)

In `server.ts`:

```ts
import { registerGisRoutes } from "./src/server-gis-routes";
// after app.use(express.json()) and before registerAIRoutes:
registerGisRoutes(app);
```

Endpoints: `/api/gis/ncat`, `/api/gis/parcels`, `/api/gis/bafm`, `/api/gis/buildings`, `/api/gis/site`.

## License

Apache-2.0 — government reuse, modification, and redistribution allowed. See `LICENSE`.

## Related free protocol

[GodFirst LLM/ML Protocol (G1P)](https://github.com/ATphobia22/godfirst-llm-ml-protocol) — open governance for AI systems; freely given.
