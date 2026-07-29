# HEC-RAS modeling requirements (regulatory orientation)

**Software:** U.S. Army Corps of Engineers **HEC-RAS** (1D and 2D) — official distribution from USACE Hydrologic Engineering Center.  
**Role in this project:** Model-of-record for **Indiana No-Rise / floodway** technical work and supporting better-data exhibits. Repo helpers (`python/hec_ras_coupler.py`) are **screening only**, not a substitute.

## Why HEC-RAS for No-Rise

Indiana floodway / Construction in a Floodway reviews and FEMA CLOMR/LOMR paths expect hydraulic analysis using **accepted methods**. Industry and agency practice centers on **HEC-RAS** (often **2D** for complex overbank / confluence geometry) under **Professional Engineer** supervision.

Typical certified statement language is **no increase** in base flood elevation (0.000 ft) attributable to the project — not a soft software threshold.

## Minimum modeling practice (engineering checklist)

Use this as a **project control list**. The PE and reviewer decide final adequacy.

### Terrain & geometry

- [ ] Terrain from survey-grade and/or approved DEM (NAVD 88), documented source and date  
- [ ] Channel/overbank geometry consistent with field conditions  
- [ ] Structures (bridges, culverts, proposed berms) represented with surveyed openings and elevations  
- [ ] Mesh / cross-section spacing appropriate to gradients and features (2D: refine near structures and project footprint)

### Hydrology / boundary conditions

- [ ] Design event(s) stated (e.g. 1% annual chance) with source (FIS, detailed study, or PE-derived)  
- [ ] Upstream flow and downstream stage/normal depth / rating justified  
- [ ] Calibration or reasonableness check vs gages where data exist (e.g. USGS 03378500 / 03322000 as **context**, not automatic boundary)

### Comparisons required for No-Rise

- [ ] **Existing-conditions** model  
- [ ] **Proposed-conditions** model (same hydrology, only project geometry changes)  
- [ ] Difference map / profile: water-surface elevation change at critical locations  
- [ ] Volumetric cut/fill below BFE if required by IDNR / local rules (project screen uses 1.20× — confirm with reviewer)

### Documentation package

- [ ] HEC-RAS project files (plan, geometry, unsteady/steady as used)  
- [ ] Summary report: assumptions, n-values, mesh, BC, results tables  
- [ ] Electronic results (HDF / profiles / inundation as requested)  
- [ ] PE seal on certification letter / No-Rise form  

### Version & reproducibility

- [ ] HEC-RAS version recorded  
- [ ] Input data hashes or archive of terrain/geometry used  
- [ ] Clear statement that custom scripts did **not** replace the RAS solver

## What is insufficient

| Practice | Problem |
|----------|---------|
| Manning reach formula only | Not a 2D floodway model-of-record |
| Uncertified drone mesh alone | Needs survey control + PE judgment |
| `APPROVED_CERTIFIED_NO_RISE` from app code | Not an agency decision |
| Skipping existing vs proposed comparison | Cannot demonstrate no rise |

## Official software / training pointers

- USACE HEC downloads and manuals (HEC-RAS User’s Manual, 2D Modeling Manual) from the Hydrologic Engineering Center site  
- FEMA guidance for map changes still expects competent hydraulic analysis; CLOMR/LOMR have their own form and data requirements beyond pure state No-Rise  

## Repo boundary

```text
python/hec_ras_coupler.py  → SCREENING_ONLY friction-slope estimate + optional HDF open
PE HEC-RAS project          → model-of-record for filing
```
