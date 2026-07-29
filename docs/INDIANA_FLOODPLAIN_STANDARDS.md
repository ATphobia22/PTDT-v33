# Indiana Floodplain Mapping Standards (INFIP / BAFL / FARA)

**Anchor property context:** 13101 Bonebank Road, Point Township, Posey County, IN (Section 35).

This document summarizes **verified** IDNR / FEMA dual-layer practice. It is not a substitute for current statutes or a sealed PE package.

## Dual-layer architecture

| Product | Agency | Primary use | Weight |
|---------|--------|-------------|--------|
| **NFHL / FIRM** | FEMA | Flood insurance rates, mandatory purchase | Highest for **NFIP insurance** |
| **Best Available Floodplain Layer (BAFL / BAFM)** | IDNR Division of Water | Local permitting, planning, Construction in a Floodway | Primary for **state regulatory** review under IC 14-28-1 |
| **INFIP** | IDNR | Interactive BFE / cross-section access and FARA generation | Operational tool for floodplain administrators |
| **FARA** | Generated via INFIP / eFARA | Site-specific floodplain status, BFE support, drainage context | Required support for Zone A permits, unmapped areas, and many LOMA packages in Zone A |

Official INFIP entry: [Indiana Floodplain Information Portal](https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/indiana-floodplain-information-portal) (also referenced as infip.dnr.in.gov / ArcGIS Experience).

## FARA when required (IDNR)

Per IDNR guidance, a **Floodplain Analysis and Regulatory Assessment (FARA)** is used for:

1. Local floodplain permitting in **approximate Zone A**
2. Parcels **unmapped** on the effective FIRM
3. Upstream drainage area **greater than 1 square mile** (640 acres) where regulatory determination is needed
4. Supporting technical data for **FEMA LOMA** applications in Zone A areas

**Archive note:** IDNR does not permanently hold every generated FARA for the applicant. Download and archive the exact report for the parcel coordinates at the time of assessment.

## Governing law (high level)

- **IC 14-28-1** (Flood Control Act) — IDNR jurisdiction over floodways / flood fringes when contributing drainage exceeds 1 square mile
- **312 IAC 10** — Floodplain management rules (setbacks, flood protection grade practices, storage balancing as applied by IDNR/local ordinances)

Flood protection grade is commonly expressed as **FPG = BFE + freeboard** (often +2 ft in local/state practice). Confirm the controlling ordinance for the parcel.

## PTDT LOMA strategy (engineering hypothesis)

Project constants used in `archimedes_engine.py` (must be verified by licensed survey/PE before any federal filing):

| Metric | Value | Datum |
|--------|-------|--------|
| BFE | 375.0 ft | NAVD 88 |
| LAG | 377.2 ft | NAVD 88 |
| Clearance | +2.2 ft | LAG − BFE |

If LAG is truly above BFE on natural ground with **no fill**, a **pure LOMA** path (natural high ground) may apply under 44 CFR Part 70 — subject to FEMA review of survey-quality evidence, not software output alone.

**Better data:** Where BAFL or approximate Zone A conflicts with certified higher-accuracy topography, FEMA/IDNR processes allow “better data” under PE seal. That is a formal map/permit process, not an automated API post.

## System wiring

- DNR floodplain proxy: `GET /api/dnr-floodplain` (Best Available layer query)
- FEMA NFHL proxy: `GET /api/fema-flood-zones`
- NAVD88 transform helper: `GET /api/transform-elevation` (NGS NCAT)
- Package PDFs: `archimedes_engine.py` → `05_final_portal_package/`
