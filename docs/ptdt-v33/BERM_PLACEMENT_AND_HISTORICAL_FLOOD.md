# Berm placement, BFE vs river elevation, geology & historical floods

## 1. BFE vs river elevation (do not conflate)

| Term | Definition | Units / datum | PTDT role |
|---|---|---|---|
| **Gage stage** | Water-surface height above **gage zero** | ft, local gage datum | Telemetry (Myers, Mt. Carmel) |
| **River WSEL** | Water-surface elevation in a vertical datum | ft **NAVD88** (preferred) | Hydraulics / RAS |
| **BFE** | Base Flood Elevation — 1% annual-chance **stillwater** (or wave crest where applicable) **at a location** | ft **NAVD88** | Regulatory / LOMA / freeboard baseline |
| **DFE** | Design Flood Elevation = BFE + freeboard (community/state) | ft NAVD88 | Structure elevation target |
| **LAG** | Lowest adjacent grade | ft NAVD88 | Structure relative to ground |

**Myers (UNWK2 / USGS 03322420)** publishes category elevations in **NAVD88** (e.g. major flood ~371.31 ft NAVD88, gauge zero ~311.31). That is a **mainstem Ohio** water-surface class at the lock-and-dam, **not** the Bonebank parcel BFE.

| Quantity | Value | Source class |
|---|---|---|
| PTDT site **BFE** | **375.0 ft NAVD88** | Sealed site engineering / FARA-reconcile |
| PTDT **LAG** | **377.2 ft NAVD88** | Survey |
| PTDT **berm crest** | **379.8 ft NAVD88** | Design (+4.8 ft freeboard vector vs BFE) |
| Myers major (example) | ~371.31 ft NAVD88 | River gage product |

Conversion path for operations:

```
WSEL_navd88 ≈ stage_ft + gage_zero_navd88
freeboard_margin = berm_crest_navd88 - WSEL_navd88   // site crest vs river surface
structure_margin = LAG - BFE                           // natural clearance at structure
```

Never substitute `stage_ft` for `BFE` without datum + reach hydraulics.

---

## 2. Berm placement mathematics

### Locked geometry (regulatory package defaults)

| Parameter | Symbol | Default |
|---|---|---|
| Length | \(L\) | 850 ft |
| Top width | \(W_t\) | 12 ft |
| Height above grade | \(H\) | 4.5 ft (crest toward 379.8 NAVD88) |
| Side slope | \(z\) | e.g. 3H:1V → \(z=3\) |
| Compensatory factor | \(k\) | **1.20** |

### Prismoidal / trapezoidal cross-section area

Trapezoid with side slopes \(z\)H:1V:

\[
A = H \cdot (W_t + z H)
\]

Approximate fill volume:

\[
V_{\mathrm{fill}} \approx A \cdot L = H (W_t + z H)\, L
\]

### Compensatory storage (floodplain fill offset)

When berm/fill displaces flood storage, required compensatory volume:

\[
V_{\mathrm{comp}} = k \cdot V_{\mathrm{displaced}}
\]

with \(k = 1.20\) (PTDT locked). Displaced volume comes from sealed RAS/cut-fill, not from presentation meshes.

### Freeboard vector

\[
\begin{aligned}
F_{\mathrm{design}} &= z_{\mathrm{crest}} - \mathrm{BFE} \\
&= 379.8 - 375.0 = 4.8\ \mathrm{ft}
\end{aligned}
\]

FEMA **freeboard** is a safety margin above BFE for lowest floor / floodproofing; community may require ≥1 ft; PTDT design crest embeds a larger vector for site resilience.

### Placement constraints (simulation checklist)

| Constraint | Rule |
|---|---|
| Floodway | No rise without certified model (44 CFR 60.3(d)) |
| Fringe fill | Compensatory storage at \(k=1.20\) where required |
| Side slopes | Prefer ≤ 3H:1V vegetated; steeper needs armoring |
| Toe drainage | Positive drainage; avoid trapping water against structure |
| Datum | All elevations **NAVD88**; NGVD29 only with explicit shift |

Pseudo-code (authoritative engine path):

```python
def berm_fill_volume_ft3(length_ft, top_width_ft, height_ft, side_slope_z: float) -> float:
    area = height_ft * (top_width_ft + side_slope_z * height_ft)
    return area * length_ft

def compensatory_required(displaced_ft3: float, k: float = 1.20) -> float:
    return k * displaced_ft3

def crest_ok(crest_navd88: float, bfe_navd88: float, min_freeboard: float) -> bool:
    return (crest_navd88 - bfe_navd88) >= min_freeboard
```

---

## 3. Geological / physiographic context (Posey / Point Township)

| Theme | Relevance |
|---|---|
| Ohio–Wabash confluence lowland | Broad floodplain; low gradients → storage-dominated flooding |
| Alluvial deposits | Fine sediments; high water table; fill compressibility |
| Bone Bank (GNIS levee feature) | Named landform / levee context near site |
| Bedrock / potentiometric maps (IDNR) | Groundwater flow toward Wabash/Ohio — seepage design for berms |
| LiDAR DEM | Authoritative ground for cut-fill and inundation depth grids |

Berm simulation must sit on **sealed DEM + soils**, not photoreal meshes alone.

---

## 4. Historical flooding (Tri-State / Posey)

| Event | Notes |
|---|---|
| **1937** | Record Ohio River basin flood; Posey among hardest-hit; large farmland inundation; martial law in Evansville area |
| **1913** | Second-tier historic Ohio/Wabash catastrophe |
| **2008** | Widespread Indiana flooding (White/Wabash systems); NWS: Point Township farmland/roads flooded (Ohio moderate at Mt. Vernon) |
| **2011** | Notable Wabash high water (e.g. Mt. Carmel / New Harmony era crests) |
| 19th c. | 1806, 1832, 1865, 1872, 1880, 1884 documented in FIS narratives |

USGS flood-inundation map libraries (New Harmony `03378500`, Vincennes `03343010`) provide **stage-indexed depth grids** for scenario playback — label as USGS products; do not treat as site BFE.

### Historical scenario simulation (presentation)

```
for stage in usgs_fim_stages:
    depth_grid = load_usgs_fim(stage)           # presentation
    wsel = stage_to_navd88(stage, gage_meta)  # datum bridge
    hud.show(wsel, source="USGS FIM", authority="presentation")
# Regulatory freeboard still uses sealed BFE + berm crest only
```

---

## 5. Authority boundary

| Layer | May set berm geometry / BFE? |
|---|---|
| Sealed RAS + survey + IDNR FARA | **Yes** (authority) |
| Compensatory storage engine (`k=1.20`) | Yes (with sealed inputs) |
| MapLibre / TurboVec / Box3D | **No** — display only |
| Gage stage HUD | **No** — operations context only |

---

## Related

- `docs/ptdt-v33/TRI_STATE_AGENCY_DATA_VERIFICATION.md`
- `docs/ptdt-v33/ENGINEERING_INVARIANTS.md`
- `backend/hydraulic/vertical_datum.py`
- `backend/services/regulatory_package.py`
