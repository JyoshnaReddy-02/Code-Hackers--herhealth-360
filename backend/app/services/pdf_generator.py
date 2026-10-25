import os
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

GENERATED_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "generated")

def generate_health_passport_pdf(user, symptoms, appointments, start_date=None, end_date=None) -> str:
    """
    Generates a Personal Health Passport PDF using ReportLab and returns the absolute file path on E: drive.
    """
    os.makedirs(GENERATED_DIR, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    pdf_filename = f"health_passport_user_{user.id}_{timestamp}.pdf"
    pdf_path = os.path.join(GENERATED_DIR, pdf_filename)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom styles
    primary_color = colors.HexColor("#7A2E50")     # Muted rose / plum
    secondary_color = colors.HexColor("#C86D51")   # Coral accent
    text_color = colors.HexColor("#2D2A32")        # Deep plum/navy
    light_bg = colors.HexColor("#FDF8F5")          # Warm off-white
    border_color = colors.HexColor("#E5D7D0")

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=primary_color,
        alignment=0
    )

    tagline_style = ParagraphStyle(
        "ReportTagline",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=secondary_color
    )

    heading2_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=text_color
    )

    disclaimer_style = ParagraphStyle(
        "DisclaimerText",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#6E6B7B")
    )

    table_header_style = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=10,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=10,
        textColor=text_color
    )

    elements = []

    # 1. Header Banner
    header_data = [
        [
            Paragraph("<b>HerHealth 360</b> — Personal Health Passport", title_style),
            Paragraph(f"<b>Generated:</b> {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}<br/><b>Prototype ID:</b> HH360-U{user.id}", body_style)
        ],
        [
            Paragraph("<i>Every stage of her health. One trusted place.</i>", tagline_style),
            Paragraph(f"<b>Date Filter:</b> {start_date or 'All Time'} to {end_date or 'Present'}", body_style)
        ]
    ]
    header_table = Table(header_data, colWidths=[4.2 * inch, 2.8 * inch])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(header_table)
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceBefore=4, spaceAfter=10))

    # 2. Disclaimer Box
    disclaimer_content = [
        [Paragraph(
            "<b>IMPORTANT CLINICAL NOTICE & MEDICAL DISCLAIMER:</b> This document is automatically generated "
            "from self-reported observations recorded by the user in the HerHealth 360 educational hackathon prototype. "
            "It does NOT constitute a medical diagnosis, certified clinical record, or lab test result. "
            "Always consult a qualified, licensed healthcare professional for clinical evaluation, diagnosis, or treatment.",
            disclaimer_style
        )]
    ]
    disclaimer_table = Table(disclaimer_content, colWidths=[7.0 * inch])
    disclaimer_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), light_bg),
        ('BOX', (0, 0), (-1, -1), 1, border_color),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(disclaimer_table)
    elements.append(Spacer(1, 12))

    # 3. User Summary
    elements.append(Paragraph("1. User Profile & Summary", heading2_style))
    profile_data = [
        [
            Paragraph("<b>Name:</b>", body_style),
            Paragraph(user.display_name or "Not Specified", body_style),
            Paragraph("<b>Life Stage:</b>", body_style),
            Paragraph(user.life_stage.replace("_", " ").title() if user.life_stage else "Reproductive", body_style)
        ],
        [
            Paragraph("<b>Account Email:</b>", body_style),
            Paragraph(user.email, body_style),
            Paragraph("<b>Date of Birth:</b>", body_style),
            Paragraph(user.date_of_birth or "Not recorded", body_style)
        ]
    ]
    profile_table = Table(profile_data, colWidths=[1.4 * inch, 2.1 * inch, 1.4 * inch, 2.1 * inch])
    profile_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#FAF7F5")),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    elements.append(profile_table)
    elements.append(Spacer(1, 12))

    # 4. Symptom Statistics
    total_entries = len(symptoms)
    if total_entries > 0:
        severities = [s.severity for s in symptoms if s.severity is not None]
        avg_sev = round(sum(severities) / len(severities), 1) if severities else 0.0
        max_sev = max(severities) if severities else 0
        
        # Category counts
        cat_counts = {}
        for s in symptoms:
            cat_counts[s.category] = cat_counts.get(s.category, 0) + 1
        top_cats = ", ".join([f"{k} ({v})" for k, v in sorted(cat_counts.items(), key=lambda x: x[1], reverse=True)[:3]])
    else:
        avg_sev = 0.0
        max_sev = 0
        top_cats = "None recorded"

    elements.append(Paragraph("2. Symptom Observations Overview", heading2_style))
    stat_data = [
        [
            Paragraph("<b>Total Recorded Observations:</b>", body_style),
            Paragraph(str(total_entries), body_style),
            Paragraph("<b>Average Severity (1-10):</b>", body_style),
            Paragraph(f"{avg_sev} / 10", body_style)
        ],
        [
            Paragraph("<b>Peak Severity Observed:</b>", body_style),
            Paragraph(f"{max_sev} / 10", body_style),
            Paragraph("<b>Top Categories:</b>", body_style),
            Paragraph(top_cats, body_style)
        ]
    ]
    stat_table = Table(stat_data, colWidths=[1.8 * inch, 1.7 * inch, 1.8 * inch, 1.7 * inch])
    stat_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#F7F2EF")),
        ('BOX', (0, 0), (-1, -1), 0.5, border_color),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    elements.append(stat_table)
    elements.append(Spacer(1, 12))

    # 5. Symptom History Table
    elements.append(Paragraph("3. Detailed Symptom History", heading2_style))
    if total_entries == 0:
        elements.append(Paragraph("<i>No symptom entries recorded for the selected date range.</i>", body_style))
    else:
        table_rows = [
            [
                Paragraph("<b>Date / Time</b>", table_header_style),
                Paragraph("<b>Category</b>", table_header_style),
                Paragraph("<b>Symptom</b>", table_header_style),
                Paragraph("<b>Sev.</b>", table_header_style),
                Paragraph("<b>Duration</b>", table_header_style),
                Paragraph("<b>Notes / Context</b>", table_header_style),
            ]
        ]
        
        for s in symptoms[:40]:  # Limit to 40 entries for readable pagination
            date_str = s.recorded_at.strftime("%Y-%m-%d %H:%M") if s.recorded_at else "N/A"
            dur_str = f"{s.duration_hours}h" if s.duration_hours else "—"
            notes_str = (s.notes[:75] + "...") if s.notes and len(s.notes) > 75 else (s.notes or "—")
            
            # Additional context
            extra = []
            if s.cycle_day: extra.append(f"Day {s.cycle_day}")
            if s.mood: extra.append(s.mood)
            if extra: notes_str += f" [{', '.join(extra)}]"

            table_rows.append([
                Paragraph(date_str, table_cell_style),
                Paragraph(s.category, table_cell_style),
                Paragraph(s.symptom_name, table_cell_style),
                Paragraph(str(s.severity), table_cell_style),
                Paragraph(dur_str, table_cell_style),
                Paragraph(notes_str, table_cell_style)
            ])

        sym_table = Table(table_rows, colWidths=[1.1 * inch, 1.2 * inch, 1.3 * inch, 0.5 * inch, 0.7 * inch, 2.2 * inch])
        sym_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), primary_color),
            ('ALIGN', (3, 0), (4, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, border_color),
            ('PADDING', (0, 0), (-1, -1), 4),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAF8F6")]),
        ]))
        elements.append(sym_table)

    elements.append(Spacer(1, 12))

    # 6. Appointments Section
    elements.append(Paragraph("4. Scheduled & Completed Consultations (Demo Clinicians)", heading2_style))
    if not appointments:
        elements.append(Paragraph("<i>No appointment records on file.</i>", body_style))
    else:
        apt_rows = [
            [
                Paragraph("<b>Date / Time</b>", table_header_style),
                Paragraph("<b>Clinician (Fictional Demo)</b>", table_header_style),
                Paragraph("<b>Specialty</b>", table_header_style),
                Paragraph("<b>Status</b>", table_header_style),
                Paragraph("<b>Notes</b>", table_header_style)
            ]
        ]
        for a in appointments[:10]:
            time_str = a.appointment_time.strftime("%Y-%m-%d %H:%M") if a.appointment_time else "N/A"
            doc_name = a.doctor.name if a.doctor else "Clinician"
            spec = a.doctor.specialty if a.doctor else ""
            notes = a.notes or "—"
            apt_rows.append([
                Paragraph(time_str, table_cell_style),
                Paragraph(doc_name, table_cell_style),
                Paragraph(spec, table_cell_style),
                Paragraph(a.status.capitalize(), table_cell_style),
                Paragraph(notes, table_cell_style)
            ])
        apt_table = Table(apt_rows, colWidths=[1.2 * inch, 1.6 * inch, 1.8 * inch, 0.9 * inch, 1.5 * inch])
        apt_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), secondary_color),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 0.5, border_color),
            ('PADDING', (0, 0), (-1, -1), 4),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAF8F6")]),
        ]))
        elements.append(apt_table)

    elements.append(Spacer(1, 14))
    elements.append(HRFlowable(width="100%", thickness=1, color=border_color, spaceBefore=4, spaceAfter=8))
    elements.append(Paragraph(
        "HerHealth 360 | Personal Health Passport | Designed for educational demonstration purposes only. "
        "Trusted sources: WHO, NHS, CDC, India MoHFW. Emergency Helpline in India: 112.",
        disclaimer_style
    ))

    doc.build(elements)
    return pdf_path
