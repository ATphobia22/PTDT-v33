# PTDT v32 Numerical Verification Plan

## 1. Overview
The Tri-State Digital Engineering System (PTDT) requires rigorous numerical verification to ensure that the integrated multi-physics solvers (HEC-RAS, MODFLOW, SWMM) produce numerically stable, mass-conservative, and regulatory-compliant results (FEMA, USACE, Indiana DNR standards).

## 2. Verification Methodologies

### 2.1 Mesh and Timestep Convergence Testing
To ensure results are independent of discretization, automated convergence pipelines run background checks on critical infrastructure regions:
*   **Spatial Convergence (Grid Refinement)**: Successive model runs with cell sizes $\Delta x, \Delta x/2, \Delta x/4$.
*   **Temporal Convergence**: Successive runs with Courant-Friedrichs-Lewy (CFL) constraint checks at $\Delta t, \Delta t/2, \Delta t/4$.
*   **Success Criteria**: Richardson extrapolation error must fall below the target thresholds defined in Section 3.

### 2.2 Mass and Volume Conservation
*   **HEC-RAS 2D**: Cumulative volume error must not exceed $0.1\%$ across the computational domain.
*   **MODFLOW 6**: Global flow balance error must be $< 0.1\%$. Discrepancies are flagged and halt the DAG execution.
*   **SWMM**: Surface runoff routing and node continuity errors strictly $< 0.5\%$.

### 2.3 Coupled Interface Verification
When solvers communicate via OpenMI (e.g., SWMM discharging to HEC-RAS):
*   Flux matching is verified at every boundary transfer step.
*   $Q_{in}$ (Target) = $Q_{out}$ (Source) $\pm \epsilon$, where $\epsilon$ is numerical precision noise (e.g., $1 \times 10^{-6}$ m³/s).

## 3. Tolerance Standards
| Metric | Solver | Maximum Allowable Error |
|--------|--------|-------------------------|
| Hydraulic Elevation (WSE) | HEC-RAS | 0.01 ft |
| Velocity | HEC-RAS | 0.05 ft/s |
| Groundwater Head | MODFLOW | 0.02 ft |
| Catchment Runoff | SWMM | 1.0% |
| Factor of Safety (FoS) | Bishop | 0.05 |
| Scour Depth | Sediment | 0.1 ft |

## 4. Automated Verification Triggers
The CI/CD pipeline triggers the Verification DAG upon:
1.  Solver binary updates (e.g., upgrading to a new HEC-RAS engine).
2.  Mesh topography updates (e.g., new LIDAR ingestion).
3.  Changes to physical parameterization (e.g., Manning's $n$ calibrations).
