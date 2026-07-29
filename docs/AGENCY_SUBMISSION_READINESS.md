# Agency submission readiness (combined)

Use this as a **project control sheet**. Nothing here files itself. PE seal + official portals required.

## Machine-readable export

```bash
python python/readiness_export.py
# → 05_better_data_agency_package/09_readiness_gates.json

# Optional status overlay:
# {"gates": [{"id": "A2", "status": "in_progress"}, {"id": "B1", "status": "done"}]}
python python/readiness_export.py --overlay my_status.json
```

Statuses: `not_started` | `in_progress` | `blocked` | `done`

## A. FEMA LOMA (natural high ground path)

**Portal:** FEMA Online LOMC (not homemade OAuth / GO scripts)

| Gate | ID | Owner |
|------|-----|-------|
| Natural ground (no fill under structure) | A1 | survey/owner |
| LAG > BFE, same datum (NAVD 88) | A2 | survey PE |
| Deed / tax plat | A3 | county |
| PE-sealed topo / elev exhibit | A4 | Indiana PE |
| MT-EZ / Online LOMC fields complete | A5 | applicant + PE |
| FARA archived (if Zone A / unmapped / drainage trigger) | A6 | INFIP download |
| Community # / FIRM panel re-checked on MSC | A7 | applicant |

Project constants to **verify**, not trust blindly: LAG 377.2 ft, BFE 375.0 ft, NAVD 88.

## B. IDNR floodway / Construction in a Floodway

**Authority:** IC 14-28-1, 312 IAC 10  
**Tools:** INFIP, FARA, IDNR e-application / current Division of Water forms

| Gate | ID | Owner |
|------|-----|-------|
| INFIP query for site BFE / stream | B1 | applicant |
| Drainage area ≥ 1 sq mi assessed | B2 | PE / hydrology |
| Floodway vs fringe determination (BAFL + FIRM) | B3 | PE |
| FARA generated + archived | B4 | INFIP |
| Technical worksheets (cross-section / storage) | B5 | HEC-RAS + PE |
| No-Rise **PE-signed** (0.000 ft language as PE states) | B6 | Indiana PE |
| Compensatory storage method accepted by reviewer | B7 | PE (project screen uses 1.20×) |
| Public notice / adjacent owners | B8 | applicant |
| Affirmation / state forms signed | B9 | applicant |

## C. BRIC / mitigation funding (if pursued)

| Gate | ID | Owner |
|------|-----|-------|
| IDHS eGrants path identified | C1 | applicant |
| FEMA BCA Toolkit run (not invented BCR) | C2 | PE / BCA analyst |
| Scope, budget, SOW consistent with PE models | C3 | project team |

See `docs/FEMA_BCA_TOOLKIT.md`.

## D. Repo helpers (templates only)

```bash
pip install reportlab numpy pytest
python python/pe_transmittal_draft.py
python python/norise_certificate_draft.py
python python/better_data_package.py
python python/hec_ras_coupler.py   # SCREENING_ONLY
python python/readiness_export.py
pytest tests/test_math_gates.py -q
```

## E. Rejected labels (never put on filed docs)

- `APPROVED_CERTIFIED_TRI_STATE_NO_RISE`
- `APPROVED_CERTIFIED_NO_RISE` from code governors
- “Software is Daubert compliant” without PE-run HEC-RAS + survey
- Automated FEMA GO OAuth submission scripts
