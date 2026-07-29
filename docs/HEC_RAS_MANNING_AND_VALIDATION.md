# HEC-RAS Manning coefficients and validation steps

## Manning \(n\) — screening defaults in this repo

| Surface | Typical screen \(n\) | Notes |
|---------|----------------------|--------|
| Agricultural floodplain / crops & brush | **0.045** | Matches Archimedes / valuation PDF screen |
| Clean channel (example) | 0.030–0.035 | PE judgment for main channel |
| Dense woods / heavy debris | 0.050–0.100 | Do not hard-code without site visit |

**Energy slope \(S\)** used in repo screens: **0.00015** ft/ft (confluence reach hypothesis). PE must justify from profile or calibration.

Repo coupler and Archimedes velocity functions use these for **SCREENING_ONLY**. Regulatory models set \(n\) by land cover, calibration to gages, and sensitivity tests inside **USACE HEC-RAS**.

## Validation steps (PE HEC-RAS package)

Use as a checklist before IDNR / FEMA technical attachment:

### A. Geometry & datum

1. [ ] Terrain and structure elevations on **NAVD 88** (document NCAT if any transform).  
2. [ ] Existing-conditions geometry complete (channel, overbanks, bridges/culverts).  
3. [ ] Proposed-conditions geometry differs **only** by project features.  
4. [ ] Mesh/cross-section spacing refined near project and structures.

### B. Hydrology & boundary conditions

5. [ ] Design event stated (e.g. 1% annual chance) with source.  
6. [ ] Upstream flow and downstream stage/rating justified.  
7. [ ] Reasonableness vs USGS **03378500** / **03322000** where applicable (context, not blind BC).

### C. Manning & sensitivity

8. [ ] Channel and overbank \(n\) documented with land-cover basis.  
9. [ ] Sensitivity: high/low \(n\) cases show ΔWSE still meets **0.00 ft** No-Rise target (or document failure).  
10. [ ] Do **not** rely on repo default 0.045 alone for the sealed model.

### D. Results comparison

11. [ ] Existing vs proposed WSE profiles/maps at critical sections.  
12. [ ] Max ΔWSE reported; Indiana No-Rise target **0.00 ft**.  
13. [ ] Cut/fill below BFE if required (project screen uses **1.20×** — confirm with IDNR reviewer).

### E. Deliverables

14. [ ] RAS project archive + version number.  
15. [ ] Summary report (assumptions, BC, \(n\), results tables).  
16. [ ] PE seal on No-Rise / floodway submittal.  
17. [ ] Optional: SHA-256 of input archive in repo evidence manifest (integrity only, not approval).

## Repo helpers (non-validation)

```bash
python python/hec_ras_coupler.py          # SCREENING_ONLY friction slope
python -c "from python.hec_ras_coupler import HECRASCoupler; print(HECRASCoupler().compute_2d_flood_extent(381.2,380.8,142000))"
```

Status field must remain **`SCREENING_ONLY`**.
