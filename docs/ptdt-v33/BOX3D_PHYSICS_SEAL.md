# Box3D physics state seal (schema v1)

**Authority:** derived physics/VFX only — never mutates HEC-RAS, MODFLOW, NAVD88 elevations, or regulatory evidence.

## Modules

| Path | Role |
|---|---|
| `engine/cinematic_runtime/box3d_contract.py` | Canonical contract + seal helpers |
| `backend/schemas/box3d_physics.py` | API/worker copy (same schema) |
| `tests/test_box3d_contract.py` | Seal / finite / schema tests |

## Envelope fields

| Field | Constraint |
|---|---|
| `schema_version` | Must equal **1** |
| `sequence` | ≥ 0 monotonic stream id |
| `pipeline_state_version` | Non-empty pipeline tag |
| `state_cryptographic_seal` | SHA-256 hex (64 chars typical) |
| `bodies[]` | ≤ 100_000 · all floats finite · no extra keys |

## Seal algorithm

1. `model_dump(mode="json", exclude={"state_cryptographic_seal"})`
2. `json.dumps(..., sort_keys=True, separators=(",", ":"), ensure_ascii=False)`
3. `sha256(...).hexdigest()`

Unity `PhysicsStateEnvelope.stateCryptographicSeal` must match this digest for accept.

## Helpers

```python
from engine.cinematic_runtime.box3d_contract import seal_state, verify_state_seal

state = seal_state(sequence=1, pipeline_state_version="v33.0", bodies=[...])
assert verify_state_seal(state)
```

## Boundary

```
USGS / NOAA / DEM / HEC-RAS / MODFLOW / EnKF
          → PTDT Authoritative State
          → Redis Streams
     ┌───┐────┐
 WebGPU     Unity → Box3D 0.8.1 (sealed envelope only)
```
