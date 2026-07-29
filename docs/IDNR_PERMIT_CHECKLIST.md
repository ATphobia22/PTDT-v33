# IDNR Division of Water — permitting & FARA checklist

**Authority:** Indiana Flood Control Act (IC 14-28-1) and 312 IAC 10  
**Location context:** 13101 Bonebank Road, Point Township, Posey County, IN

Use this as an **internal readiness checklist**. Final forms, public notice, and PE seals are legal acts outside this repository.

## Phase 1 — Jurisdiction & data (INFIP / FARA)

- [ ] Query **INFIP** for site BFE / flood elevation points along the relevant stream
- [ ] Generate **FARA** when required (Zone A, unmapped, ≥1 sq mi upstream drainage, known flood-prone)
- [ ] Confirm drainage area vs 1 square mile (640 acre) IDNR floodway trigger
- [ ] Confirm whether work is in floodway vs flood fringe under **BAFL** / FIRM
- [ ] Download and archive the FARA PDF (do not rely on IDNR to store your copy)

## Phase 2 — Typical application components

| Requirement | Description | Project tool support |
|-------------|-------------|----------------------|
| Statement of affirmation | Applicant signature on current state form (e.g. Form 56471 family — confirm current number) | Manual |
| Technical worksheets | Cross-section flow & storage | **HEC-RAS** / PE analysis; repo Manning helpers are **screening only** |
| No-Rise certification | Indiana PE seal; **no increase** to BFE in the certified statement | PDF **draft** from `python/norise_certificate_draft.py` |
| Compensatory storage | Project screen factor **1.20×** (`V_cut ≥ 1.20 · V_fill`) | `calculate_compensatory_storage()` — confirm with reviewer |
| Public notice | Adjacent owners per IDNR rules | Manual |

**Note on 1.20×:** Project engineering factor in code. Confirm volumetric method required by the specific IDNR reviewer / local ordinance before filing.

**Note on “0.15 ft” language in secondary PDFs:** Do not treat informal ceilings as a soft pass. PE No-Rise statements are written as **no rise** (0.000 ft) unless the PE and IDNR agree otherwise in writing.

## Phase 3 — After PE seal

- [ ] Submit through IDNR e-application / current Division of Water channels
- [ ] Retain FARA PDF, HEC-RAS model-of-record, and SHA-256 hashes of exhibits in local archive

## Explicit rejects from ingested PDFs

- Any document ending in `DECISION: APPROVED_CERTIFIED_TRI_STATE_NO_RISE` from software alone
- Treating SQLite ledgers or SHA seals as IDNR approval
