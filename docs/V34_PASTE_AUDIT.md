# V34 paste audit (Python master + planetary notes)

## Accepted into repo

| Piece | Location | Notes |
|-------|----------|-------|
| Manning velocity | `services/archimedes_api.py` | Illustrative |
| 1.20× compensatory storage | same | Matches site constant |
| Live USGS 03378500 + 03322000 | `GET /api/v1/usgs` | No 381.2 fake fallback |
| Unsigned ReportLab PDF | `/api/v1/package/generate` | Explicit UNSIGNED |
| BFE 375 / LAG 377.2 | constants in sidecar + `siteConstants` | Locked |
| SHA-256 of payload | governance hash only | Not FIPS-204 |

## Rejected / fixed

| Claim in paste | Action |
|----------------|--------|
| `APPROVED_CERTIFIED_NO_RISE` | Replaced with `ILLUSTRATIVE_ONLY_NOT_PE_SEALED` |
| Fallback stage **381.2** | Removed (confused stage with NAVD88 elevation) |
| Hardcoded FIPS 204 / Dilithium seals | Not implemented |
| Default DB password in DSN | Not committed |
| Missing `import time` in pool | N/A — pool not shipped |
| Planetary EarthOS / 15-agent / 5cm LiDAR as shipped | Documentation only; not product truth |
| Wrong gauge 03377500 in fabric note | Stack uses **03378500** + **03322000** |
| 10 Hz USGS polling | Unrealistic; Node polls ~15s WS / on-demand HTTP |

## Run sidecar

```bash
pip install -r services/requirements-archimedes.txt
python services/archimedes_api.py
# health: http://127.0.0.1:8000/api/v1/health
# usgs:   http://127.0.0.1:8000/api/v1/usgs
```

Primary app remains Node `server.ts` on port 3000 (terrain, NLD, GIS, dual USGS).
