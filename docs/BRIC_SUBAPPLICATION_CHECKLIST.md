# FEMA BRIC pathway checklist (Indiana)

**Real path:** Applicant → **Indiana SHMO (IDHS)** via **eGrants** → FEMA Region V.  
There is **no** private OAuth “FEMA GO automated dominance” API for this.

## Identity block (from your draft narrative — verify before filing)

| Field | Draft |
|-------|-------|
| Applicant | Anthony John Tucker |
| Site | 13101 Bonebank Road, Point Township, Posey County, IN 47620 |
| Parcel | 65-09-35-200-001.000-009 |
| Coords | 37.9035°N, 88.0007°W |
| FIRM | 18129C0225D |
| Region | FEMA Region V |
| SHMO | Indiana Department of Homeland Security |

## Required substance (not optional)

1. **Problem statement** tied to declared disasters / SFHA (cite official FEMA disaster numbers carefully; verify on fema.gov)
2. **Scope** — berms, basins, gates, sensors: quantities and locations PE-designed
3. **No-Rise / floodway** pathway with IDNR if work is in floodway
4. **BCA** from **FEMA BCA Toolkit** (do not invent BCR 1.41 or 2.45 in code)
5. **EHP** screening (NEPA, ESA IPaC, NHPA Section 106, EO 11988/11990)
6. **Cost estimate** with match source (75/25 or small-impoverished rules if eligible)
7. **Schedule** and procurement under 2 CFR 200
8. **SAM.gov** active registration

## Cost / BCR honesty

| Source in drafts | Treatment |
|------------------|-----------|
| BCR 1.41 mid-cost $5.25M | Narrative placeholder — **recalculate in Toolkit** |
| BCR 2.45 / $8.5M | Earlier screening JSON — **not official** |
| Section 204 clay “free material” | Coordinate with USACE; do not assume $0 without agreement |

```bash
python python/bca_screening_export.py   # SCREENING_ONLY template
```

## Submission

- Platform: **Indiana eGrants** (SHMO), not a homemade script  
- Deadlines: use the current NOFO only (ignore stale dates in old drafts)  
- Attach PE engineering, not DRAFT-only PDFs  

## Alignment with PTDT software

Useful supporting roles only:

- Live USGS context (`telemetry_john_t_myers.py`, USGS proxy)
- Better-data elevation comparison package
- No-Rise **draft** worksheet + local ledger
- NAVD 88 hard checks

Not useful for BRIC scoring:

- “Daubert seal” overlays in Godot/Blender
- Databricks DLT pipelines without real data lakes
- Blockchain anchors for PDF hashes
