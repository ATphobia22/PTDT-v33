# PTDT v32 Data Assimilation Mathematics (EnKF)

The PTDT data assimilation module employs an Ensemble Kalman Filter (EnKF) to continuously update the physical model states with real-time telemetry (USGS stream gauges, NOAA MRMS radar, and IoT/SCADA sensors).

## 1. State Vector Definition

Let $\mathbf{x}_t \in \mathbb{R}^n$ be the global state vector at time $t$. It concatenates the physical variables across all sub-models:

$$ \mathbf{x}_t = [ h_{2D}, \mathbf{v}_{2D}, H_{GW}, Q_{pipe}, \tau_{bed}, \Delta z_{scour}, \text{FoS} ]^T $$

Where:
- $h_{2D}$: 2D hydraulic water surface elevation across the HEC-RAS mesh.
- $\mathbf{v}_{2D}$: 2D velocity vector field (HEC-RAS).
- $H_{GW}$: Groundwater head distribution (MODFLOW).
- $Q_{pipe}$: Conduit flow rates (SWMM).
- $\tau_{bed}$: Bed shear stress (Sediment module).
- $\Delta z_{scour}$: Scour depth at bridge piers / vulnerable zones.
- $\text{FoS}$: Factor of Safety for slope stability (Bishop).

## 2. Ensemble Generation

To represent the probability density function of the state, we maintain an ensemble of $N$ model states (typically $N \approx 100$):

$$ \mathbf{X}_t = [ \mathbf{x}_{1,t}, \mathbf{x}_{2,t}, \dots, \mathbf{x}_{N,t} ] \in \mathbb{R}^{n \times N} $$

## 3. Forecast Step (Time Update)

Each ensemble member $i$ is propagated forward in time using the non-linear composite model operator $\mathcal{M}$ (which encapsulates HEC-RAS, MODFLOW, SWMM, etc.):

$$ \mathbf{x}_{i,t}^f = \mathcal{M}(\mathbf{x}_{i,t-1}^a, \mathbf{u}_t) + \mathbf{q}_{i,t} $$

Where:
- $\mathbf{u}_t$ represents boundary conditions and forcings (e.g., rainfall, upstream hydrographs).
- $\mathbf{q}_{i,t} \sim \mathcal{N}(0, \mathbf{Q}_t)$ is the stochastic model error added to reflect model structural and forcing uncertainties.

The ensemble forecast mean is:
$$ \bar{\mathbf{x}}_t^f = \frac{1}{N} \sum_{i=1}^N \mathbf{x}_{i,t}^f $$

The forecast error covariance matrix $\mathbf{P}_t^f$ is approximated from the ensemble spread:
$$ \mathbf{P}_t^f \approx \frac{1}{N-1} \sum_{i=1}^N (\mathbf{x}_{i,t}^f - \bar{\mathbf{x}}_t^f)(\mathbf{x}_{i,t}^f - \bar{\mathbf{x}}_t^f)^T $$

*Note: In practice, we operate directly on the ensemble perturbation matrix to avoid forming the massive $n \times n$ matrix $\mathbf{P}_t^f$.*

## 4. Observation Operator and Measurement Vector

Let $\mathbf{y}_t \in \mathbb{R}^m$ be the real-time observation vector at time $t$:
- USGS stream gauges (Stage $h$, Discharge $Q$)
- NOAA MRMS radar (Rainfall intensity)
- SCADA telemetry (Pump flow rates, gate positions)
- IoT piezometers (Pore water pressure / groundwater head)

The observation operator $\mathcal{H}: \mathbb{R}^n \rightarrow \mathbb{R}^m$ maps the model state space to the observation space (e.g., interpolating a 2D mesh water surface elevation to a gauge location).

For the EnKF, if $\mathcal{H}$ is non-linear, we evaluate it directly on each ensemble member: $\mathcal{H}(\mathbf{x}_{i,t}^f)$. If linear, $\mathcal{H}(\mathbf{x}) = \mathbf{H}\mathbf{x}$.

## 5. Analysis Step (Measurement Update)

To update the state based on observations, we compute the Kalman Gain $\mathbf{K}_t$:

$$ \mathbf{K}_t = \mathbf{P}_t^f \mathbf{H}^T (\mathbf{H} \mathbf{P}_t^f \mathbf{H}^T + \mathbf{R}_t)^{-1} $$

Where $\mathbf{R}_t \in \mathbb{R}^{m \times m}$ is the observation error covariance matrix, populated dynamically using the real-time Confidence Scoring from the Data QC pipeline.

To maintain correct posterior statistics in the stochastic EnKF, we perturb the observations for each ensemble member:
$$ \mathbf{y}_{i,t} = \mathbf{y}_t + \mathbf{\epsilon}_{i,t}, \quad \mathbf{\epsilon}_{i,t} \sim \mathcal{N}(0, \mathbf{R}_t) $$

Each ensemble member is then updated (analyzed):
$$ \mathbf{x}_{i,t}^a = \mathbf{x}_{i,t}^f + \mathbf{K}_t (\mathbf{y}_{i,t} - \mathcal{H}(\mathbf{x}_{i,t}^f)) $$

The final assimilated state is the ensemble mean:
$$ \bar{\mathbf{x}}_t^a = \frac{1}{N} \sum_{i=1}^N \mathbf{x}_{i,t}^a $$

## 6. Regularization (Localization and Inflation)

Due to the limited ensemble size ($N \ll n$), spurious long-range correlations and filter divergence can occur. We apply two standard regularizations:

### 6.1 Covariance Localization
We apply a Schur (element-wise) product between the ensemble covariance $\mathbf{P}_t^f$ and a distance-dependent correlation matrix $\mathbf{\rho}$ (e.g., Gaspari-Cohn function):
$$ \mathbf{P}_{localized}^f = \mathbf{\rho} \circ \mathbf{P}_t^f $$
This forces the covariance to zero beyond a specified spatial radius, preventing a gauge in one watershed from improperly updating the state in an unconnected watershed.

### 6.2 Covariance Inflation
To prevent the ensemble spread from collapsing (which causes the filter to ignore new observations), we apply multiplicative inflation factor $\alpha > 1$ (e.g., $\alpha = 1.05$) to the forecast perturbations:
$$ \mathbf{x}_{i,t}^f \leftarrow \bar{\mathbf{x}}_t^f + \alpha (\mathbf{x}_{i,t}^f - \bar{\mathbf{x}}_t^f) $$
