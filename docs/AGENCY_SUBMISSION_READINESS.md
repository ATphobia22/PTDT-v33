# Agency submission readiness (combined)

Use this as a **project control sheet**. Nothing here files itself. PE seal + official portals required.

## Machine-readable export + SHA-256 validation

```bash
# Fresh export
python python/readiness_export.py

# Set gate statuses from CLI
python python/readiness_export.py --from-existing --set A2=in_progress --set B1=done

# Overlay file
python python/readiness_export.py --overlay my_status.json

# Validate integrity of a saved file
python python/readiness_export.py --validate 05_better_data_agency_package/09_readiness_gates.json
```

Statuses: `not_started` | `in_progress` | `blocked` | `done`

`integrity_sha256` is computed over canonical JSON **excluding** the hash field itself. `--validate` exits nonzero if the file was altered.

## A. FEMA LOMA (natural high ground path)

**Portal:** FEMA Online LOMC

| Gate | ID | Owner |
|------|-----|-------|
| Natural ground (no fill under structure) | A1 | survey/owner |
| LAG > BFE, same datum (NAVD 88) | A2 | survey PE |
| Deed / tax plat | A3 | county |
| PE-sealed topo / elev exhibit | A4 | Indiana PE |
| MT-EZ / Online LOMC fields complete | A5 | applicant + PE |
| FARA archived (if Zone A / unmapped / drainage trigger) | A6 | INFIP download |
| Community # / FIRM panel re-checked on MSC | A7 | applicant |

## B. IDNR floodway / Construction in a Floodway

| Gate | ID | Owner |
|------|-----|-------|
| INFIP query for site BFE / stream | B1 | applicant |
| Drainage area ≥ 1 sq mi assessed | B2 | PE |
| Floodway vs fringe (BAFL + FIRM) | B3 | PE |
| FARA generated + archived | B4 | INFIP |
| Technical worksheets (HEC-RAS model-of-record) | B5 | PE |
| No-Rise PE-signed | B6 | Indiana PE |
| Compensatory storage method accepted | B7 | PE |
| Public notice / adjacent owners | B8 | applicant |
| Affirmation / state forms signed | B9 | applicant |

## C. HMA / mitigation funding (if pursued)

| Gate | ID | Owner |
|------|-----|-------|
| State applicant path (IDHS / FEMA GO) | C1 | applicant |
| FEMA BCA Toolkit run | C2 | PE / BCA analyst |
| Scope/budget/SOW consistent with PE models | C3 | project team |
| FEMA-approved hazard mitigation plan coverage | C4 | local government |

See `docs/FEMA_HMA_REQUIREMENTS.md` and `docs/FEMA_BCA_TOOLKIT.md`.

## Rejected labels

- Software `APPROVED_CERTIFIED_*` decisions
- Invented BCR without Toolkit
- Homemade FEMA GO OAuth “submission APIs”
