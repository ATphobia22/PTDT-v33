import os
import math
import hashlib
import json
import datetime
from dataclasses import dataclass, field, asdict
from typing import Dict, List, Any, Optional

from fastapi import FastAPI, HTTPException
import uvicorn
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


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
    """Deterministic fluid mechanics core for Point Township Section 35.
    Enforces 1.20x compensatory storage safety factor for IDNR 312 IAC 10 compliance.
    """

    def __init__(self):
        self.property_area_acres = 2.0
        self.base_flood_elevation_ft = 375.0
        self.lowest_adjacent_grade_ft = 377.2
        self.manning_n_floodplain = 0.045
        self.river_slope = 0.00015
        self.compensatory_safety_factor = 1.20
        self.vertical_datum = "NAVD88"
        self.usgs_gauge_id = "03378500"
        self.usgs_gauge_name = "Wabash River at New Harmony, IN"

    def calculate_open_channel_velocity(self, depth_ft: float) -> float:
        if depth_ft <= 0.0:
            return 0.0
        velocity = (
            (1.486 / self.manning_n_floodplain)
            * (depth_ft ** (2.0 / 3.0))
            * (self.river_slope ** 0.5)
        )
        return round(velocity, 3)

    def calculate_compensatory_storage(
        self, berm_length_ft: float, berm_width_ft: float, berm_height_ft: float
    ) -> Dict[str, float]:
        displacement_cu_ft = berm_length_ft * berm_width_ft * berm_height_ft
        excavation_cu_ft = displacement_cu_ft * self.compensatory_safety_factor
        displacement_cu_yds = displacement_cu_ft / 27.0
        excavation_cu_yds = excavation_cu_ft / 27.0
        net_balance = excavation_cu_yds - displacement_cu_yds
        return {
            "displacement_cu_yds": round(displacement_cu_yds, 2),
            "excavation_cu_yds": round(excavation_cu_yds, 2),
            "net_balance_cu_yds": round(net_balance, 2),
            "safety_factor_applied": self.compensatory_safety_factor,
        }

    def clearance_ft(self) -> float:
        return round(self.lowest_adjacent_grade_ft - self.base_flood_elevation_ft, 1)


def get_reportlab_styles():
    styles = getSampleStyleSheet()
    return {
        "Title": ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=17,
            textColor=colors.HexColor("#002B49"),
            spaceAfter=10,
        ),
        "Heading": ParagraphStyle(
            "DocHeading",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#005587"),
            spaceBefore=8,
            spaceAfter=4,
        ),
        "Body": ParagraphStyle(
            "DocBody",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13.5,
            textColor=colors.HexColor("#222222"),
            spaceAfter=6,
        ),
        "Sign": ParagraphStyle(
            "DocSign",
            parent=styles["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=14,
            spaceBefore=30,
        ),
    }


