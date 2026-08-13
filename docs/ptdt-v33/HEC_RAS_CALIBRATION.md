# HEC-RAS calibration techniques (PTDT)

**Authority:** Sealed hydro = HEC-RAS / TUFLOW only (Daubert). Presentation FIM grids are not calibration substitutes for site No-Rise.

## Ordered calibration workflow (USACE HEC training pattern)

1. **Geometry first** — terrain, ineffective flow areas, bridges/culverts correct before n.
2. **Steady range** — run low→high discharges; match gage ratings + high-water marks (HWMs).
3. **Channel n at bankfull** — calibrate main channel for ~1.5–2 yr events first.
4. **Work downstream → upstream** — downstream WS controls upstream energy.
5. **Overbank n for large events** — adjust floodplain after channel is stable.
6. **Unsteady events** — match hydrograph timing, peak, volume, shape; then stages.
7. **Flow-vs-roughness factors** — stage-dependent n where justified.
8. **2D land-cover layer** — NLCD / local land use → initial n; **Calibration Regions** override polygons without rebuilding land-cover.

## Manning n guidance (starting ranges, not locked)

| Surface | Typical n (2D / non-shallow) |
|---|---|
| Channel, minimal vegetation | 0.02 – 0.04 |
| Open pervious, grass | 0.03 – 0.05 |
| Open pervious, shrubs | 0.05 – 0.07 |
| Open pervious, trees | 0.07 – 0.12 |
| Floodplain heavy brush (PTDT start) | **0.045** (document sensitivity 0.030–0.050) |
| USGS SIR 2016-5119 New Harmony | channel 0.023–0.044; overbank 0.048–0.144 |

**2D vs 1D:** Complex 2D paths often need **15–50% lower** n than equivalent 1D to match the same WS (flow-path complexity tables).

## Observed data for Bonebank / Point Township

| Source | Use |
|---|---|
| USGS **03378500** New Harmony | Rating + SIR 2016-5119 HWMs (Apr 2013) |
| USGS **03322420** J.T. Myers | Ops stage triggers only (not NAVD88 BFE) |
| Tucker heritage crests | Ground-truth narrative; convert carefully before RAS targets |
| Site 5 cm LiDAR | Terrain truth for mesh |

## Metrics

- Stage RMSE / squared error vs observed WS  
- Mass conservation target **< 0.1%**  
- Courant ≤ 1.0 for unsteady stability audits  
- Monte Carlo n sweep (0.030–0.050) for uncertainty band  

## Automation hooks (PTDT)

```python
# Conceptual headless compute (requires licensed HEC-RAS + rascmd on PATH)
import subprocess
subprocess.run(
    ["rascmd", project_path, "-compute", "-silent"],
    check=True,
)
```

- Override unsteady boundary `.u01` from live USGS stages **after QC**.  
- SHA-256 seal plan + DSS/HDF outputs for evidence package.  
- **Never** promote uncalibrated default n to LOMA/No-Rise package.

## Related

- `docs/ptdt-v33/USGS_HEC_RAS_MODEL_INVENTORY.md`
- `docs/ptdt-v33/DAUBERT_AND_SOLVER_AUTHORITY.md`
- `docs/ptdt-v33/PRECISION_LOCK_AND_INCONSISTENCIES.md`
