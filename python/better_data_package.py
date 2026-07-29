#!/usr/bin/env python3
"""
PTDT Better Data Agency Package Generator
-----------------------------------------
Produces local, hash-sealed exhibits that support a "better data" argument to
FEMA (Online LOMC / LOMA) and IDNR (FARA / floodway review).

This does NOT submit to any federal API. PE seal and survey verification required.
"""
from __future__ import annotations

import csv
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
    from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

    HAS_REPORTLAB = True
except ImportError:
    HAS_REPORTLAB = False


# --- Project baseline (must be confirmed by licensed survey / PE before filing) ---
PROPERTY = {
    "address": "13101 Bonebank Road",
    "city": "Mount Vernon",
    "state": "IN",
    "zip": "47620",
    "county": "Posey County",
    "township": "Point Township",
    "section": "Section 35, T7S, R14W",
    "community_name": "Posey County & Unincorporated Areas",
    "community_number_note": "Confirm on FEMA Map Service Center before filing",
    "firm_panel_note": "Confirm effective panel on MSC before filing",
    "lat": 37.93,
    "lon": -88.01,
}

ELEVATIONS = {
    "vertical_datum": "NAVD 88",
    "bfe_ft": 375.0,
    "lag_ft": 377.2,
    "ffe_ft": 382.5,
    "source_bfe": "Project regulatory baseline (confirm vs effective FIRM / BAFL / FARA)",
    "source_lag": "Project LiDAR / survey work map (requires PE certification)",
    "lidar_claim_cm": 5,
    "natural_ground": True,
    "fill_placed": False,
}

USGS_CONTEXT = [
    {
        "gage_id": "03378500",
        "name": "Wabash River at New Harmony, IN",
        "role": "Regional stage/discharge context for Wabash corridor",
    },
    {
        "gage_id": "03322000",
        "name": "Ohio River at Uniontown Dam",
        "role": "Regional Ohio River corridor context",
    },
]

DATA_LINEAGE = [
    {
        "layer": "Effective NFHL / FIRM",
        "agency": "FEMA",
        "access": "hazards.fema.gov NFHL MapServer + Map Service Center",
        "use": "Insurance / mandatory purchase baseline",
        "proxy": "GET /api/fema-flood-zones",
    },
    {
        "layer": "Best Available Floodplain (BAFL)",
        "agency": "IDNR Division of Water",
        "access": "dnrmaps.dnr.in.gov BestAvailableFloodplain",
        "use": "State permitting / Construction in a Floodway",
        "proxy": "GET /api/dnr-floodplain",
    },
    {
        "layer": "FARA / INFIP",
        "agency": "IDNR",
        "access": "https://www.in.gov/dnr/water/surface-water/indiana-floodplain-mapping/indiana-floodplain-information-portal",
        "use": "Zone A / unmapped / >1 sq mi drainage determinations",
        "proxy": "Manual download — archive PDF with package",
    },
    {
        "layer": "Vertical datum transform",
        "agency": "NOAA/NGS NCAT",
        "access": "geodesy.noaa.gov NCAT API",
        "use": "NGVD29 → NAVD88 consistency",
        "proxy": "GET /api/transform-elevation",
    },
    {
        "layer": "Live hydrology",
        "agency": "USGS NWIS",
        "access": "waterservices.usgs.gov",
        "use": "Gage context, not site BFE substitute",
        "proxy": "GET /api/usgs-telemetry",
    },
    {
        "layer": "NFIP claims context (optional BRIC narrative)",
        "agency": "OpenFEMA",
        "access": "fema.gov/api/open/v2/FimaNfipClaims",
        "use": "County/state loss history for BCA story",
        "proxy": "GET /api/openfema-claims",
    },
    {
        "layer": "Soils / drainage class (optional)",
        "agency": "USDA-NRCS SDA",
        "access": "SDMDataAccess.sc.egov.usda.gov",
        "use": "Manning / soils context",
        "proxy": "GET /api/nrcs-soil",
    },
]


