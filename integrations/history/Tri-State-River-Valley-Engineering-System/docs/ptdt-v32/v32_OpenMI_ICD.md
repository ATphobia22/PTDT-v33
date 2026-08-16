# PTDT v32 OpenMI Interface Control Document (ICD)

## 1. Overview
The Open Modeling Interface (OpenMI) standardizes the data exchange between distinct numerical solvers within the PTDT v32 execution graph. By implementing these Interface Control Documents (ICDs), legacy engines (SWMM, HEC-RAS, MODFLOW) can communicate seamlessly without tight coupling.

## 2. Interface Definitions

### 2.1 gRPC / Protobuf Interface
High-performance, low-latency interoperability is achieved via gRPC. Solvers implement the `SolverIntegration` service defined in `v32_OpenMI_ICD.proto`.

*   **Initialize**: Bootstraps the solver, allocates memory, and loads configuration from the provided `config_uri`.
*   **PerformTimeStep**: Advances the solver by `dt_seconds`. The orchestrator (Prefect) dictates the global time-stepping to avoid race conditions.
*   **GetValues / SetValues**: Extracts or injects boundary conditions and state variables. These RPCs rely on agreed-upon `quantity_id` and `element_set_id` mappings to ensure physical consistency (e.g., mapping SWMM 1D nodes to HEC-RAS 2D boundary cells).
*   **Finish**: Flushes output buffers and gracefully terminates the solver instance.

### 2.2 REST / JSON Schema Bindings
For solvers or analytical tools that do not support gRPC, an HTTP REST abstraction layer is provided. The payloads for `GetValues` and `SetValues` must adhere strictly to `v32_OpenMI_ICD.schema.json`.

*   **Strict Typing**: Quantities are restricted to a defined ontology (e.g., `WaterLevel`, `Discharge`, `PorePressure`) to prevent unit or semantic mismatch.
*   **SI Units**: All data exchanged over the OpenMI boundary must be in SI units (`m`, `m3/s`, `Pa`), overriding any solver-internal unit systems (e.g., US Customary).

## 3. Spatial and Temporal Mapping
Because different solvers operate on different grids (e.g., 1D SWMM links vs. 2D HEC-RAS unstructured cells) and timesteps, the PTDT API Gateway handles:
*   **Spatial Interpolation**: Using Inverse Distance Weighting (IDW) or conservative remapping to transfer fluxes between non-conforming meshes.
*   **Temporal Aggregation**: Accumulating fluxes from a solver running at $\Delta t = 1s$ before passing to a solver running at $\Delta t = 60s$.
