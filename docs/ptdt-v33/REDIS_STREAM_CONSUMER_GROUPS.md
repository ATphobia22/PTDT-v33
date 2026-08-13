# Redis Stream consumer groups (physics broadcaster)

## Why groups

| Mode | Behavior |
|---|---|
| `XREAD` + `$` | Every subscriber sees every message (fan-out). Fine for 1 broadcaster. |
| **`XREADGROUP`** | Messages distributed across consumers in a group; **XACK** removes from PEL |

PTDT uses group **`ptdt-physics-broadcasters`** on stream **`ptdt:scene:physics`**.

## Lifecycle

1. `XGROUP CREATE ptdt:scene:physics ptdt-physics-broadcasters $ MKSTREAM`
2. `XREADGROUP GROUP … CONSUMER broadcaster-host-pid STREAMS … >`
3. Parse `envelope_json` → Pydantic → **`verify_state_seal`**
4. Diff + WebSocket send
5. **`XACK`** only after successful handle

## Failure modes

| Case | Action |
|---|---|
| Seal fail | Log critical · leave in PEL (no ACK) for inspection |
| Consumer crash | Message remains in PEL → `XCLAIM` after 30s idle |
| Invalid JSON | Same as seal fail |

## Producer side

```python
await redis.xadd("ptdt:scene:physics", {"envelope_json": sealed.model_dump_json()})
```

## Related

- `engine/cinematic_runtime/physics_stream_broadcaster.py`
- `engine/cinematic_runtime/state_diff.py` (O(N) omit unmoved bodies)
