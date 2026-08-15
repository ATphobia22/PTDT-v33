# Six subsystems — authority lock (feature branch)

**Branch policy:** `feature/six-subsystem-authority-lock` only. No merge to main until verified. Do not alter box3d-unity upstream main.

## Critical invariant

```text
HEC-RAS → ValidatedHydraulicState (authoritative)
        → Archimedes SecondaryPhysicsState (geometry/VFX only)
        → PTDT SceneState → OpenUSD | WebGPU ABI | Affidavit
```

### Forbidden

- Fabricated HEC-RAS/DSS/HDF when rascmd unavailable
- Archimedes overwrite of WSE/flux
- Averaging dual BCR (`UNVERIFIED_DUAL`)
- Raw large-world coords in Float32 GPU buffers
- Implicit CRS conversion; silent provenance loss

## OpenMI 2.0 vs 1.4

| 1.4 | 2.0 |
|---|---|
| ILink object | Direct output→input |
| GetValues on component | GetValues on exchange item |
| DataOperations | Adapted outputs |
| Quantitative only | Qualitative allowed |

## WGSL

- `preprocess_dem_wse.wgsl` — compute depth pre-pass
- `turbovec_plate_full.wgsl` — full VS/FS (render-origin relative)
