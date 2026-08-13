# Precision lock & inconsistency register (rescan)

**Purpose:** Single source of truth for numbers that appear in multiple PDFs/docs.  
**Rule:** Prefer **sealed NAVD88 elevations** over narrative marketing figures until PE-certified BCA replaces them.

## Locked Material Truth elevations (consistent across PDFs)

| Quantity | Value | Status |
|---|---|---|
| **BFE** | **375.0 ft NAVD88** | Locked |
| **LAG** | **377.2 ft NAVD88** | Locked (5 cm LiDAR claim) |
| **FFE** | **382.5 ft NAVD88** | Locked in triggers + Legal Bonding |
| **Clearance** | **+2.2 ft** (LAG − BFE) | Locked — Pure LOMA path |
| Vertical datum | **NAVD88 only** | NGVD29 rejected |
| CRS | **EPSG:2966** | Project meters |
| Gage (Wabash FIM / New Harmony) | **03378500** | SIR 2016-5119 |
| Gage (Myers ops stages) | **03322420** / UNWK2 | Stage ≠ NAVD88 |

File of record: `data/property_flood_triggers.json` → `navd88_material_truth`.

## Documented discrepancies (do not silently merge)

| Topic | Source A | Source B | Resolution |
|---|---|---|---|
| **BCR** | Engineering / BCA export **1.41** | Legal Bonding PDF **2.45** | Keep **both labeled**. Sealed package uses PE-run FEMA BCA Toolkit result only. Until then HUD shows `BCR_STATUS=UNVERIFIED_DUAL`. |
| **Berm crest** | PTDT berm math **379.8** (+4.8 vs BFE) | Legal Bonding “Archimedes Berm **384 ft**” | Treat **379.8** as design freeboard crest target; **384** as alternate narrative elevation — **not** interchangeable. PE geometry governs. |
| **Manning n** | Material Truth **0.045** (floodplain) | USGS SIR 2016-5119 channel **0.023–0.044**, overbank **0.048–0.144** | Site models must document calibrated n; 0.045 is a **starting** floodplain value, not USGS FIM output. |
| **Energy slope S** | **0.00015** (docs) | Site-specific RAS calibration | Use only if RAS sensitivity documents it. |
| **Hydro authority** | Daubert: **HEC-RAS / TUFLOW** | Marketing: Houdini/Moonray FLIP as “evidence seal” | FLIP = **visual evidence only**. Sealed hydro = RAS/TUFLOW. |
| **Archimedes** | Regulatory gates + 1.20× storage | Sometimes described as full hydrodynamic engine | **Constraint authority**, not replacement 2-D solver. |

## Freeboard vector

| Relation | Value |
|---|---|
| Berm design crest vs BFE | 379.8 − 375.0 = **4.8 ft** |
| LAG vs BFE | 377.2 − 375.0 = **2.2 ft** |
| FFE vs BFE | 382.5 − 375.0 = **7.5 ft** |

## Wiring checklist (rescan)

| Component | Expected | Gap if missing |
|---|---|---|
| `data/property_flood_triggers.json` | Myers stages + NAVD88 block | Present |
| BAFL Posey download | County shp + elev pts | Manual under `data/geo/` |
| USGS FIM depth grids | SIR 2016-5119 package | Manual under `data/flood_xs/` or `data/cog/` |
| bonebank_buildings.geojson | Real footprints | Still replace empty if present |
| MapLibreDeckHybrid | Tile cache + culling | Verify App wires hybrid |
| HEC-RAS automation | `rascmd` / subprocess | Headless path needs installed RAS |
| MODFLOW6 runner | Fail-closed STALE | Must not promote failed heads |
| SHA-256 plate seal | `composition_stack.json` | Surface on HUD |

## Related

- `docs/ptdt-v33/MATERIAL_TRUTH_PACKAGE.md`
- `docs/ptdt-v33/GRANT_STACK_AND_BRIC.md`
- `docs/ptdt-v33/DAUBERT_AND_SOLVER_AUTHORITY.md`
