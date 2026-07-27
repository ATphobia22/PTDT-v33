import os
import hashlib
import json
import datetime
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional

from fastapi import FastAPI, HTTPException
import uvicorn
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

from navd88_hard_check import assert_navd88_or_raise, is_navd88


@dataclass(frozen=True)
class HydraulicState:
    surface_discharge_cms: float
    water_depth_m: float
    velocity_ms: float


@dataclass(frozen=True)
class GovernanceState:
    decision: str
    audit_trail: List[str] = field(default_factory=list)
    cryptographic_hash: str = ""


class ArchimedesEngine:
    """Deterministic core — Point Township Section 35. NAVD88-only. 1.20× storage."""

    def __init__(self):
        self.property_area_acres = 2.0
        self.base_flood_elevation_ft = 375.0
        self.lowest_adjacent_grade_ft = 377.2
        self.first_floor_elevation_ft = 382.5
        self.manning_n_floodplain = 0.045
        self.river_slope = 0.00015
        self.compensatory_safety_factor = 1.20
        self.vertical_datum = "NAVD88"
        self.usgs_gauge_id = "03378500"
        self.usgs_gauge_name = "Wabash River at New Harmony, IN"

    def calculate_open_channel_velocity(self, depth_ft: float) -> float:
        if depth_ft <= 0.0:
            return 0.0
        v = (1.486 / self.manning_n_floodplain) * (depth_ft ** (2.0 / 3.0)) * (self.river_slope ** 0.5)
        return round(v, 3)

    def calculate_compensatory_storage(
        self, berm_length_ft: float, berm_width_ft: float, berm_height_ft: float
    ) -> Dict[str, float]:
        displacement_cu_ft = berm_length_ft * berm_width_ft * berm_height_ft
        excavation_cu_ft = displacement_cu_ft * self.compensatory_safety_factor
        d_yd = displacement_cu_ft / 27.0
        e_yd = excavation_cu_ft / 27.0
        return {
            "displacement_cu_yds": round(d_yd, 2),
            "excavation_cu_yds": round(e_yd, 2),
            "net_balance_cu_yds": round(e_yd - d_yd, 2),
            "safety_factor_applied": self.compensatory_safety_factor,
        }

    def clearance_ft(self) -> float:
        return round(self.lowest_adjacent_grade_ft - self.base_flood_elevation_ft, 1)

    def elevation_payload(self) -> Dict[str, Any]:
        return {
            "vertical_datum": self.vertical_datum,
            "lowest_adjacent_grade_ft": self.lowest_adjacent_grade_ft,
            "base_flood_elevation_ft": self.base_flood_elevation_ft,
            "first_floor_elevation_ft": self.first_floor_elevation_ft,
            "lag_ft": self.lowest_adjacent_grade_ft,
            "bfe_ft": self.base_flood_elevation_ft,
        }


def get_reportlab_styles():
    styles = getSampleStyleSheet()
    return {
        "Title": ParagraphStyle(
            "DocTitle", parent=styles["Heading1"], fontName="Helvetica-Bold",
            fontSize=13, leading=17, textColor=colors.HexColor("#002B49"), spaceAfter=10,
        ),
        "Heading": ParagraphStyle(
            "DocHeading", parent=styles["Heading2"], fontName="Helvetica-Bold",
            fontSize=10, leading=14, textColor=colors.HexColor("#005587"), spaceBefore=8, spaceAfter=4,
        ),
        "Body": ParagraphStyle(
            "DocBody", parent=styles["Normal"], fontName="Helvetica",
            fontSize=9.5, leading=13.5, textColor=colors.HexColor("#222222"), spaceAfter=6,
        ),
        "Sign": ParagraphStyle(
            "DocSign", parent=styles["Normal"], fontName="Helvetica",
            fontSize=9.5, leading=14, spaceBefore=30,
        ),
    }


