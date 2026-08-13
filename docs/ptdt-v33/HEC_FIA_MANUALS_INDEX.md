# HEC-FIA manuals index (searched)

Sources:
- User Manual purpose: https://www.hec.usace.army.mil/confluence/fiadocs/fiaum/v3.4/introduction/purpose
- Technical Reference: https://www.hec.usace.army.mil/confluence/fiadocs/fiatechref/latest

## Tech Ref structure

| Chapter | Content |
|---|---|
| Hydraulic Event Computation | Inputs, procedures, results from grids / XS / hydrographs |
| Direct Damage | Depth–percent damage × values |
| Life Loss | Structure + evacuation components |
| Indirect Loss | County labor/capital → ECAM inputs |
| Agricultural Damage | Duration / timing sensitive |
| Population Distribution | Day/night populations |
| Monte Carlo Application | Uncertainty sampling |

## Direct damage equation (Tech Ref)

$$
D_i = d_i(\mathrm{depth}, \mathrm{occupancy}) \times v_i
$$

- $d_i$: percent damage from depth–damage curve (building, contents, vehicles, optional “other”)  
- Depth at structure ≈ **max depth − foundation height**  
- If **depth × velocity** exceeds total-loss threshold → **100%** structure/content/vehicle loss  
- Vehicle damage reduced when warning allows population to clear (vehicles used for evacuation)

## User Manual purpose highlights

FIA supports: post-flood assessment, real-time impact, USACE flood-damages-reduced reporting, dam/levee safety consequences.

Minimum hydraulic needs by estimate type (depth vs depth+duration+arrival+depth×v) are tabulated in the Purpose page.

## PTDT boundary

Use FIA for **scenario consequences**; use **BCA Toolkit** for **BRIC BCR**; use **surveyed LAG/BFE** for LOMA.
