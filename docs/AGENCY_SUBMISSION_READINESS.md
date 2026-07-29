# Agency submission readiness (combined)

Use this as a **project control sheet**. Nothing here files itself. PE seal + official portals required.

## A. FEMA LOMA (natural high ground path)

**Portal:** FEMA Online LOMC (not homemade OAuth / GO scripts)

| Gate | Status | Owner |
|------|--------|-------|
| Natural ground (no fill under structure) | ☐ | Survey / owner |
| LAG > BFE, same datum (NAVD 88) | ☐ | Survey PE |
| Deed / tax plat | ☐ | County |
| PE-sealed topo / elev exhibit | ☐ | Indiana PE |
| MT-EZ / Online LOMC fields complete | ☐ | Applicant + PE |
| FARA archived (if Zone A / unmapped / drainage trigger) | ☐ | INFIP download |
| Community # / FIRM panel re-checked on MSC | ☐ | Applicant |

Project constants to **verify**, not trust blindly: LAG 377.2 ft, BFE 375.0 ft, NAVD 88.

## B. IDNR floodway / Construction in a Floodway

**Authority:** IC 14-28-1, 312 IAC 10  
**Tools:** INFIP, FARA, IDNR e-application / current Division of Water forms

| Gate | Status | Owner |
|------|--------|-------|
| INFIP query for site BFE / stream | ☐ | Applicant |
| Drainage area ≥ 1 sq mi assessed | ☐ | PE / hydrology |
| Floodway vs fringe determination (BAFL + FIRM) | ☐ | PE |
| FARA generated + archived | ☐ | INFIP |
| Technical worksheets (cross-section / storage) | ☐ | HEC-RAS + PE |
| No-Rise **PE-signed** (0.000 ft language as PE states) | ☐ | Indiana PE |
| Compensatory storage method accepted by reviewer | ☐ | PE (project screen uses 1.20×) |
| Public notice / adjacent owners | ☐ | Applicant |
| Affirmation / state forms signed | ☐ | Applicant |

## C. BRIC / mitigation funding (if pursued)

| Gate | Status | Owner |
|------|--------|-------|
| IDHS eGrants path identified | ☐ | Applicant |
| FEMA BCA Toolkit run (not invented BCR) | ☐ | PE / BCA analyst |
| Scope, budget, SOW consistent with PE models | ☐ | Project team |

## D. Repo helpers (templates only)

```bash
pip install reportlab numpy pytest
python python/pe_transmittal_draft.py
python python/norise_certificate_draft.py
python python/better_data_package.py
python python/hec_ras_coupler.py   # SCREENING_ONLY
pytest tests/test_math_gates.py -q
```

## E. Rejected labels (never put on filed docs)

- `APPROVED_CERTIFIED_TRI_STATE_NO_RISE`
- `APPROVED_CERTIFIED_NO_RISE` from code governors
- “Software is Daubert compliant” without PE-run HEC-RAS + survey
- Automated FEMA GO OAuth submission scripts