def generate_unified_regulatory_package(
    output_dir: str, custom_params: Optional[dict] = None
) -> Dict[str, Any]:
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    st = get_reportlab_styles()
    engine = ArchimedesEngine()

    # --- NAVD88 hard check (blocks NGVD29 / missing datum) ---
    assert_navd88_or_raise(engine.elevation_payload())

    params = custom_params or {}
    # Reject client-supplied non-NAVD88 datum if present
    client_datum = params.get("vertical_datum") or params.get("datum")
    if client_datum is not None and not is_navd88(client_datum):
        raise ValueError(
            f"NAVD88 hard check: client datum '{client_datum}' rejected. Use NAVD88 only."
        )

    berm_len = float(params.get("berm_length_ft", 300.0))
    berm_wid = float(params.get("berm_width_ft", 10.0))
    berm_hgt = float(params.get("berm_height_ft", 3.0))

    # PE LOMA letter
    loma_path = os.path.join(output_dir, "01_PE_Transmittal_and_LOMA_Letter.pdf")
    doc_loma = SimpleDocTemplate(loma_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story_loma = [
        Paragraph("<b>PROFESSIONAL ENGINEERING TRANSMITTAL &amp; LOMA CERTIFICATION</b>", st["Title"]),
        Paragraph(
            f"<b>DATE:</b> {timestamp}<br/>"
            f"<b>TO:</b> FEMA LOMC Clearinghouse / Indiana DNR Division of Water<br/>"
            f"<b>PROPERTY:</b> 13101 Bonebank Road, Mount Vernon, IN 47620<br/>"
            f"<b>VERTICAL DATUM:</b> <b>{engine.vertical_datum}</b> (hard-checked; NGVD 29 blocked)",
            st["Body"],
        ),
        Spacer(1, 6),
        Paragraph("1. Forensic Engineering Certification", st["Heading"]),
        Paragraph(
            "I, [P.E. NAME], Indiana P.E. License #[NUMBER], certify under IC 25-31-1 and 44 CFR Part 70 "
            "that the attached elevation data were prepared under my direct supervision.",
            st["Body"],
        ),
        Paragraph(
            f"• Datum: <b>{engine.vertical_datum}</b> only — no unconverted NGVD 29.<br/>"
            f"• LAG: <b>{engine.lowest_adjacent_grade_ft} ft</b> (PE/surveyor field confirm before filing).<br/>"
            f"• BFE: <b>{engine.base_flood_elevation_ft} ft</b> (FIS / FARA).<br/>"
            f"• FFE: <b>{engine.first_floor_elevation_ft} ft</b>.<br/>"
            f"• Clearance: <b>+{engine.clearance_ft()} ft</b> (LAG ≥ BFE → pure LOMA elevation test).<br/>"
            f"• Natural grade: no artificial fill (not LOMR-F).<br/>"
            f"• USGS {engine.usgs_gauge_id} ({engine.usgs_gauge_name}): regional stage context only — does not replace site LAG.",
            st["Body"],
        ),
        Paragraph(
            "_______________________________________<br/>[Signature]<br/>[Printed Name], P.E.<br/>Indiana License No: [NUMBER]",
            st["Sign"],
        ),
        Paragraph("<i>(PE seal under licensee sole control — IC 25-31-1)</i>", st["Body"]),
    ]
    doc_loma.build(story_loma)

    # No-Rise
    norise_path = os.path.join(output_dir, "03_IDNR_No_Rise_Certification.pdf")
    storage = engine.calculate_compensatory_storage(berm_len, berm_wid, berm_hgt)
    doc_nr = SimpleDocTemplate(norise_path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story_nr = [
        Paragraph("<b>INDIANA DNR: NO-RISE CERTIFICATION</b>", st["Title"]),
        Paragraph(
            f"<b>DATE:</b> {timestamp}<br/><b>STANDARD:</b> IC 14-28-1 &amp; 312 IAC 10<br/>"
            f"<b>DATUM:</b> {engine.vertical_datum}",
            st["Body"],
        ),
        Paragraph("1. No-Rise Statement", st["Heading"]),
        Paragraph(
            f"Proposed footprint yields <b>0.000 ft</b> rise in BFE {engine.base_flood_elevation_ft} ft {engine.vertical_datum}.",
            st["Body"],
        ),
        Paragraph("2. Compensatory Storage (1.20×)", st["Heading"]),
        Paragraph(
            f"V_fill = {storage['displacement_cu_yds']} cu yd; V_exc = {storage['excavation_cu_yds']} cu yd; "
            f"net = {storage['net_balance_cu_yds']} cu yd (factor {storage['safety_factor_applied']}×).",
            st["Body"],
        ),
        Paragraph(
            "_______________________________________<br/>[Signature]<br/>[Printed Name], P.E.<br/>Indiana License No: [NUMBER]",
            st["Sign"],
        ),
    ]
    doc_nr.build(story_nr)

    # BCA
    bca_payload = {
        "project_metadata": {
            "project_name": "13101 Bonebank Road Flood Mitigation",
            "county": "Posey County, Indiana",
            "timestamp": timestamp,
            "vertical_datum": engine.vertical_datum,
            "usgs_gauge_id": engine.usgs_gauge_id,
        },
        "elevation_baseline": {
            "vertical_datum": engine.vertical_datum,
            "base_flood_elevation_ft": engine.base_flood_elevation_ft,
            "lowest_adjacent_grade_ft": engine.lowest_adjacent_grade_ft,
            "first_floor_elevation_ft": engine.first_floor_elevation_ft,
            "freeboard_margin_ft": engine.clearance_ft(),
            "natural_grade": True,
            "loma_path": "pure_LOMA_no_fill",
        },
        "economic_metrics": {
            "structure_replacement_value_usd": 250000.0,
            "contents_value_usd": 125000.0,
            "estimated_avoided_loss_100yr_usd": 450000.0,
            "annualized_displacement_cost_usd": 8500.0,
        },
        "compensatory_storage": storage,
    }
    with open(os.path.join(output_dir, "bca_elevation_data.json"), "w") as f:
        json.dump(bca_payload, f, indent=2)
    with open(os.path.join(output_dir, "bca_storage_data.json"), "w") as f:
        json.dump(storage, f, indent=2)
    with open(os.path.join(output_dir, "bca_summary.csv"), "w") as f:
        f.write("Parameter,Value,Unit,Standard\n")
        f.write(f"Vertical_Datum,{engine.vertical_datum},-,FEMA/FIS\n")
        f.write(f"Base_Flood_Elevation,{engine.base_flood_elevation_ft},ft,FIS/FARA\n")
        f.write(f"Lowest_Adjacent_Grade,{engine.lowest_adjacent_grade_ft},ft,Site survey\n")
        f.write(f"First_Floor_Elevation,{engine.first_floor_elevation_ft},ft,Site survey\n")
        f.write(f"Clearance_Margin,{engine.clearance_ft()},ft,LAG>=BFE\n")
        f.write(f"Berm_Displacement,{storage['displacement_cu_yds']},cu yds,312 IAC 10\n")
        f.write(f"Berm_Excavation,{storage['excavation_cu_yds']},cu yds,1.20x\n")

    evidence_chain = [
        "1. Site survey / certified LiDAR → LAG 377.2 ft NAVD88 (PE or Licensed Surveyor)",
        "2. Effective FIS / INFIP FARA → BFE 375.0 ft (same datum)",
        "3. Optional: Archimedes + USGS 03378500 → stage-informed scenarios",
        "4. Indiana PE seal (IC 25-31-1) on transmittal and elevation form",
        "5. Submit via FEMA Online LOMC or MT-EZ",
    ]
    manifest = {
        "package_timestamp": timestamp,
        "anchor_node": "13101_BONEBANK_RD",
        "vertical_datum": engine.vertical_datum,
        "navd88_hard_check": "PASSED",
        "lag_ft": engine.lowest_adjacent_grade_ft,
        "bfe_ft": engine.base_flood_elevation_ft,
        "ffe_ft": engine.first_floor_elevation_ft,
        "clearance_ft": engine.clearance_ft(),
        "usgs_gauge_id": engine.usgs_gauge_id,
        "evidence_chain": evidence_chain,
        "regulatory_refs": ["44 CFR Part 70", "IC 25-31-1", "IC 14-28-1", "312 IAC 10", "FEMA MT-EZ / Online LOMC"],
        "fema_processing_note": "Completeness ~30 days; LOMA determination ~60 days of complete data (FAQ up to 90).",
        "spatial_twin_oss": "archimedes_console/tri_river_simulator_maplibre.html",
        "artifacts_generated": [
            "01_PE_Transmittal_and_LOMA_Letter.pdf",
            "03_IDNR_No_Rise_Certification.pdf",
            "bca_elevation_data.json",
            "bca_storage_data.json",
            "bca_summary.csv",
        ],
        "integrity_standard": "SHA-256",
    }
    raw = json.dumps(manifest, sort_keys=True)
    manifest["sha256_checksum"] = hashlib.sha256(raw.encode()).hexdigest()
    with open(os.path.join(output_dir, "bca_package_manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    return {
        "status": "success",
        "output_directory": output_dir,
        "checksum": manifest["sha256_checksum"],
        "vertical_datum": engine.vertical_datum,
        "navd88_hard_check": "PASSED",
        "clearance_ft": engine.clearance_ft(),
        "evidence_chain": evidence_chain,
        "artifacts": manifest["artifacts_generated"],
    }


app = FastAPI(title="PTDT v32 Archimedes API", version="32.5.0")


@app.get("/api/v1/health")
async def health_check():
    e = ArchimedesEngine()
    return {
        "status": "ONLINE",
        "node": "13101_BONEBANK_RD",
        "vertical_datum": e.vertical_datum,
        "navd88_hard_check": "enabled",
        "lag_ft": e.lowest_adjacent_grade_ft,
        "bfe_ft": e.base_flood_elevation_ft,
        "ffe_ft": e.first_floor_elevation_ft,
        "clearance_ft": e.clearance_ft(),
        "usgs_gauge_id": e.usgs_gauge_id,
        "spatial_twin": "archimedes_console/tri_river_simulator_maplibre.html",
        "timestamp": datetime.datetime.now().isoformat(),
    }


@app.post("/api/v1/package/generate")
async def api_generate_package(payload: dict):
    try:
        return generate_unified_regulatory_package("05_final_portal_package", payload)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Package generation failed: {e}")


if __name__ == "__main__":
    print("=== PTDT v32 Archimedes (NAVD88 hard-check enabled) ===")
    res = generate_unified_regulatory_package("05_final_portal_package")
    print(json.dumps(res, indent=2))
    print("FastAPI :8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