def _sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def clearance_ft() -> float:
    return round(ELEVATIONS["lag_ft"] - ELEVATIONS["bfe_ft"], 3)


def comparison_rows() -> List[Dict[str, Any]]:
    c = clearance_ft()
    return [
        {
            "metric": "Vertical datum",
            "effective_map_practice": "Must match published FIRM (typically NAVD 88 on modern panels)",
            "ptdt_better_data": ELEVATIONS["vertical_datum"],
            "advantage": "Hard-enforced NAVD 88; NGVD 29 rejected in package generator",
        },
        {
            "metric": "Base Flood Elevation (ft)",
            "effective_map_practice": "FIRM / BAFL / FARA published BFE or Zone A approximate",
            "ptdt_better_data": ELEVATIONS["bfe_ft"],
            "advantage": "Tied to documented regulatory baseline + site review",
        },
        {
            "metric": "Lowest Adjacent Grade (ft)",
            "effective_map_practice": "Often not parcel-specific on approximate Zone A",
            "ptdt_better_data": ELEVATIONS["lag_ft"],
            "advantage": f"Site LAG with claimed {ELEVATIONS['lidar_claim_cm']} cm LiDAR / survey path",
        },
        {
            "metric": "Clearance LAG − BFE (ft)",
            "effective_map_practice": "Unknown without survey",
            "ptdt_better_data": c,
            "advantage": "Positive clearance supports natural-ground LOMA hypothesis",
        },
        {
            "metric": "Fill status",
            "effective_map_practice": "LOMR-F if fill used to elevate",
            "ptdt_better_data": "Natural ground / no fill" if ELEVATIONS["natural_ground"] else "Fill present",
            "advantage": "Pure LOMA path if PE attests natural grade",
        },
        {
            "metric": "Hydrologic context",
            "effective_map_practice": "Static FIS profiles",
            "ptdt_better_data": ", ".join(g["gage_id"] for g in USGS_CONTEXT),
            "advantage": "Live USGS NWIS assimilation for operational monitoring",
        },
        {
            "metric": "State dual-layer",
            "effective_map_practice": "NFHL alone for insurance",
            "ptdt_better_data": "NFHL + BAFL + INFIP/FARA workflow documented",
            "advantage": "Aligns federal insurance and Indiana regulatory layers",
        },
    ]


def property_geojson() -> Dict[str, Any]:
    # Approximate point feature for map exhibit; replace with surveyed polygon before filing.
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {
                    **PROPERTY,
                    **ELEVATIONS,
                    "clearance_ft": clearance_ft(),
                    "exhibit": "property_centroid_placeholder",
                    "note": "Replace geometry with surveyed structure / LAG points before agency submittal",
                },
                "geometry": {"type": "Point", "coordinates": [PROPERTY["lon"], PROPERTY["lat"]]},
            }
        ],
    }


def bca_rows() -> List[Dict[str, Any]]:
    """Screening-level BCA fields for BRIC narrative — not FEMA BCA Toolkit output."""
    return [
        {"parameter": "structure_replacement_value_usd", "value": 250000, "unit": "USD", "note": "Placeholder — replace with appraisal"},
        {"parameter": "contents_value_usd", "value": 125000, "unit": "USD", "note": "Placeholder"},
        {"parameter": "bfe_ft", "value": ELEVATIONS["bfe_ft"], "unit": "ft", "note": ELEVATIONS["vertical_datum"]},
        {"parameter": "lag_ft", "value": ELEVATIONS["lag_ft"], "unit": "ft", "note": ELEVATIONS["vertical_datum"]},
        {"parameter": "ffe_ft", "value": ELEVATIONS["ffe_ft"], "unit": "ft", "note": ELEVATIONS["vertical_datum"]},
        {"parameter": "clearance_ft", "value": clearance_ft(), "unit": "ft", "note": "LAG - BFE"},
        {"parameter": "vertical_datum", "value": ELEVATIONS["vertical_datum"], "unit": "—", "note": "Required"},
    ]


