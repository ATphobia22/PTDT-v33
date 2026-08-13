# HEC-RAS roughness calibration (Manning n)

## Why n is calibrated

Channel and floodplain **n** are primary uncertainty drivers in water-surface profiles. Prefer calibration to **observed stages / ratings / HWMs** over lookup tables alone.

## Manual workflow (recommended order)

1. Fix geometry (terrain, ineffective areas, bridges) before adjusting n  
2. Steady runs: low → bankfull → high discharges  
3. Calibrate **main-channel n** at bankfull first (≈ 1.5–2 yr)  
4. Work **downstream → upstream**  
5. Calibrate **overbank n** on large events  
6. Unsteady: match timing, peak, volume, shape; then stages  
7. Optional **flow-vs-roughness factors** for stage-dependent n  

## Flow vs roughness factors (1D)

- Multiplier applied to base n by flow magnitude (or exponentially spaced zones)  
- Factor = 1.0 at the calibration flow means base n is used as-is  
- Factors ≠ 1.0 scale effective n (e.g. 1.1 → n × 1.1)  

## Automated unsteady calibration (built-in)

| Requirement | Detail |
|---|---|
| Base n | Initial Manning n on all XS |
| Flow–roughness tables | Placeholders (often 1.0) per reach |
| Observed data | Stage hydrographs on calibration reaches (flow optional) |
| Modes | **Global** (all reaches together) or **Sequential** (upstream → downstream) |
| Objective | Reduce squared error between computed and observed WS until tolerance or max iterations |
| Output | Updated **flow vs roughness factors** per reach / flow zone |

Access: Unsteady Flow Analysis → Options → **Automated Roughness Calibration**.

## 2D roughness

| Mechanism | Role |
|---|---|
| Land-cover n layer | Initial spatial n |
| **Calibration Regions** | Polygon overrides (geometry-specific; base layer unchanged) |
| Flow roughness factors on regions | Factor vs **region outflow** (RAS ≥ 6.6) |
| Priority | Last region in draw order wins on overlaps |

## PTDT defaults (starting only)

| Surface | n |
|---|---|
| Floodplain brush / ag | **0.045** (sensitivity 0.030–0.050) |
| SIR 2016-5119 channel | 0.023–0.044 |
| SIR 2016-5119 overbank | 0.048–0.144 |

Never promote uncalibrated defaults into sealed No-Rise packages.

## Related

- `docs/ptdt-v33/HEC_RAS_CALIBRATION.md`
- `docs/ptdt-v33/HEC_RAS_2D_CALIBRATION_REGIONS.md`
