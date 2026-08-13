# Physics state diffing

**Authority:** full sealed `Box3DPhysicsState` remains forensic truth. Diffs are transport-only.

## Algorithm

1. Index bodies by `entity_id` (reject duplicates).
2. Classify each id: **added** / **removed** / **updated** / **unchanged**.
3. Equality uses epsilons: pos `1e-4`, quat `1e-5`, vel/ang `1e-4`.
4. Require `current.sequence > previous.sequence`.
5. Carry `to_seal` = target full-state seal for client audit.

## Keyframe heuristic

Send full envelope when:

- no previous state, or
- `change_count / body_count ≥ 0.45`, or
- `change_count ≥ 2048`

## Modules

| Path | Role |
|---|---|
| `engine/cinematic_runtime/state_diff.py` | `diff_states` / `apply_diff` |
| `engine/cinematic_runtime/physics_stream_broadcaster.py` | Redis → WS (+ optional diff) |
| `tests/test_box3d_contract.py` | Seal + diff unit tests |

## WebGPU

See `engine/cinematic_runtime/turbovec_diff_wgsl.md` — GPU may cull derived visuals; **CPU seal is mandatory**.
