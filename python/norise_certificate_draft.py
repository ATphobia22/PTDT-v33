#!/usr/bin/env python3
"""
IDNR No-Rise *draft* certificate PDF generator.

IMPORTANT:
- This produces a DRAFT engineering worksheet for a licensed Indiana PE to review.
- Software cannot issue a No-Rise certification. Signature block is intentionally blank.
- Fill volumes must be replaced with PE-run HEC-RAS results before filing.
"""
from __future__ import annotations

import datetime as dt
import os
from typing import Dict, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


class NoRiseCertificateDraftGenerator:
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.timestamp = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

    def _styles(self) -> Dict[str, ParagraphStyle]:
        base = getSampleStyleSheet()
        return {
            "Title": ParagraphStyle(
                "DocTitle",
                parent=base["Heading1"],
                fontName="Helvetica-Bold",
                fontSize=12,
                textColor=colors.HexColor("#002B49"),
                spaceAfter=8,
            ),
            "Heading": ParagraphStyle(
                "DocHeading",
                parent=base["Heading2"],
                fontName="Helvetica-Bold",
                fontSize=10,
                textColor=colors.HexColor("#005587"),
                spaceBefore=10,
                spaceAfter=4,
            ),
            "Body": ParagraphStyle(
                "DocBody",
                parent=base["Normal"],
                fontName="Helvetica",
                fontSize=9,
                leading=12,
                spaceAfter=6,
            ),
            "Warn": ParagraphStyle(
                "DocWarn",
                parent=base["Normal"],
                fontName="Helvetica-Bold",
                fontSize=9,
                textColor=colors.HexColor("#8B0000"),
                spaceAfter=8,
            ),
        }

    def generate(
        self,
        fill_cu_yd: float = 100.0,
        cut_cu_yd: float = 120.0,
        safety_factor: float = 1.20,
        bfe_ft: float = 375.0,
        project: str = "13101 Bonebank Road Flood Defense (Point Township, Posey County, IN)",
        filename: str = "03_IDNR_No_Rise_Certification_DRAFT.pdf",
    ) -> str:
        path = os.path.join(self.output_dir, filename)
        st = self._styles()
        story = []
        story.append(Paragraph("INDIANA DNR DIVISION OF WATER — NO-RISE CERTIFICATION (DRAFT)", st["Title"]))
        story.append(
            Paragraph(
                f"<b>DATE:</b> {self.timestamp}<br/>"
                f"<b>PROJECT:</b> {project}<br/>"
                f"<b>STATUTORY REFERENCES:</b> IC 14-28-1; 312 IAC 10<br/>"
                f"<b>STATUS:</b> DRAFT — NOT SIGNED — NOT FILED",
                st["Body"],
            )
        )
        story.append(
            Paragraph(
                "WARNING: This PDF is a computational worksheet only. "
                "A licensed Indiana Professional Engineer must independently review HEC-RAS "
                "(or equivalent) results, survey data, and sign the certification. "
                "Automated systems cannot certify No-Rise.",
                st["Warn"],
            )
        )
        story.append(Paragraph("1. Draft No-Rise Statement (for PE revision)", st["Heading"]))
        story.append(
            Paragraph(
                "Draft language for PE review: Based on the attached hydrodynamic modeling and "
                f"topographic data on NAVD 88, the proposed work is intended to result in "
                f"<b>0.000 feet</b> of increase to the regulatory BFE of {bfe_ft:.1f} ft MSL. "
                "Final certification requires PE judgment and model-of-record files.",
                st["Body"],
            )
        )
        story.append(Paragraph(f"2. Compensatory storage screening ({safety_factor:.2f}× project factor)", st["Heading"]))
        net = cut_cu_yd - fill_cu_yd
        ratio = cut_cu_yd / max(fill_cu_yd, 1e-9)
        table_data = [
            ["Metric", "Value", "Note"],
            ["Fill volume V_fill (cu yd)", f"{fill_cu_yd:.2f}", "Replace with PE takeoff"],
            ["Cut volume V_cut (cu yd)", f"{cut_cu_yd:.2f}", "Replace with PE takeoff"],
            ["Ratio V_cut / V_fill", f"{ratio:.3f}", f"Project target ≥ {safety_factor:.2f}"],
            ["Net (cut − fill)", f"{net:.2f}", "Prefer net storage increase"],
        ]
        t = Table(table_data, colWidths=[180, 100, 180])
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#002B49")),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CCCCCC")),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                    ("PADDING", (0, 0), (-1, -1), 5),
                ]
            )
        )
        story.append(t)
        story.append(Spacer(1, 24))
        story.append(Paragraph("3. Professional Engineer signature (required)", st["Heading"]))
        story.append(
            Paragraph(
                "I am a Professional Engineer licensed in the State of Indiana. "
                "I have reviewed the hydraulic model, survey, and storage calculations "
                "and certify No-Rise under applicable IDNR requirements.<br/><br/>"
                "Name: ______________________________ &nbsp;&nbsp; License #: _______________<br/><br/>"
                "Signature: ___________________________ &nbsp;&nbsp; Date: ___________________",
                st["Body"],
            )
        )
        doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
        doc.build(story)
        return path


if __name__ == "__main__":
    out = NoRiseCertificateDraftGenerator("05_better_data_agency_package").generate()
    print(out)
