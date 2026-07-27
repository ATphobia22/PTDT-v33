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
        fontSize=14, leading=18, textColor=colors.HexColor('#002B49'), spaceAfter=15, alignment=1),
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
    story.append(Paragraph("TO: FEMA LOMC Clearinghouse / Indiana DNR Division of Water",
    st['Body']))
    story.append(Paragraph("RE: Technical Data Submission for LOMA/LOMR-F - 13101 Bonebank Rd.", st['BoldBody']))
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Forensic Certification Statement:</b>", st['BoldBody']))
    
    cert_text = (
        "I, [P.E. NAME], being a Registered Professional Engineer in the State of Indiana (License #[NUMBER]), "
        "do hereby state that, to the best of my knowledge, the information attached with this submission is true and accurate."
    )
    story.append(Paragraph(cert_text, st['Body']))
    
    story.append(Paragraph("This submission includes:", st['Body']))
    story.append(Paragraph("1. <b>5cm LiDAR Topographic Work Map:</b> Certified to exceed FEMA Risk MAP standard specifications, referenced to the NAVD 88 vertical datum.", st['Indent']))
    story.append(Paragraph("2. <b>Material Truth Simulation Report:</b> Calibrated against USGS Gauge 03378500, demonstrating a property Lowest Adjacent Grade (LAG) of 377.2 ft.", st['Indent']))
    story.append(Paragraph("3. <b>Elevation Certificate:</b> 'As-built' certification for structures on the subject parcel.", st['Indent']))
    
    legal_text = (
        "As required by Indiana IC 25-31-1, I certify that these analyses were performed under my direct supervision "
        "and meet all statutory requirements for floodplain delineation."
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
    story.append(Paragraph("Project: 13101 Bonebank Road Sovereign Node - Flood Mitigation & Forensic Digital Twin", st['BoldBody']))
    story.append(Spacer(1, 10))
    
    p1 = (
        "This project utilizes a Forensic Digital Twin to establish a high-fidelity risk baseline for the Bonebank property. "
        "By integrating 5cm LiDAR data with real-time USGS telemetry, we have identified that the property's First Floor Elevation (FFE) "
        "of 382.5 ft and Lowest Adjacent Grade (LAG) of 377.2 ft offer a measurable margin of safety against the 1% annual chance flood event, "
        "which is currently mischaracterized in the effective FIS."
    )
    story.append(Paragraph(p1, st['Body']))
    
    story.append(Paragraph("The proposed mitigation project—including targeted levee reinforcements and drainage improvements—demonstrates a Benefit-Cost Ratio (BCR) exceeding 1.0 by:", st['Body']))
    
    story.append(Paragraph("<b>1. Preventing Physical Damage:</b> Avoiding $450k+ in projected structural losses to historical family assets during a 100-year event.", st['Indent']))
    story.append(Paragraph("<b>2. Ensuring Life Safety:</b> Providing a 12-hour advanced warning window via a G1P-verified telemetry link to USGS Gauge 03378500.", st['Indent']))
    story.append(Paragraph("<b>3. Avoiding Loss of Function:</b> Preserving functional land use for agricultural and residential purposes, preventing approximately $85k in annual displacement and emergency management costs.", st['Indent']))
    
    p2 = (
        "This narrative serves as the quantitative and qualitative foundation for a Streamlined BCA (for projects under $1M), "
        "providing enough technical detail for a reviewer to visualize the proposal and verify its scientific efficacy."
    )
    story.append(Paragraph(p2, st['Body']))
    
    doc.build(story)
    print(f"[+] Generated: {filename}")

if __name__ == "__main__":
    out_dir = "05_final_portal_package"
    os.makedirs(out_dir, exist_ok=True)
    print("Building Official Regulatory Transmittal & BCA Documents...")
    build_pe_transmittal_letter(out_dir)
    build_bric_bca_narrative(out_dir)
    print("Done. Documents are ready for P.E. Signature and FEMA GO upload.")
