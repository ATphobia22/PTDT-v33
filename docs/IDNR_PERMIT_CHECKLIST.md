# IDNR Division of Water — permitting & FARA checklist

**Authority:** Indiana Flood Control Act (IC 14-28-1) and 312 IAC 10  
**Location context:** 13101 Bonebank Road, Point Township, Posey County, IN

Use this as an **internal readiness checklist**. Final forms, public notice, and PE seals are legal acts outside this repository.

## Phase 1 — Jurisdiction & data (INFIP / FARA)

- [ ] Query **INFIP** for site BFE / flood elevation points along the relevant stream
- [ ] Generate **FARA** when required (Zone A, unmapped, ≥1 sq mi upstream drainage, known flood-prone)
- [ ] Confirm drainage area vs 1 square mile (640 acre) IDNR floodway trigger
- [ ] Confirm whether work is in floodway vs flood fringe under BAFL / FIRM

## Phase 2 — Typical application components

| Requirement | Description | Project tool support |
|-------------|-------------|----------------------|
| Statement of affirmation | Applicant signature on current state form | Manual |
| Technical worksheets | Cross-section flow & storage | HEC-RAS / PE analysis; Archimedes gives **simple** storage math only |
| No-Rise certification | Indiana PE seal; no surcharge to BFE | PDF **template** from `archimedes_engine.py` |
| Compensatory storage | Project factor **1.20×** cut ≥ fill (`V_cut ≥ 1.20 · V_fill`) | `calculate_compensatory_storage()` |
| Public notice | Adjacent owners per IDNR rules | Manual |

**Note on 1.20×:** This is the **project engineering factor** encoded in `ArchimedesEngine.compensatory_safety_factor`. Confirm the ratio and volumetric method required by the specific IDNR reviewer / local ordinance before filing. Do not treat software output as a sealed certification.

## Phase 3 — After PE seal

- [ ] Submit through IDNR e-application / current Division of Water channels
- [ ] Retain FARA PDF, model runs, and SHA-256 hashes of exhibits in local archive
