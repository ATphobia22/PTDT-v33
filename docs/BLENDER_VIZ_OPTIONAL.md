# Blender vector overlay (optional offline viz)

From PTDT Blender specification — **visualization only**, not HEC-RAS or LOMA evidence.

## Geometry (bpy Curve)

| Parameter | Spec value | Role |
|-----------|------------|------|
| `obj.data.extrude` | 0.15 | Building footprint thickness |
| `obj.data.bevel_depth` | 0.04 | Path line width |
| `spline.use_cyclic_u` | True | Closed building loops |
| `obj.location` z | 0.3 | Hover above terrain mesh |

## Emission colors

| Layer | RGBA |
|-------|------|
| Property boundary (cyan) | (0.0, 0.8, 1.0, 1.0) |
| Ag paths (green) | (0.2, 1.0, 0.4, 1.0) |
| Safe structural (white) | (1.0, 1.0, 1.0, 1.0) |
| Alert (amber-red) | (1.0, 0.2, 0.0, 1.0) |

Emission strength 8–15 for path-traced stills is artistic, not regulatory.

## Do not

- Treat gauge or HEC-RAS color-shift scripts as automatic No-Rise or LOMA proof.  
- Submit Blender stills as model-of-record.  

Prefer **MapLibre + PMTiles** for the interactive product UI (`docs/MAPLIBRE_PMTILES.md`).
