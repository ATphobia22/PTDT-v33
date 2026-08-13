# Daubert / solver authority & multi-physics boundaries

Source: PTDT Daubert Standard Admissibility Spec + HEC-RAS/MODFLOW design notes + Archimedes sovereign core.

## FRE 702 / Daubert locks

| Rule | Implementation |
|---|---|
| No custom hydro math in sealed path | **HEC-RAS** or **TUFLOW** only for shallow-water authority |
| Governing equations | St. Venant (RAS/TUFLOW); Navier–Stokes / SPH (DualSPHysics) only for local structural wave VFX |
| Stormwater | **PySWMM** (EPA SWMM5) |
| Groundwater | **MODFLOW 6** via FloPy — **fail-closed** runner |
| Geotech | Bishop simplified/rigorous; **FoS ≥ 1.500** (spec); Archimedes sample used ≥ 1.40 gate |
| Structures / riprap | USACE **EM 1110-2-1601**, Isbash |
| Evidence | SHA-256 + HMAC execution signatures → One-Click Legal Verification Bundle |

## Archimedes role

**Regulatory / constraint authority** — deterministic BFE checks, compensatory storage **1.20×**, Tri-State gates.  
**Not** a substitute 2-D hydrodynamic engine.

## MODFLOW6 fail-closed

Detect: missing binary, bad packages, nonzero exit, non-convergence, missing/stale/malformed heads.  
On failure: keep last valid GW state as **STALE**; never promote bad heads to authoritative fusion.

## HEC-RAS ↔ MODFLOW

One-way controlled exchange adapter carries: datum, units, timestamp, CRS, source, run ID, quality, provenance, uncertainty.  
Neither model silently overwrites the other.

## V&V

- Analytical / published FEA benchmarks  
- Tucker Heritage workbook crests (Material Truth calibration)  
- Unmanipulated public streams: Indiana GIO LiDAR, USGS 3DEP, live gages  

## Related

- `docs/ptdt-v33/ENGINEERING_INVARIANTS.md`
- `docs/ptdt-v33/USGS_HEC_RAS_MODEL_INVENTORY.md`