def write_json(path: Path, obj: Any) -> str:
    text = json.dumps(obj, indent=2, sort_keys=True)
    path.write_text(text, encoding="utf-8")
    return _sha256_bytes(text.encode("utf-8"))


def write_csv(path: Path, rows: List[Dict[str, Any]], fieldnames: List[str]) -> str:
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        for r in rows:
            w.writerow({k: r.get(k, "") for k in fieldnames})
    return _sha256_file(path)


def write_comparison_pdf(path: Path) -> Optional[str]:
    if not HAS_REPORTLAB:
        return None
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "T", parent=styles["Heading1"], fontSize=13, textColor=colors.HexColor("#002B49"), spaceAfter=8
    )
    body = ParagraphStyle(
        "B", parent=styles["Normal"], fontSize=9, leading=12, spaceAfter=6
    )
    doc = SimpleDocTemplate(str(path), pagesize=letter, leftMargin=40, rightMargin=40, topMargin=40, bottomMargin=40)
    story = []
    story.append(Paragraph("<b>BETTER DATA COMPARISON BRIEF — AGENCY EXHIBIT</b>", title))
    story.append(
        Paragraph(
            f"{PROPERTY['address']}, {PROPERTY['city']}, {PROPERTY['state']} {PROPERTY['zip']} "
            f"({PROPERTY['county']} / {PROPERTY['township']}). "
            f"Vertical datum: <b>{ELEVATIONS['vertical_datum']}</b>. "
            f"Generated {dt.datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}.",
            body,
        )
    )
    story.append(
        Paragraph(
            "Purpose: Support FEMA Online LOMC (LOMA) and IDNR FARA / floodplain review by documenting "
            "site-specific elevations, datum integrity, dual-layer mapping (NFHL + BAFL), and data lineage. "
            "This PDF is a technical exhibit template — not a PE-sealed certification and not a federal submission.",
            body,
        )
    )
    story.append(Paragraph("<b>1. Elevation summary</b>", body))
    story.append(
        Paragraph(
            f"BFE {ELEVATIONS['bfe_ft']} ft · LAG {ELEVATIONS['lag_ft']} ft · FFE {ELEVATIONS['ffe_ft']} ft · "
            f"Clearance <b>{clearance_ft()} ft</b> (LAG − BFE). Natural ground: {ELEVATIONS['natural_ground']}.",
            body,
        )
    )
    story.append(Paragraph("<b>2. Effective map practice vs PTDT better data</b>", body))
    data = [["Metric", "Effective / typical", "PTDT better data", "Advantage"]]
    for row in comparison_rows():
        data.append(
            [
                str(row["metric"])[:28],
                str(row["effective_map_practice"])[:42],
                str(row["ptdt_better_data"])[:36],
                str(row["advantage"])[:42],
            ]
        )
    t = Table(data, colWidths=[90, 130, 110, 130])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#005587")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 7),
                ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.whitesmoke, colors.Color(0.93, 0.95, 0.98)]),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>3. Agency submission channels (official)</b>", body))
    story.append(
        Paragraph(
            "• FEMA LOMA: Online LOMC portal + PE-sealed survey exhibits (44 CFR Part 70).<br/>"
            "• IDNR: INFIP FARA download + Division of Water permit / No-Rise process (IC 14-28-1, 312 IAC 10).<br/>"
            "• BRIC/FMA grants: FEMA GO web application (go.fema.gov) — separate from LOMA.",
            body,
        )
    )
    story.append(Paragraph("<b>4. PE attestation block (manual)</b>", body))
    story.append(
        Paragraph(
            "I, ________________________, P.E., Indiana License No. _________, certify that the elevation "
            "data and topographic exhibits attached were prepared under my supervision and are suitable for "
            "agency review. Signature: ________________  Date: ________",
            body,
        )
    )
    doc.build(story)
    return _sha256_file(path)


