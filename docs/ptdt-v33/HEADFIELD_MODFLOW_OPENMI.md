# HeadField WGSL · MODFLOW6 · OpenMI

## Authority

| Layer | Role |
|---|---|
| **MODFLOW6** | Exclusive groundwater head / flux authority |
| **OpenMI forensic gate** | SW–GW mass-balance fail-closed (PTDT engineering rule) |
| **headField.wgsl** | **Presentation only** — never invents heads |

## Path

```text
mf6 → ModflowResult { status, heads }
  → status==OK only → r32float texture → headField.wgsl
```

STALE/FAILED refuse GPU upload (unless debug `allowStale`).

## OpenMI

Pull-based in-process exchange. Gate: `validate_flux_exchange(surface, groundwater)` tol 0.1% → lock on divergence. Not an IDNR statute by default.
