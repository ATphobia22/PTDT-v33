# Grant stack & BRIC / HMA data requirements

## Verified BRIC window (FY 2024–25 opportunity)

| Item | Value |
|---|---|
| Portal | **FEMA GO** |
| Close | **23 July 2026, 15:00 ET** (applicant deadline) |
| Funding opportunity | ~**$1B** total (national competition + set-asides) |
| Subapplicants | State deadlines **earlier** — coordinate Indiana SHMO |

Sources: FEMA BRIC program page / NOFO fact sheet (2026 cycle).

## LOMA / elevation data standards

| Requirement | PTDT value |
|---|---|
| Datum | **NAVD88** |
| LAG ≥ BFE | **377.2 ≥ 375.0** |
| Forms | MT-EZ / Online LOMC |
| LiDAR | Site **5 cm** claim vs Risk MAP ~1 m class |

## BCA (BRIC / HMA)

- Use official **FEMA BCA Toolkit** only for sealed BCR  
- Document structure replacement value, elevations, avoided losses  
- Repo engineering constant **BCR = 1.41** vs Legal Bonding **2.45** → **PE Toolkit run decides**; do not hard-code dual values into package generator  

## Grant stack (program names — eligibility case-by-case)

| Program | Typical role in stack |
|---|---|
| **FEMA BRIC** | Pre-disaster mitigation (federal share often up to ~75% class; confirm NOFO) |
| **HMGP** | Post-disaster mitigation when declared |
| **Indiana LARE** | Aquatic / habitat restoration cost-share (state rules) |
| **IDNR Local Flood Mitigation** | State flood mitigation share (confirm current program name/rate) |
| **USDA REAP** | Rural energy infrastructure (if pumps/power modernization qualifies) |
| **USACE §204** | Beneficial use of dredged material in connection with **authorized federal navigation** dredging — feasibility often federally funded; construction cost-share beyond base plan; **not** a free unlimited clay voucher |

**§204 reality check:** Authority is WRDA 1992 §204 (as amended), Continuing Authorities. Requires federal navigation nexus, sponsor, feasibility, and cost-share rules. In-kind material claims need USACE project alignment — do not treat PDF “$22M in-kind” as booked until USACE documents it.

## Zero local cash match strategy (architecture intent)

1. Maximize federal/state shares per NOFO  
2. Seek §204 beneficial-use material only where navigation dredging exists  
3. Document in-kind valuations for match **only with sponsor/agency letters**  
4. BCA + EHP + technical feasibility packages generated from sealed twin  

## Package generator hooks

`POST /api/v1/package/generate` should emit folder skeleton `01_`…`05_` + SHA-256 manifest; never invent BCR or §204 dollar figures without PE/agency input.

## Related

- `docs/ptdt-v33/MATERIAL_TRUTH_PACKAGE.md`
- `docs/ptdt-v33/PRECISION_LOCK_AND_INCONSISTENCIES.md`
- FEMA BRIC: https://www.fema.gov/grants/mitigation/learn/building-resilient-infrastructure-communities