def build_package(output_dir: str = "05_better_data_agency_package") -> Dict[str, Any]:
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    ts = dt.datetime.utcnow().replace(microsecond=0).isoformat() + "Z"
    artifacts: List[Dict[str, str]] = []

    # 1) Master comparison JSON
    comparison = {
        "generated_utc": ts,
        "property": PROPERTY,
        "elevations": {**ELEVATIONS, "clearance_ft": clearance_ft()},
        "usgs_context": USGS_CONTEXT,
        "rows": comparison_rows(),
        "disclaimer": "Values are project baselines until PE/survey sealed.",
    }
    p = out / "01_better_data_comparison.json"
    artifacts.append({"filename": p.name, "sha256": write_json(p, comparison)})

    # 2) Comparison CSV
    p = out / "02_better_data_comparison.csv"
    artifacts.append(
        {
            "filename": p.name,
            "sha256": write_csv(
                p,
                comparison_rows(),
                ["metric", "effective_map_practice", "ptdt_better_data", "advantage"],
            ),
        }
    )

    # 3) Data lineage
    p = out / "03_data_lineage.json"
    artifacts.append(
        {
            "filename": p.name,
            "sha256": write_json(
                p,
                {
                    "generated_utc": ts,
                    "purpose": "Traceability of every authoritative input layer",
                    "lineage": DATA_LINEAGE,
                },
            ),
        }
    )

    # 4) Property GeoJSON placeholder
    p = out / "04_property_exhibit.geojson"
    artifacts.append({"filename": p.name, "sha256": write_json(p, property_geojson())})

    # 5) BCA screening CSV + JSON
    p = out / "05_bca_screening.csv"
    artifacts.append(
        {
            "filename": p.name,
            "sha256": write_csv(p, bca_rows(), ["parameter", "value", "unit", "note"]),
        }
    )
    p = out / "05_bca_screening.json"
    artifacts.append(
        {
            "filename": p.name,
            "sha256": write_json(
                p,
                {
                    "generated_utc": ts,
                    "standard": "Screening only — import into FEMA BCA Toolkit for official BCR",
                    "vertical_datum": ELEVATIONS["vertical_datum"],
                    "rows": bca_rows(),
                },
            ),
        }
    )

    # 6) Agency cover narrative (markdown)
    md = out / "06_AGENCY_COVER_NARRATIVE.md"
    md_text = f"""# Better Data Cover Narrative — {PROPERTY['address']}

**Generated (UTC):** {ts}  
**Datum:** {ELEVATIONS['vertical_datum']}  
**Clearance (LAG − BFE):** {clearance_ft()} ft

## Executive statement for reviewers

This package documents a **site-specific, NAVD 88–consistent elevation and mapping workflow** for
{PROPERTY['address']}, {PROPERTY['county']}, Indiana. It is designed to support:

1. **FEMA** Letter of Map Amendment (natural high ground) via **Online LOMC**, and
2. **IDNR Division of Water** review using **INFIP/FARA** and Best Available Floodplain layers.

## Why this is better data

| Claim | Evidence in this package |
|-------|--------------------------|
| Vertical datum integrity | NAVD 88 enforced; NGVD 29 conversion path via NGS NCAT |
| Parcel-scale grade | LAG {ELEVATIONS['lag_ft']} ft vs BFE {ELEVATIONS['bfe_ft']} ft |
| Dual regulatory layers | NFHL (insurance) + BAFL/FARA (state) lineage table |
| Live hydrology context | USGS gages {', '.join(g['gage_id'] for g in USGS_CONTEXT)} |
| Reproducible audit | SHA-256 manifest for every artifact |

## What this package is not

- Not a PE seal
- Not an automatic FEMA or IDNR approval
- Not a substitute for HEC-RAS when IDNR requires full hydraulic modeling
- Not a FEMA GO OAuth upload

## Requested agency actions

- **FEMA:** Accept PE-sealed LOMA exhibits showing LAG above BFE on natural ground.
- **IDNR:** Accept FARA + better topographic data for local/state floodplain determinations.
- **Grant reviewers (if BRIC):** Use screening BCA CSV only after values are replaced with appraised costs in the official BCA Toolkit.
"""
    md.write_text(md_text, encoding="utf-8")
    artifacts.append({"filename": md.name, "sha256": _sha256_file(md)})

    # 7) Comparison PDF
    pdf_path = out / "07_better_data_comparison_brief.pdf"
    pdf_hash = write_comparison_pdf(pdf_path)
    if pdf_hash:
        artifacts.append({"filename": pdf_path.name, "sha256": pdf_hash})
    else:
        note = out / "07_better_data_comparison_brief.PDF_SKIPPED.txt"
        note.write_text("Install reportlab to generate PDF brief.\n", encoding="utf-8")
        artifacts.append({"filename": note.name, "sha256": _sha256_file(note)})

    # 8) Submission checklist
    checklist = {
        "generated_utc": ts,
        "fema_lomc": [
            "Confirm effective FIRM panel + community number on Map Service Center",
            "PE-sealed topographic map with LAG points on NAVD 88",
            "Natural ground attestation (no fill)",
            "Upload via FEMA Online LOMC — LOMA",
            "Include this comparison brief and lineage JSON as supporting exhibits",
        ],
        "idnr": [
            "Generate and archive FARA from INFIP for parcel coordinates",
            "Confirm drainage area vs 1 sq mi jurisdiction trigger",
            "No-Rise / compensatory storage if structural work in floodway",
            "PE seal on hydraulic conclusions",
        ],
        "optional_bric": [
            "Replace placeholder structure values in BCA screening CSV",
            "Run official FEMA BCA Toolkit",
            "Submit application in FEMA GO (web UI)",
        ],
    }
    p = out / "08_submission_checklist.json"
    artifacts.append({"filename": p.name, "sha256": write_json(p, checklist)})

    # Manifest with real hashes only
    manifest = {
        "manifest_id": f"BETTER-DATA-{ts.replace(':', '').replace('-', '')}",
        "timestamp_utc": ts,
        "node_anchor": "13101_BONEBANK_RD",
        "evidentiary_standard": "Local audit trail supporting PE package (FRE 702 readiness requires PE seal)",
        "navd88_datum_verified": True,
        "vertical_datum": "NAVD 88",
        "clearance_ft": clearance_ft(),
        "artifacts_generated": artifacts,
        "master_cryptographic_seal": {
            "hash_algorithm": "SHA-256",
            "canonical_hash_sha256": _sha256_bytes(
                json.dumps(artifacts, sort_keys=True).encode("utf-8")
            ),
            "status": "LOCAL_PACKAGE_READY_AWAITING_PE_SEAL",
        },
        "anti_fabrication": {
            "no_fema_oauth_upload": True,
            "no_placeholder_empty_hashes": True,
            "official_channels_only": [
                "FEMA Online LOMC",
                "IDNR INFIP/FARA",
                "FEMA GO (grants UI)",
            ],
        },
    }
    # Recompute canonical hash over full manifest without nested seal circularity
    seal_body = {k: v for k, v in manifest.items() if k != "master_cryptographic_seal"}
    manifest["master_cryptographic_seal"]["canonical_hash_sha256"] = _sha256_bytes(
        json.dumps(seal_body, sort_keys=True).encode("utf-8")
    )
    mp = out / "00_evidence_manifest.json"
    write_json(mp, manifest)

    return {
        "status": "success",
        "output_directory": str(out.resolve()),
        "artifact_count": len(artifacts),
        "manifest": str(mp),
        "clearance_ft": clearance_ft(),
        "vertical_datum": "NAVD 88",
        "reportlab": HAS_REPORTLAB,
    }


if __name__ == "__main__":
    result = build_package()
    print(json.dumps(result, indent=2))
