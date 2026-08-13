# HEC-FIA (Flood Impact Analysis) — scope for PTDT

**Owner:** USACE Hydrologic Engineering Center (public downloads available).  
**Current line:** HEC-FIA **3.4.x** (Windows).  
**Role:** **Single-event consequence** model — not a hydraulic solver and not a substitute for FEMA BCA Toolkit BCR.

## What it estimates

| Consequence | Typical hydraulic needs |
|---|---|
| Structure / content / car damage | Max depth (+ structure inventory) |
| Agricultural loss | Depth, duration, timing + crop inventory |
| Life loss (simplified) | Depth, duration, depth×velocity, arrival time + population |
| Critical infrastructure impact | Grids or hydrographs + inventory |
| Flood damages **reduced** | With-project vs without (holdout / levee configurations) |

## Hydraulic inputs

- Geo-referenced **grids** (depth, arrival, duration, depth×velocity), and/or  
- **HEC-DSS** stage/flow hydrographs with rating curves  

Often fed from **HEC-RAS** results (or CWMS / HEC-WAT workflows).

## Inventories

- Structure inventories (including **National Structure Inventory** import paths)  
- Agriculture (area–elevation or NASS layers)  
- Occupancy types with depth–percent damage curves  

## Uncertainty

Optional Monte Carlo sampling on inventory / susceptibility parameters for a **single** event distribution of outcomes.

## HEC-FIA vs related tools

| Tool | Question it answers |
|---|---|
| **HEC-RAS** | How does water move / what depths occur? |
| **HEC-FIA** | Given this event, what are damages / life-loss / ag impacts? |
| **HEC-FDA** | Expected annual damage across many events (planning frequency) |
| **FEMA BCA Toolkit** | Benefit–cost ratio for grant eligibility (BRIC/HMGP) |
| **HEC-LifeSim** | Higher-fidelity warning / evacuation / traffic life-loss |

## PTDT integration boundary

| Use | Do |
|---|---|
| Scenario consequence screens | Feed sealed RAS depth/arrival grids + site structure inventory |
| LOMA eligibility | **Not** HEC-FIA — use surveyed LAG/BFE |
| Sealed BCR for BRIC | **FEMA BCA Toolkit + PE**, not FIA alone |
| Presentation | FIA tables/maps as impact narrative; SHA-256 seal inputs |

## Links

- https://www.hec.usace.army.mil/software/hec-fia/  
- Downloads / 3.4.x release notes on same site  

## Related

- `docs/ptdt-v33/GRANT_STACK_AND_BRIC.md`
- `docs/ptdt-v33/DAUBERT_AND_SOLVER_AUTHORITY.md`
