# -*- coding: utf-8 -*-
"""
PTDT Archimedes sidecar — illustrative hydro + compensatory storage + USGS + unsigned PDF.

Does NOT issue PE seals, certified No-Rise, or FIPS-204 signatures.
Gage height (ft above gage zero) is never treated as NAVD88 WSE.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import logging
import os
import sys
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [archimedes] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("archimedes")

OUTPUT_DIR = Path(os.getenv("PTDT_OUTPUT_DIR", "05_final_portal_package"))
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

BFE_FT = 375.0
LAG_FT = 377.2
COMP_FACTOR = 1.20
USGS_SITES = "03378500,03322000"
USGS_IV = "https://waterservices.usgs.gov/nwis/iv/"


@dataclass(frozen=True)
class HydraulicState:
    surface_discharge_cms: float
    water_depth_m: float
    velocity_ms: float


class SimRequest(BaseModel):
    usgs_stage_ft: Optional[float] = None
    discharge_cfs: Optional[float] = None
    berm_length_ft: float = 300.0
    berm_width_ft: float = 10.0
    berm_height_ft: float = 3.0
    # Optional assumed channel invert for ILLUSTRATIVE depth only — not BFE
    assumed_invert_ft: float = 370.0


class ArchimedesHydroEngine:
    """Deterministic Manning + compensatory storage. Illustrative unless PE-sealed."""

    def __init__(self) -> None:
        self.base_flood_elevation_ft = BFE_FT
        self.lowest_adjacent_grade_ft = LAG_FT
        self.manning_n_floodplain = 0.045
        self.river_slope = 0.00015
        self.compensatory_safety_factor = COMP_FACTOR

    def calculate_open_channel_velocity(self, depth_ft: float) -> float:
        if depth_ft <= 0.0:
            return 0.0
        v = (
            (1.486 / self.manning_n_floodplain)
            * (depth_ft ** (2.0 / 3.0))
            * (self.river_slope ** 0.5)
        )
        return round(v, 3)

    def calculate_compensatory_storage(
        self, length_ft: float, width_ft: float, height_ft: float
    ) -> Dict[str, float]:
        displacement_cu_ft = length_ft * width_ft * height_ft
        displacement_cu_yd = displacement_cu_ft / 27.0
        required_cut_cu_yd = displacement_cu_yd * self.compensatory_safety_factor
        return {
            "berm_fill_cu_yds": round(displacement_cu_yd, 2),
            "required_compensatory_cut_cu_yds": round(required_cut_cu_yd, 2),
            "net_floodway_volumetric_delta_yds": round(
                required_cut_cu_yd - displacement_cu_yd, 2
            ),
            "factor": self.compensatory_safety_factor,
        }


def fetch_usgs_iv(sites: str = USGS_SITES) -> Dict[str, Any]:
    """Live NWIS IV; no fake high-stage fallback (381.2 was invalid)."""
    params = {
        "format": "json",
        "sites": sites,
        "parameterCd": "00060,00065",
        "siteStatus": "all",
    }
    r = requests.get(
        USGS_IV,
        params=params,
        timeout=12,
        headers={"User-Agent": "PTDT-Archimedes-Sidecar"},
    )
    r.raise_for_status()
    raw = r.json()
    series = raw.get("value", {}).get("timeSeries", [])
    out: Dict[str, Dict[str, Any]] = {}
    for ts in series:
        site = ts.get("sourceInfo", {}).get("siteCode", [{}])[0].get("value", "?")
        name = ts.get("sourceInfo", {}).get("siteName", site)
        code = ts.get("variable", {}).get("variableCode", [{}])[0].get("value")
        vals = ts.get("values", [{}])[0].get("value", [])
        if not vals:
            continue
        latest = vals[-1]
        try:
            v = float(latest.get("value"))
        except (TypeError, ValueError):
            continue
        if site not in out:
            out[site] = {
                "site": site,
                "name": name,
                "stage_ft": None,
                "discharge_cfs": None,
                "timestamp": latest.get("dateTime"),
            }
        if code == "00065":
            out[site]["stage_ft"] = v
            out[site]["timestamp"] = latest.get("dateTime")
        elif code == "00060":
            out[site]["discharge_cfs"] = v
    if not out:
        raise RuntimeError("USGS returned no values")
    return {"success": True, "source": "USGS_NWIS_LIVE", "data": list(out.values())}


def sha256_hex(payload: str) -> str:
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def generate_unsigned_package(meta: Dict[str, Any]) -> Dict[str, Any]:
    """ReportLab dossier marked UNSIGNED / ILLUSTRATIVE."""
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
        from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
    except ImportError as e:
        raise HTTPException(
            status_code=503,
            detail=f"reportlab not installed: {e}. pip install reportlab",
        ) from e

    pdf_path = OUTPUT_DIR / "PTDT_Illustrative_Dossier_UNSIGNED.pdf"
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40,
    )
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontSize=16,
        textColor=colors.HexColor("#1B365D"),
    )
    body = ParagraphStyle("DocBody", parent=styles["BodyText"], fontSize=9, leading=12)
    elements: List[Any] = []
    elements.append(Paragraph("PTDT Archimedes — Illustrative Technical Summary", title))
    elements.append(
        Paragraph(
            "<b>UNSIGNED · NOT PE-SEALED · NOT A NO-RISE CERTIFICATION</b>",
            styles["Normal"],
        )
    )
    elements.append(Spacer(1, 12))
    elements.append(
        Paragraph(
            f"Anchor: 13101 Bonebank Road, Posey County, IN<br/>"
            f"BFE {BFE_FT} ft NAVD88 · LAG {LAG_FT} ft · factor {COMP_FACTOR}x<br/>"
            f"Generated: {dt.date.today().isoformat()}<br/>"
            f"Meta: {json.dumps(meta)[:500]}",
            body,
        )
    )
    elements.append(Spacer(1, 12))
    data = [
        ["Item", "Value", "Status"],
        ["Compensatory factor", f"{COMP_FACTOR}x", "Reference (312 IAC 10 context)"],
        ["BFE / LAG", f"{BFE_FT} / {LAG_FT} ft", "Site constants"],
        ["Manning / storage math", "See JSON API", "ILLUSTRATIVE_ONLY"],
        ["PE No-Rise / LOMA", "—", "Requires Indiana PE + agency filing"],
    ]
    t = Table(data, colWidths=[140, 160, 180])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1B365D")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D5D8DC")),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F4F6F8")),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
            ]
        )
    )
    elements.append(t)
    elements.append(Spacer(1, 16))
    elements.append(
        Paragraph(
            "This PDF is an engineering worksheet template only. "
            "It does not certify floodway no-rise, LOMA eligibility, or grant BCR figures.",
            body,
        )
    )
    doc.build(elements)

    seal_payload = json.dumps({"pdf": str(pdf_path), "meta": meta}, sort_keys=True)
    return {
        "status": "SUCCESS_UNSIGNED",
        "output_directory": str(OUTPUT_DIR),
        "sha256": sha256_hex(seal_payload),
        "artifacts": [str(pdf_path)],
        "disclaimer": "UNSIGNED illustrative dossier — not PE-sealed",
    }


app = FastAPI(
    title="PTDT Archimedes Sidecar",
    version="1.0.0-illustrative",
    description="Bonebank hydro helpers — not a substitute for PE HEC-RAS or agency filings",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

hydro = ArchimedesHydroEngine()


@app.get("/api/v1/health")
def health() -> Dict[str, Any]:
    return {
        "status": "ONLINE",
        "node": "13101_BONEBANK_RD",
        "mode": "ILLUSTRATIVE_SIDECAR",
        "bfe_ft": BFE_FT,
        "lag_ft": LAG_FT,
        "compensatory_factor": COMP_FACTOR,
        "usgs_sites": USGS_SITES,
        "timestamp": dt.datetime.now(dt.timezone.utc).isoformat(),
    }


@app.get("/api/v1/usgs")
def usgs_live() -> Dict[str, Any]:
    try:
        return fetch_usgs_iv()
    except Exception as e:
        logger.warning("USGS failed: %s", e)
        raise HTTPException(status_code=502, detail=f"USGS unavailable: {e}") from e


@app.post("/api/v1/twin/simulate")
def simulate(payload: SimRequest) -> Dict[str, Any]:
    stage = payload.usgs_stage_ft
    flow = payload.discharge_cfs
    usgs_meta: Any = None
    if stage is None or flow is None:
        try:
            live = fetch_usgs_iv()
            usgs_meta = live
            primary = next(
                (d for d in live["data"] if d["site"] == "03378500"),
                live["data"][0],
            )
            if stage is None:
                stage = primary.get("stage_ft")
            if flow is None:
                flow = primary.get("discharge_cfs")
        except Exception as e:
            logger.warning("live USGS for sim failed: %s", e)

    if stage is None:
        stage = 3.0  # neutral low-flow placeholder labeled below — NOT 381.2
    if flow is None:
        flow = 10000.0

    # Illustrative depth from assumed invert — NOT gage-to-BFE and NOT certified WSE
    depth_ft = max(0.1, float(stage) - payload.assumed_invert_ft)
    # If stage is gage height (~3 ft), depth formula is meaningless; clamp for display
    if float(stage) < 50:
        depth_ft = max(0.5, float(stage))  # treat as relative depth proxy only
        depth_mode = "GAGE_HEIGHT_PROXY"
    else:
        depth_mode = "STAGE_MINUS_ASSUMED_INVERT"

    velocity = hydro.calculate_open_channel_velocity(depth_ft)
    hydraulic = HydraulicState(
        surface_discharge_cms=float(flow) * 0.0283168,
        water_depth_m=depth_ft * 0.3048,
        velocity_ms=velocity,
    )
    storage = hydro.calculate_compensatory_storage(
        payload.berm_length_ft, payload.berm_width_ft, payload.berm_height_ft
    )
    trail = [
        "ILLUSTRATIVE_ONLY — not PE-sealed HEC-RAS",
        f"depth_mode={depth_mode}",
        "Indiana floodway no-rise / 0.14 ft cumulative rules require PE models",
        f"site BFE={BFE_FT} LAG={LAG_FT} (constants, not from this sim)",
    ]
    gov_payload = json.dumps(
        {"metrics": asdict(hydraulic), "storage": storage, "trail": trail},
        sort_keys=True,
    )
    return {
        "status": "illustrative",
        "node": "13101_BONEBANK_RD",
        "inputs": {
            "stage_ft": stage,
            "discharge_cfs": flow,
            "note": "stage is USGS gage height unless you supply modeled WSE",
        },
        "metrics": asdict(hydraulic),
        "compensatory_storage": storage,
        "governance": {
            "decision": "ILLUSTRATIVE_ONLY_NOT_PE_SEALED",
            "statute_reference": "IN 312 IAC 10 context only",
            "audit_trail": trail,
            "cryptographic_hash": sha256_hex(gov_payload),
            "timestamp": dt.datetime.now(dt.timezone.utc).isoformat(),
        },
        "usgs_snapshot": usgs_meta,
    }


@app.post("/api/v1/package/generate")
def package_generate(payload: Dict[str, Any] = None) -> Dict[str, Any]:
    return generate_unsigned_package(payload or {})


@app.get("/api/v1/compliance/export-pdf")
def export_pdf():
    pdf_path = OUTPUT_DIR / "PTDT_Illustrative_Dossier_UNSIGNED.pdf"
    if not pdf_path.exists():
        generate_unsigned_package({})
    return FileResponse(
        path=str(pdf_path),
        filename="PTDT_Illustrative_Dossier_UNSIGNED.pdf",
        media_type="application/pdf",
    )


if __name__ == "__main__":
    port = int(os.getenv("ARCHIMEDES_PORT", "8000"))
    logger.info("Archimedes illustrative sidecar on %s", port)
    uvicorn.run(app, host="0.0.0.0", port=port)
