# FEMA BCA Toolkit methodology (project notes)

**Official hub:** [FEMA Benefit-Cost Analysis](https://www.fema.gov/grants/tools/benefit-cost-analysis)

This repo does **not** replace the Toolkit. Invented BCR values in old PDFs are rejected.

## What FEMA requires

Hazard Mitigation Assistance (including BRIC-type asks) generally requires a **cost-effectiveness** demonstration using **FEMA-approved methodologies and tools** — primarily the **BCA Toolkit** — unless a streamlined / pre-calculated path applies for the project type and program year.

Two common compliance paths:

1. **Full BCA** — Enter documented costs and benefits into the BCA Toolkit; it computes the **Benefit-Cost Ratio (BCR)**. Cost-effectiveness typically requires **BCR ≥ 1.0** (confirm current program guidance).
2. **Streamlined / pre-calculated benefits** — Where FEMA policy allows, certain project types may use simplified documentation instead of a full Toolkit run.

## Toolkit role

- Implements FEMA-approved calculation methods aligned with **OMB Circular A-94** cost-effectiveness guidance.
- Discount rate is **built into the Toolkit** (FEMA has updated the rate over time, e.g. reductions toward ~3.1% under updated federal guidance — always use the **current Toolkit version**, do not hard-code rates in this repo).
- Flood projects commonly use modules such as **full flood** analysis or **damage-frequency assessment (DFA)**, depending on data available.

## How to perform a full BCA (high level)

1. Download the current **BCA Toolkit** from FEMA’s BCA page (Excel add-in / template workflow per current instructions).
2. Install / open per FEMA user guidance.
3. Enter **documented** project costs and quantifiable benefits (avoided damages, displacement, etc.) with sources.
4. Export Toolkit results and attach to the subapplication (e.g. IDHS eGrants → FEMA).
5. Keep the Toolkit run file and supporting cost/benefit documentation in the evidence archive.

Detailed steps: [How to Perform a Full BCA](https://www.fema.gov/grants/guidance-tools/benefit-cost-analysis/full-bca).

## Project tracking gate

In `python/readiness_export.py`, gate **C2** is:

> FEMA BCA Toolkit run (official; not invented BCR)

Mark `done` only after a real Toolkit export exists for the scope you will file.

## Repo screening vs official BCA

| Artifact | Role |
|----------|------|
| `python/bca_screening_export.py` (if present) | Local **screening** JSON only |
| FEMA BCA Toolkit | **Official** BCR for HMA/BRIC eligibility |
| Narrative PDFs with fixed BCR (e.g. 2.45) | **Rejected** unless they match a Toolkit run |