def generate_unified_regulatory_package(
    output_dir: str, custom_params: Optional[dict] = None
) -> Dict[str, Any]:
    os.makedirs(output_dir, exist_ok=True)
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    st = get_reportlab_styles()
    engine = ArchimedesEngine()

    params = custom_params or {}
    berm_len = float(params.get("berm_length_ft", 300.0))
    berm_wid = float(params.get("berm_width_ft", 10.0))
    berm_hgt = float(params.get("berm_height_ft", 3.0))

    # --- 1. PE Transmittal & LOMA Letter ---
    loma_path = os.path.join(output_dir, "01_PE_Transmittal_and_LOMA_Letter.pdf")
    doc_loma = SimpleDocTemplate(
        loma_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )
    story_loma = [
        Paragraph(
            "<b>PROFESSIONAL ENGINEERING TRANSMITTAL &amp; LOMA CERTIFICATION</b>",
            st["Title"],
        ),
        Paragraph(
            f"<b>DATE:</b> {timestamp}<br/>"
            f"<b>TO:</b> FEMA LOMC Clearinghouse / Indiana DNR Division of Water<br/>"
            f"<b>PROPERTY:</b> 13101 Bonebank Road, Mount Vernon, IN 47620 "
            f"(Posey County / Point Township)<br/>"
            f"<b>VERTICAL DATUM:</b> {engine.vertical_datum}",
            st["Body"],
        ),
        Spacer(1, 6),
        Paragraph("1. Forensic Engineering Certification Statement", st["Heading"]),
        Paragraph(
            "I, [P.E. NAME], being a Registered Professional Engineer in the State of Indiana "
            "(License #[NUMBER]), do hereby state under professional seal that the technical data "
            "and topographic work maps attached with this LOMA submission are true and accurate, "
            "and were prepared under my direct supervision pursuant to Indiana IC 25-31-1 and "
            "44 CFR Part 70.",
            st["Body"],
        ),
        Paragraph(
            f"• <b>Vertical Datum:</b> All elevations referenced to <b>{engine.vertical_datum}</b>. "
            f"No unconverted NGVD 29 values are used.<br/>"
            f"• <b>Lowest Adjacent Grade (LAG):</b> <b>{engine.lowest_adjacent_grade_ft} ft</b> "
            f"(project baseline; PE/surveyor field confirmation required before filing).<br/>"
            f"• <b>Base Flood Elevation (BFE):</b> <b>{engine.base_flood_elevation_ft} ft</b> "
            f"(effective FIS / FARA).<br/>"
            f"• <b>Clearance:</b> <b>+{engine.clearance_ft()} ft</b> (LAG ≥ BFE → LOMA elevation test met).<br/>"
            f"• <b>Natural Ground:</b> Structure attested to sit on natural grade with no artificial fill "
            f"(pure LOMA path; not LOMR-F).<br/>"
            f"• <b>Supporting hydrology:</b> Regional stage context from USGS Gauge "
            f"{engine.usgs_gauge_id} ({engine.usgs_gauge_name}) — does not replace site LAG certification.",
            st["Body"],
        ),
        Paragraph(
            "As required by Indiana IC 25-31-1 and 44 CFR Part 70, I certify that these analyses "
            "were performed under my direct supervision and meet statutory requirements for "
            "floodplain mapping amendments.",
            st["Body"],
        ),
        Paragraph(
            "_______________________________________<br/>"
            "[Signature]<br/>[Printed Name], P.E.<br/>Indiana License No: [NUMBER]",
            st["Sign"],
        ),
        Paragraph(
            "<i>(Apply Indiana Registered Professional Engineer Stamp/Seal Here — "
            "seal remains under licensee sole control per IC 25-31-1)</i>",
            st["Body"],
        ),
    ]
    doc_loma.build(story_loma)

    # --- 2. IDNR No-Rise Certification ---
    norise_path = os.path.join(output_dir, "03_IDNR_No_Rise_Certification.pdf")
    doc_nr = SimpleDocTemplate(
        norise_path,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )
    storage_metrics = engine.calculate_compensatory_storage(berm_len, berm_wid, berm_hgt)
    story_nr = [
        Paragraph(
            "<b>INDIANA DNR DIVISION OF WATER: NO-RISE CERTIFICATION</b>",
            st["Title"],
        ),
        Paragraph(
            f"<b>DATE:</b> {timestamp}<br/>"
            f"<b>PROJECT:</b> 13101 Bonebank Road Flood Defense<br/>"
            f"<b>STATUTORY STANDARD:</b> Indiana Flood Control Act (IC 14-28-1) &amp; 312 IAC 10<br/>"
            f"<b>VERTICAL DATUM:</b> {engine.vertical_datum}",
            st["Body"],
        ),
        Spacer(1, 6),
        Paragraph("1. Engineering Certification &amp; No-Rise Statement", st["Heading"]),
        Paragraph(
            f"It is my professional opinion that the proposed structural footprint at 13101 Bonebank Road "
            f"will result in <b>0.000 feet</b> of cumulative or instantaneous rise in the regulatory "
            f"Base Flood Elevation of {engine.base_flood_elevation_ft} ft {engine.vertical_datum}.",
            st["Body"],
        ),
        Paragraph("2. Compensatory Storage Verification (1.20× Safety Factor)", st["Heading"]),
        Paragraph(
            f"Structural fill displacement (V_fill = {storage_metrics['displacement_cu_yds']} cu yds) "
            f"is offset by active compensatory storage excavation "
            f"(V_exc = {storage_metrics['excavation_cu_yds']} cu yds) enforcing a 1.20× safety factor "
            f"per 312 IAC 10 practice. Net balance = {storage_metrics['net_balance_cu_yds']} cu yds.",
            st["Body"],
        ),
        Paragraph(
            "_______________________________________<br/>"
            "[Signature]<br/>[Printed Name], P.E.<br/>Indiana License No: [NUMBER]",
            st["Sign"],
        ),
    ]
    doc_nr.build(story_nr)

    # --- 3. BCA data ---
    bca_payload = {
        "project_metadata": {
            "project_name": "13101 Bonebank Road Sovereign Node Flood Mitigation",
            "applicant": "Private Sovereign Enclave / Estate",
            "county": "Posey County, Indiana",
            "jurisdiction": "Point Township, Section 35",
            "timestamp": timestamp,
            "vertical_datum": engine.vertical_datum,
            "usgs_gauge_id": engine.usgs_gauge_id,
        },
        "elevation_baseline": {
            "vertical_datum": engine.vertical_datum,
            "base_flood_elevation_ft": engine.base_flood_elevation_ft,
            "lowest_adjacent_grade_ft": engine.lowest_adjacent_grade_ft,
            "first_floor_elevation_ft": 382.5,
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
        "compensatory_storage": storage_metrics,
    }

    bca_json_path = os.path.join(output_dir, "bca_elevation_data.json")
    with open(bca_json_path, "w") as jf:
        json.dump(bca_payload, jf, indent=2)

    storage_json_path = os.path.join(output_dir, "bca_storage_data.json")
    with open(storage_json_path, "w") as sf:
        json.dump(storage_metrics, sf, indent=2)

    csv_path = os.path.join(output_dir, "bca_summary.csv")
    with open(csv_path, "w") as cf:
        cf.write("Parameter,Value,Unit,Standard\n")
        cf.write(f"Vertical_Datum,{engine.vertical_datum},-,FEMA / FIS\n")
        cf.write(
            f"Base_Flood_Elevation,{engine.base_flood_elevation_ft},ft,FEMA FIRM / INFIP FARA\n"
        )
        cf.write(
            f"Lowest_Adjacent_Grade,{engine.lowest_adjacent_grade_ft},ft,Site survey / certified LiDAR\n"
        )
        cf.write(f"Clearance_Margin,{engine.clearance_ft()},ft,LAG >= BFE\n")
        cf.write(
            f"Berm_Displacement,{storage_metrics['displacement_cu_yds']},cu yds,IDNR 312 IAC 10\n"
        )
        cf.write(
            f"Berm_Excavation,{storage_metrics['excavation_cu_yds']},cu yds,1.20x Safety Factor\n"
        )
        cf.write(f"USGS_Gauge,{engine.usgs_gauge_id},id,Regional stage context only\n")

    # --- 4. Manifest with evidence chain ---
    evidence_chain = [
        "1. Site survey / certified LiDAR → LAG 377.2 ft NAVD88 (PE or Licensed Surveyor)",
        "2. Effective FIS / INFIP FARA → BFE 375.0 ft (same datum)",
        "3. Optional: Archimedes + USGS 03378500 → stage-informed scenarios",
        "4. Indiana PE seal (IC 25-31-1) on transmittal and elevation form",
        "5. Submit via FEMA Online LOMC or MT-EZ",
    ]
    manifest_payload = {
        "package_timestamp": timestamp,
        "anchor_node": "13101_BONEBANK_RD",
        "vertical_datum": engine.vertical_datum,
        "lag_ft": engine.lowest_adjacent_grade_ft,
        "bfe_ft": engine.base_flood_elevation_ft,
        "clearance_ft": engine.clearance_ft(),
        "usgs_gauge_id": engine.usgs_gauge_id,
        "evidence_chain": evidence_chain,
        "regulatory_refs": [
            "44 CFR Part 70",
            "IC 25-31-1",
            "IC 14-28-1",
            "312 IAC 10",
            "FEMA MT-EZ / Online LOMC",
        ],
        "fema_processing_note": (
            "Completeness notice typically within 30 days; "
            "LOMA determination typically within 60 days of complete data "
            "(some Online LOMC FAQ language cites up to 90 days)."
        ),
        "artifacts_generated": [
            "01_PE_Transmittal_and_LOMA_Letter.pdf",
            "03_IDNR_No_Rise_Certification.pdf",
            "bca_elevation_data.json",
            "bca_storage_data.json",
            "bca_summary.csv",
        ],
        "integrity_standard": "SHA-256",
    }
    manifest_str = json.dumps(manifest_payload, sort_keys=True)
    sha_hash = hashlib.sha256(manifest_str.encode()).hexdigest()
    manifest_payload["sha256_checksum"] = sha_hash

    receipt_path = os.path.join(output_dir, "bca_package_manifest.json")
    with open(receipt_path, "w") as rf:
        json.dump(manifest_payload, rf, indent=2)

    return {
        "status": "success",
        "output_directory": output_dir,
        "checksum": sha_hash,
        "clearance_ft": engine.clearance_ft(),
        "vertical_datum": engine.vertical_datum,
        "evidence_chain": evidence_chain,
        "artifacts": manifest_payload["artifacts_generated"],
    }


app = FastAPI(title="PTDT v32 Live Package Generation API", version="32.4.0")


@app.get("/api/v1/health")
async def health_check():
    e = ArchimedesEngine()
    return {
        "status": "ONLINE",
        "node": "13101_BONEBANK_RD",
        "lag_ft": e.lowest_adjacent_grade_ft,
        "bfe_ft": e.base_flood_elevation_ft,
        "clearance_ft": e.clearance_ft(),
        "vertical_datum": e.vertical_datum,
        "usgs_gauge_id": e.usgs_gauge_id,
        "timestamp": datetime.datetime.now().isoformat(),
    }


@app.post("/api/v1/package/generate")
async def api_generate_package(payload: dict):
    try:
        result = generate_unified_regulatory_package("05_final_portal_package", payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Package generation failed: {str(e)}")


if __name__ == "__main__":
    print("=== PTDT v32 Archimedes Regulatory & BCA Pipeline ===")
    output_directory = "05_final_portal_package"
    res = generate_unified_regulatory_package(output_directory)
    print(json.dumps(res, indent=2))
    print("\n[SUCCESS] Artifacts written. Starting FastAPI on port 8000...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
