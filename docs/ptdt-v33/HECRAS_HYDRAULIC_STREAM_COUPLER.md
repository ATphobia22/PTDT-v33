# HEC-RAS 2D hydraulic stream coupler — accuracy audit

## Verified HDF paths (HEC RAS Mapper / ras-commander)

| Dataset | Path under plan `.p##.hdf` | Topology |
|---|---|---|
| **Water Surface** | `…/Unsteady Time Series/2D Flow Areas/{name}/Water Surface` | **Cell** (time × cell) |
| **Face Velocity** | `…/Face Velocity` | **Face** normal (time × face) |
| Optional cell velocity | Requires **HDF5 Write Parameters** | Cell center |

## Bugs fixed vs draft snippet

| Issue | Draft | Corrected |
|---|---|---|
| Seal | OK order | Explicit **exclude seal** in `_compute_seal` |
| Face Velocity as cell | Opened unused | Documented; never zip with WSE |
| WxH GPU texture | Assumed structured grid | **Unstructured mesh** — rasterize or 1D storage |
| Units | Implicit | Tag `units` + `vertical_datum=NAVD88` |
| Zero-copy claim | Overstated | `writeTexture` is still a **copy** |

## Module

`backend/services/hecras_hydraulic_stream_coupler.py` · stream `ptdt:scene:hydraulics`
