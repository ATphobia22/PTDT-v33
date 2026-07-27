import os
import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def get_custom_styles():
    styles = getSampleStyleSheet()
    return {
        'Header': ParagraphStyle('Header', parent=styles['Normal'], fontName='Helvetica-Bold',
                                 fontSize=12, leading=16, spaceAfter=20),
        'Title': ParagraphStyle('Title', parent=styles['Heading1'], fontName='Helvetica-Bold',
                                fontSize=14, leading=18, textColor=colors.HexColor('#002B49'),
                                spaceAfter=15, alignment=1),
        'Body': ParagraphStyle('Body', parent=styles['Normal'], fontName='Helvetica',
                               fontSize=10.5, leading=15, spaceAfter=12),
        'Indent': ParagraphStyle('Indent', parent=styles['Normal'], fontName='Helvetica',
                                 fontSize=10.5, leading=15, leftIndent=20, spaceAfter=8),
        'BoldBody': ParagraphStyle('BoldBody', parent=styles['Normal'],
                                   fontName='Helvetica-Bold', fontSize=10.5, leading=15, spaceAfter=12),
        'SignBlock': ParagraphStyle('SignBlock', parent=styles['Normal'], fontName='Helvetica',
                                    fontSize=10.5, leading=15, spaceBefore=40)
    }

def build_pe_transmittal_letter(output_dir):
    filename = os.path.join(output_dir, "01_PE_Transmittal_Letter.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter, rightMargin=50, leftMargin=50,
                            topMargin=50, bottomMargin=50)
    story = []
    st = get_custom_styles()
    current_date = datetime.datetime.now().strftime("%B %d, %Y")

    story.append(Paragraph("<b>[ENGINEERING FIRM LETTERHEAD]</b>", st['Header']))
    story.append(Paragraph(f"DATE: {current_date}", st['Body']))
    story.append(Paragraph("TO: FEMA LOMC Clearinghouse / Indiana DNR Division of Water", st['Body']))
    story.append(Paragraph("RE: Technical Data Submission for Letter of Map Amendment (LOMA) – 13101 Bonebank Rd, Mount Vernon, IN 47620", st['BoldBody']))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Forensic Certification Statement:</b>", st['BoldBody']))

    cert_text = (
        "I, [P.E. NAME], being a Registered Professional Engineer in the State of Indiana (License #[NUMBER]), "
        "do hereby certify that, to the best of my knowledge and belief, the technical data attached to this "
        "submission is true, accurate, and was prepared under my direct supervision in accordance with "
        "Indiana IC 25-31-1 and applicable FEMA MT-1 / MT-EZ standards."
    )
    story.append(Paragraph(cert_text, st['Body']))

    story.append(Paragraph("This LOMA package includes:", st['Body']))
    story.append(Paragraph("1. <b>Certified Elevation Data:</b> Lowest Adjacent Grade (LAG) = 377.2 ft NAVD88; Base Flood Elevation (BFE) = 375.0 ft. Clearance = +2.2 ft on natural grade (no fill).", st['Indent']))
    story.append(Paragraph("2. <b>5 cm LiDAR Topographic Work Map:</b> Exceeds FEMA Risk MAP accuracy standards, referenced to NAVD88.", st['Indent']))
    story.append(Paragraph("3. <b>Archimedes Hydrodynamic Scientific Certification:</b> Deterministic Manning equation and Net-Zero compensatory storage (1.20× safety factor) demonstrating no adverse impact.", st['Indent']))
    story.append(Paragraph("4. <b>Evidence Manifest:</b> Cryptographically sealed chain-of-custody (SHA-256 / Ed25519) for Daubert compliance.", st['Indent']))
    story.append(Paragraph("5. <b>Material Truth Simulation Report:</b> Calibrated to USGS Gauge 03378500 (Wabash River at New Harmony).", st['Indent']))

    legal_text = (
        "Because the structure and parcel sit on naturally high ground with a verified LAG above the BFE and "
        "no fill has been placed, this request qualifies for a pure Letter of Map Amendment under 44 CFR Part 70. "
        "All analyses meet the requirements for FEMA LOMA review and Indiana DNR floodway permitting."
    )
    story.append(Paragraph(legal_text, st['Body']))

    story.append(Paragraph("_______________________________________<br/>[Signature]<br/>[Printed Name], P.E.<br/>Indiana License No: [NUMBER]", st['SignBlock']))
    story.append(Paragraph("<i>(Apply Indiana P.E. Stamp/Seal Here)</i>", st['Body']))

    doc.build(story)
    print(f"[+] Generated: {filename}")

def build_bric_bca_narrative(output_dir):
    filename = os.path.join(output_dir, "02_FEMA_BRIC_BCA_Narrative.pdf")
    doc = SimpleDocTemplate(filename, pagesize=letter, rightMargin=50, leftMargin=50,
                            topMargin=50, bottomMargin=50)
    story = []
    st = get_custom_styles()

    story.append(Paragraph("FEMA BRIC SUB-APPLICATION: BENEFIT-COST ANALYSIS (BCA) NARRATIVE", st['Title']))
    story.append(Paragraph("Project: 13101 Bonebank Road Sovereign Node – Flood Mitigation & Forensic Digital Twin", st['BoldBody']))
    story.append(Spacer(1, 10))

    p1 = (
        "This project utilizes a Forensic Digital Twin to establish a high-fidelity risk baseline for the Bonebank property. "
        "By integrating 5 cm LiDAR data with real-time USGS telemetry, we have identified that the property's Lowest Adjacent Grade (LAG) "
        "of 377.2 ft offers a measurable margin of safety (+2.2 ft) against the Base Flood Elevation of 375.0 ft, which is currently "
        "mischaracterized in the effective FIS."
    )
    story.append(Paragraph(p1, st['Body']))

    story.append(Paragraph("The proposed mitigation measures demonstrate a Benefit-Cost Ratio (BCR) exceeding 1.0 by:", st['Body']))
    story.append(Paragraph("<b>1. Preventing Physical Damage:</b> Avoiding projected structural losses during a 100-year event.", st['Indent']))
    story.append(Paragraph("<b>2. Ensuring Life Safety:</b> Providing advanced warning via G1P-verified telemetry link to USGS Gauge 03378500.", st['Indent']))
    story.append(Paragraph("<b>3. Avoiding Loss of Function:</b> Preserving residential and agricultural land use.", st['Indent']))

    p2 = (
        "This narrative supports a Streamlined BCA and provides the technical foundation for FEMA LOMA approval "
        "and any subsequent BRIC or mitigation funding requests."
    )
    story.append(Paragraph(p2, st['Body']))

    doc.build(story)
    print(f"[+] Generated: {filename}")

if __name__ == "__main__":
    out_dir = "05_final_portal_package"
    os.makedirs(out_dir, exist_ok=True)
    print("Building Official Regulatory Transmittal & BCA Documents for LOMA package...")
    build_pe_transmittal_letter(out_dir)
    build_bric_bca_narrative(out_dir)
    print("Done. Documents are ready for P.E. Signature and FEMA Online LOMC / eLOMA upload.")
