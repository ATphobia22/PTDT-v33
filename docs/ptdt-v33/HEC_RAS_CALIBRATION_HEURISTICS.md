# HEC-RAS automated calibration heuristics (PTDT)

## Native engine (authoritative)

Unsteady **Automated Roughness Calibration** optimizes **flow–roughness factors** so computed WS tracks observed stages.

| Mode | Behavior |
|---|---|
| **Global** | All reaches optimized together |
| **Sequential** | Upstream → downstream, one reach at a time |

Stop when max flow-zone error < tolerance or max iterations reached. Objective uses squared WS error.

## External heuristic (orchestration layer)

Code: `suggest_factor_update` in `hecras_roughness_calibration.py`

```text
delta = computed_peak_ft - observed_peak_ft
new_factor = current_factor * (1 + gain * tanh(delta))
clamp to [min_factor, max_factor]   # default 0.5 … 2.0, gain=0.15
```

| Condition | Action |
|---|---|
| Computed peak **>** observed | Increase factor → higher effective n → higher backwater WS (re-run validates) |
| Computed peak **<** observed | Decrease factor |
| \|delta\| small | Factor ≈ unchanged (tanh saturates slowly) |

**Caveat:** Sign of n vs WS depends on regime (backwater vs steep). Always re-run RAS after factor change; prefer **native** optimizer when licensed RAS is available.

## RMSE gate

| Score | Meaning |
|---|---|
| RMSE ≤ **0.25 ft** | `OK` (default plan tolerance) |
| RMSE > 0.25 ft | `NEEDS_ADJUST` |

## Seed for Bonebank / Wabash approach

| Parameter | Value |
|---|---|
| Channel base n | 0.035 |
| Overbank base n | **0.045** |
| Factor zones | 5k / 25k / 80k cfs @ factor 1.0 |
| Mode | sequential |
| Gage target | **03378500** stages + 2013 HWMs |

## Fail-closed

- No `rascmd` → `SKIPPED` (no invented DSS)  
- Uncalibrated factors must not enter sealed No-Rise package  

## Related

- `backend/services/hecras_roughness_calibration.py`
- `docs/ptdt-v33/HEC_RAS_ROUGHNESS_AUTOMATION.md`
