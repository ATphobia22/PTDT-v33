# Project status matrix (“get all / do all / bless all”)

**Blessed** here means: documented, runnable, truth-filtered, and fit for **engineering support**.  
It does **not** mean PE-sealed, IDNR-approved, FEMA-determined, or grant-awarded.

## In-repo — blessed

| Area | Status |
|------|--------|
| Archimedes draft PDFs + health API | ✅ |
| NAVD 88 hard-check on BCA JSON | ✅ |
| Readiness gates JSON + SHA-256 | ✅ |
| Math gates pytest (Manning screen, 1.20× cut/fill) | ✅ |
| USGS / NRCS / OpenFEMA proxy path | ✅ |
| Anti-fabrication policy | ✅ |
| HEC-RAS requirements + Manning + sensitivity docs | ✅ |
| Indiana funding map (LARE, CWI, 319, HMA) | ✅ |
| Zero-key MapLibre demos (sovereign, GLSL, photoreal path) | ✅ |
| Quantum QEC/Qiskit removed from physics path | ✅ |
| CI: node build hard; python package/pytest/readiness hard; Archimedes Docker health | ✅ |
| Web sources inventory | ✅ |

## External — not blessable in git

| Area | Status |
|------|--------|
| PE-sealed survey (LAG/FFE) | ⬜ Owner + surveyor |
| HEC-RAS existing vs proposed model-of-record | ⬜ PE |
| Official FEMA BCA Toolkit run | ⬜ Analyst / PE |
| Agency determination letters | ⬜ FEMA / IDNR |
| Site drone photoreal mesh | ⬜ Capture + ODM |

## Optional polish (scripts ready)

| Item | Path |
|------|------|
| PMTiles build example | `scripts/build_pmtiles_example.sh` |
| LiDAR → Terrarium example | `scripts/lidar_to_terrarium_example.sh` |
| Demo hub | `demos/index.html` |

## One-command demo hub

```bash
npm run demos
# or: python -m http.server 8080
# open http://localhost:8080/demos/
```
