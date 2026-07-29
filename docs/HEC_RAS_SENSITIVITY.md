# HEC-RAS sensitivity analysis methods

Sensitivity is part of PE model documentation for No-Rise / floodway review. Repo screens do **not** replace it.

## What to vary

| Parameter | Typical approach |
|-----------|------------------|
| **Manning \(n\)** | Base case + high/low band (e.g. ±10–20% or land-cover alternatives) on channel and overbank separately |
| **Boundary conditions** | Alternate downstream stage or rating; alternate upstream hydrograph scale |
| **Terrain / mesh** | Coarser vs refined mesh near project; optional DEM source comparison |
| **Structure losses** | Bridge/culvert coefficient range if structures control |

## Procedure (existing vs proposed)

1. Lock **base** existing and proposed plans (same hydrology).  
2. For each sensitivity case, change **one** parameter family (e.g. only overbank \(n\)).  
3. Re-run **both** existing and proposed under that case.  
4. Report **ΔWSE** at critical sections for base and each case.  
5. Confirm Indiana No-Rise target (**0.00 ft**) still holds, or document exceedance.  
6. Tabulate results in the PE report (not in auto-cert code).

## Repo defaults (screening only)

- \( n = 0.045 \) floodplain, \( S = 0.00015 \) — see `docs/HEC_RAS_MANNING_AND_VALIDATION.md`  
- Do not claim sensitivity is complete because the coupler ran once.

## References for PE practice

- USACE HEC-RAS User’s / 2D Modeling Manuals  
- FEMA/state reviewer expectations for map change and floodway studies  
