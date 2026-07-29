# FEMA Hazard Mitigation Assistance (HMA) — requirements snapshot

**Primary guide:** [Hazard Mitigation Assistance Program and Policy Guide](https://www.fema.gov/grants/mitigation/learn/hazard-mitigation-assistance-guidance)

HMA is the family of FEMA mitigation grant programs. Always confirm the **current NOFO**, state (IDHS) instructions, and HMA Guide version before filing. This page is orientation only.

## Programs commonly discussed

| Program | Trigger / nature | Notes |
|---------|------------------|--------|
| **BRIC** | Competitive / NOFO-driven building resilience | Apply via **FEMA GO**; subapplicants typically go through the **state** (Indiana: IDHS). Individuals/homeowners are **not** direct applicants. |
| **HMGP** | After a **Presidential major disaster** (or related authority) | Statewide mitigation pot; local governments apply; homeowners are not direct applicants. |
| **FMA** | Flood Mitigation Assistance (NFIP-related) | Separate NOFO rules; NFIP community participation often required. |

Guide applicability (high level): HMA Guide **v2.1** effective **Jan 20, 2025** for specified BRIC/FMA/HMGP cohorts — verify against the live FEMA page for your funding year.

## Core eligibility themes (typical)

1. **Eligible applicant / subapplicant** — State, local government, tribal government, certain special districts — **not** private individuals as direct applicants. Locals may sponsor projects that benefit private property under program rules.
2. **Hazard mitigation plan** — FEMA-approved (and locally adopted) mitigation plan coverage is generally required for **project** grants.
3. **Cost-effectiveness** — Documented via **FEMA BCA Toolkit** (or allowed streamlined / pre-calculated methods). See `docs/FEMA_BCA_TOOLKIT.md`.
4. **Engineering feasibility** — Scope must be technically sound; PE involvement is normal for structural/flood projects.
5. **EHP** — Environmental and Historic Preservation review.
6. **Cost share** — Often **75% federal / 25% non-federal** (higher federal share possible for some underserved categories — confirm current policy).
7. **State process** — In Indiana, work through **IDHS** (eGrants / current state portal) before or as part of FEMA GO submission, per state instructions.

## BRIC status caution (2025–2026)

BRIC funding and administration have been subject to **policy and litigation developments**. Do **not** rely on outdated “BRIC is cancelled” or “BRIC is guaranteed” narratives from secondary PDFs. Check:

- [FEMA BRIC program page](https://www.fema.gov/grants/mitigation/building-resilient-infrastructure-communities)
- Current NOFO / FEMA GO notices
- IDHS mitigation staff guidance

## What this property project must still do for HMA

Tracking gates **C1–C4** in `python/readiness_export.py`:

| ID | Gate |
|----|------|
| C1 | State applicant path identified (IDHS / FEMA GO) |
| C2 | Official BCA Toolkit run |
| C3 | Scope/budget/SOW match PE models |
| C4 | FEMA-approved hazard mitigation plan coverage |

Private digital-twin software is **support material**, not a substitute for state/FEMA application packages.

## Related

- `docs/FEMA_BCA_TOOLKIT.md`
- `docs/AGENCY_SUBMISSION_READINESS.md`
- LOMA remains a **map amendment** path (Online LOMC), separate from HMA project grants.
