# HEC-RAS HDF5 structure (PTDT reference)

## File roles

| File | Role |
|---|---|
| `Project.g##.hdf` | Geometry (mesh, cell centers, faces) |
| `Project.p##.hdf` | Plan results (WSE, face velocity, summaries) |

## Geometry

`/Geometry/2D Flow Areas/{area}/`

| Dataset | Shape |
|---|---|
| `Cells Center Coordinate` | (n_cells, 2) |
| `Faces FacePoint Indexes` | (n_faces, 2) |
| `Faces Cell Indexes` | (n_faces, 2) |
| `FacePoints Coordinate` | (n_points, 2) |

## Results

`…/Unsteady Time Series/2D Flow Areas/{area}/`

| Dataset | Topology |
|---|---|
| **Water Surface** | time × **cell** |
| **Face Velocity** | time × **face** |

## PTDT mapping

```text
Cells Center Coordinate → uint32 cell index raster
Water Surface[t, :] → sealed 1D wse_1d_mm
```
