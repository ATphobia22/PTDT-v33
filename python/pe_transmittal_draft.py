#!/usr/bin/env python3
"""
PE Transmittal letter — DRAFT with blank signature.
Does not certify anything. PE must complete and seal.
"""
from __future__ import annotations

import datetime as dt
import os

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer


def build_pe_transmittal_draft(output_dir: str = "05_better_data_agency_package") -> str:
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, "01_PE_Transmittal_Letter_DRAFT.pdf")
    styles = getSampleStyleSheet()
    st = {
        "Header": ParagraphStyle(
            "H", parent=styles["Normal"], fontName="Helvetica-Bold", fontSize=11, spaceAfter=12
        ),
        "Body": ParagraphStyle(
            "B", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14, spaceAfter=10
        ),
        "Warn": ParagraphStyle(
            "W",
            parent=styles["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=colors.HexColor("#8B0000"),
            spaceAfter=12,
        ),
        "Sign": ParagraphStyle(
            "S", parent=styles["Normal"], fontName="Helvetica", fontSize=10, leading=14, spaceBefore=28
        ),
    }
    story = []
    story.append(Paragraph("[ENGINEERING FIRM LETTERHEAD]", st["Header"]))
    story.append(
        Paragraph(
            f"DATE: {dt.datetime.now(dt.timezone.utc).strftime('%B %d, %Y')} UTC<br/>"
            "TO: FEMA Online LOMC / Indiana DNR Division of Water<br/>"
            "RE: Technical data package — LOMA / floodway support — 13101 Bonebank Rd, "
            "Point Township, Posey County, IN",
            st["Body"],
        )
    )
    story.append(
        Paragraph(
            "DRAFT — NOT SIGNED. Software generated this worksheet. "
            "A licensed Indiana Professional Engineer must revise, supervise analyses, "
            "and apply seal. Do not file this PDF as a PE certification.",
            st["Warn"],
        )
    )
    story.append(Paragraph("<b>Intended certification language (for PE revision):</b>", st["Body"]))
    story.append(
        Paragraph(
            "I, [P.E. NAME], Registered Professional Engineer in the State of Indiana "
            "(License #[NUMBER]), state that, to the best of my knowledge, the attached "
            "technical information was prepared under my supervision and is true and accurate "
            "for the purpose of map amendment / floodway review as applicable.",
            st["Body"],
        )
    )
    story.append(Paragraph("Typical attachments checklist:", st["Body"]))
    story.append(
        Paragraph(
            "1. Survey / topographic work map referenced to <b>NAVD 88</b>.<br/>"
            "2. HEC-RAS (or equivalent) model-of-record files and comparison table.<br/>"
            "3. Elevation data: BFE from effective map; LAG/FFE from survey.<br/>"
            "4. INFIP FARA and better-data comparison package (optional support).",
            st["Body"],
        )
    )
    story.append(
        Paragraph(
            "_______________________________________<br/>"
            "Signature<br/>[Printed Name], P.E.<br/>"
            "Indiana License No: _______________<br/>"
            "Date: _______________<br/><br/>"
            "<i>(Apply Indiana P.E. stamp/seal here)</i>",
            st["Sign"],
        )
    )
    doc = SimpleDocTemplate(path, pagesize=letter, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    doc.build(story)
    return path


if __name__ == "__main__":
    print(build_pe_transmittal_draft())
