# PTDT v32 Master Document Set
## Tri‑State Digital Engineering System

### Deliverable 1: Numerical Verification Plan
This section details the numerical verification strategies for the integrated solvers to ensure compliance with regulatory standards (FEMA, USACE, Indiana DNR).

- **HEC-RAS 2D**: Automated triggering via CLI batch mode. The system parses WSE grids, velocity fields, infiltration rates, and bed shear stress.
- **MODFLOW 6**: Connected using FloPy. Extracts head distributions, pore pressures, groundwater fluxes, and mesh geometry.
- **SWMM**: Connected using PySWMM. Captures catchment runoff, rainfall intensity, and pipe flow conditions.
- **Sediment & Bishop Models**: Custom modules calculating bed shear stress, scour depth, and slope stability Factor of Safety (FoS).
- **Convergence Testing**:
  - Mesh Refinement: Δx → Δx/2 → Δx/4
  - Timestep Refinement: Δt → Δt/2 → Δt/4
  - Tolerances: Hydraulic Error < 1%, Groundwater Error < 2%, FoS Error < 0.05.

### Deliverable 2: Operational Data Ingestion Plan
Specifies the architecture for continuous real-time data integration.

- **USGS NWIS**: Stream stage, discharge, and temperature data with automated quality flags.
- **NOAA / NWS**: MRMS radar rainfall and CAP XML alerts.
- **Telemetry**: SCADA pump logs, IoT levee sensors, and pressure transducers.
- **Data QC Pipeline**: Real-time outlier detection, drift correction, spatial/temporal interpolation of missing data, and confidence scoring.

### Deliverable 3: Data Assimilation Strategy
Defines the integration of physical models with real-time observations via the Ensemble Kalman Filter (EnKF).

- **State Vector**: Merges hydraulic, groundwater, sediment, and geotechnical states.
- **Observation Operators**: Maps gauges to WSE, radar to rainfall, SCADA to pump flow.
- **Covariance Matrices**: Real-time updating of state (P) and observation (R) covariance matrices.
- **Techniques Applied**: Localization, inflation, and rigorous uncertainty propagation.

### Deliverable 4: DAG Orchestration Architecture
Details the transition from sequential loops to a distributed Directed Acyclic Graph (DAG) using Prefect.

- **Workflow**: SWMM → HEC-RAS → MODFLOW → Sediment → Bishop → Governance.
- **Capabilities**: Distributed execution, checkpointing, retries, partial recomputation, backpressure handling, and event-triggered parallel runs.

### Deliverable 5: Twin State Manager Implementation
Replaces static stores with a temporal-aware datastore (TimescaleDB).

- **Storage Structure**: Time-series tracking of t0...tn snapshots, solver outputs, assimilation results, and uncertainty fields.
- **Features**: Rollbacks, hindcasting, historical replays, and temporal analytics.

### Deliverable 6: Provenance, Evidence, and Security Plan
Ensures a cryptographic chain of custody for all engineering and governance decisions.

- **Supply Chain**: Syft SBOM generation, Cosign container signatures, and strict key rotation policies.
- **Evidence Chain**: Canonical JSON manifests, SHA-256 hashing, ECDSA/JWS signatures, and RFC 3161 timestamping stored in an immutable archive.
- **Security Protocols**: Zero-trust network boundaries, OAuth2/OIDC RBAC, HashiCorp Vault secret management, and comprehensive audit logging.
