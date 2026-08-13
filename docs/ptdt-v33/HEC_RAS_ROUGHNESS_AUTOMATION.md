# Automating HEC-RAS roughness calibration (PTDT)

## Native RAS feature (still authoritative inside the engine)

Unsteady Flow Analysis → Options → **Automated Roughness Calibration**

Requires:
- Base Manning n on XS / 2D faces  
- Initial **flow vs roughness factor** tables (start at 1.0)  
- Observed **stage** hydrographs on calibration reaches  
- Mode: **Global** or **Sequential**  

Outputs updated flow–roughness factors when squared WS error falls below tolerance.

## PTDT orchestration layer

Code: `backend/services/hecras_roughness_calibration.py`

| Function | Role |
|---|---|
| `CalibrationPlan` / `CalibrationReach` | Serializable plan + zones |
| `export_plan_json` | Write plan for audit / PE package |
| `run_calibration_iteration` | Soft-fail `rascmd` compute envelope |
| `suggest_factor_update` | External heuristic if stages supplied |
| `score_reach` | RMSE vs observations |
| `bonebank_default_plan` | Seed n=0.045 floodplain narrative |

**Does not** replace RAS internal optimizer. When `rascmd` is **SKIPPED**, run calibration in RAS Mapper and import factors back into the plan JSON.

## External optimizers (optional research)

Literature tools (e.g. Raspy-Cal GA, PSO–RAS coupling) can drive n outside RAS; **sealed No-Rise** still requires PE-accepted RAS plan + observed-data documentation.

## Workflow

1. Export `CalibrationPlan` JSON  
2. Set base n + factor zones = 1.0  
3. Attach USGS **03378500** stage series (and HWMs)  
4. Iterate: RAS compute → score RMSE → update factors (native or `suggest_factor_update`)  
5. SHA-256 seal final plan + factors + hydrograph sources  

## Related

- `docs/ptdt-v33/HEC_RAS_ROUGHNESS_CALIBRATION.md`
- `backend/services/hecras_rascmd.py`
