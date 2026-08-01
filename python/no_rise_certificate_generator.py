#!/usr/bin/env python3
"""
UNSIGNED IDNR No-Rise PDF draft generator (ReportLab).
From No rise Gen.pdf — produces DRAFT only. PE must seal separately (IC 25-31-1).
"""
from __future__ import annotations

import datetime
import os

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


class NoRiseCertificateGenerator:
    def __init__(self, output_dir: str):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def get_styles(self):
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
                fontSize=10.5,
                leading=14.5,
                textColor=colors.HexColor("#005587"),
                spaceBefore=10,
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

    def generate_certificate(self) -> str:
        filename = os.path.join(self.output_dir, "03_IDNR_No_Rise_Certification_DRAFT.pdf")
        doc = SimpleDocTemplate(
            filename, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
        )
        story = []
        st = self.get_styles()

        story.append(
            Paragraph(
                "<b>INDIANA DNR DIVISION OF WATER: NO-RISE CERTIFICATION</b>",
                st["Title"],
            )
        )
        story.append(
            Paragraph(
                f"<b>STATUS:</b> DRAFT — UNSIGNED — NOT A SEALED INSTRUMENT<br/>"
                f"<b>DATE:</b> {self.timestamp}<br/>"
                f"<b>PROJECT:</b> 13101 Bonebank Road Flood Defense "
                f"(Point Township, Posey County, IN)<br/>"
                f"<b>STATUTORY STANDARD:</b> Indiana Flood Control Act (IC 14-28-1) &amp; 312 IAC 10",
                st["Body"],
            )
        )
        story.append(Spacer(1, 8))

        story.append(Paragraph("1. Engineering Certification &amp; No-Rise Statement", st["Heading"]))
        statement = (
            "This DRAFT states that the proposed activity is intended to cause no increase "
            "in Base Flood Elevation (target surcharge 0.000 ft) when compensatory storage "
            "satisfies V_cut &ge; 1.20 × V_fill. <b>This PDF is not valid without an Indiana "
            "Professional Engineer seal under IC 25-31-1.</b>"
        )
        story.append(Paragraph(statement, st["Body"]))

        story.append(Paragraph("2. Site Elevations (NAVD88)", st["Heading"]))
        story.append(
            Paragraph(
                "BFE 375.0 ft &nbsp;|&nbsp; LAG 377.2 ft &nbsp;|&nbsp; FFE 382.5 ft &nbsp;|&nbsp; "
                "Clearance +2.2 ft<br/>"
                "Note: Confirm FIRM panel against FEMA MSC (sources list both 18129C0215D and 18129C0225D).",
                st["Body"],
            )
        )

        story.append(Paragraph("3. Signature block (PE only)", st["Heading"]))
        story.append(
            Paragraph(
                "Indiana PE Name: _______________________________<br/>"
                "License No.: ___________________________________<br/>"
                "Seal: [affix wet or electronic seal]<br/>"
                "Signature / Date: _______________________________",
                st["Sign"],
            )
        )

        doc.build(story)
        return filename


if __name__ == "__main__":
    out = NoRiseCertificateGenerator("certification/generated").generate_certificate()
    print("wrote", out)
