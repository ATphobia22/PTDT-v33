# FEMA BCA Toolkit — flood benefits (PTDT)

**Authority for sealed BCR:** Official **FEMA BCA Toolkit** output only (not HEC-FIA, not engineering spreadsheet alone).  
**Cost-effective:** BCR **≥ 1.0** under FEMA-approved methodology.

## Compliance paths

| Path | When |
|---|---|
| **Full BCA** | Enter documented values in Toolkit; attach Toolkit output file to HMA/BRIC subapplication |
| **Streamlined** | Total cost **< $1M**, substantial-damage acquisition waiver, or **pre-calculated benefits** eligibility |

FEMA: https://www.fema.gov/grants/tools/benefit-cost-analysis

## Flood module benefits (concept)

Riverine / coastal flood modules estimate **avoided damages** over the project useful life, discounted per OMB guidance used by the Toolkit.

Typical **benefit categories** for flood mitigation:

| Benefit | Mechanism |
|---|---|
| **Structure / content** | Depth–damage functions (DDF) × structure & content values × expected damage reduction |
| **Displacement / loss of function** | Days of loss avoided × cost rates (Toolkit tables) |
| **Casualty / mental stress** | Toolkit standard values when applicable |
| **Emergency response** | Avoided response costs where methodology allows |
| **Insurance** | NFIP-related benefits only as Toolkit permits |

Depth enters via **flood depth relative to structure** (often first-floor elevation / foundation height relationships). LOMA / elevation projects document **reduced risk** vs before condition using BFE, LAG, FFE.

## PTDT site inputs (Material Truth)

| Input | Value |
|---|---|
| BFE | **375.0 ft NAVD88** |
| LAG | **377.2 ft NAVD88** |
| FFE | **382.5 ft NAVD88** |
| Clearance | **+2.2 ft** (natural high ground) |
| Structure value | Document replacement cost (grant docs cite **> $250,000** class — PE/appraisal seals) |

## BCR conflict handling

| Label | Value |
|---|---|
| Engineering export | **1.41** |
| Legal Bonding PDF | **2.45** |
| **Sealed** | Toolkit file + SHA-256 after PE review |

Package generator must not print a single BCR without `bcr_toolkit_sha256`.

## Relation to HEC-FIA

| Tool | Role |
|---|---|
| HEC-FIA | Single-event consequences (structure/ag/life loss) — planning / impact narrative |
| BCA Toolkit | **Grant cost-effectiveness** BCR |

Do not substitute FIA damages for Toolkit BCR.

## Related

- `docs/ptdt-v33/BCR_SOURCE_CONFLICT.md`
- `docs/ptdt-v33/GRANT_STACK_AND_BRIC.md`
- FEMA methodologies: https://www.fema.gov/grants/guidance-tools/benefit-cost-analysis/methodologies
