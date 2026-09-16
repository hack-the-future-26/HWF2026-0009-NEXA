from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    KeepTogether,
)


def generate_verification_report(data):
    """
    Generate a TrustBridge AI verification report as a PDF.
    """

    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=18 * mm,
        leftMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="TrustBridge AI Verification Report",
        author="TrustBridge AI",
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Title"],
        fontSize=22,
        leading=27,
        alignment=TA_CENTER,
        spaceAfter=8,
    )

    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=18,
    )

    section_style = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading2"],
        fontSize=14,
        leading=18,
        spaceBefore=14,
        spaceAfter=8,
        textColor=colors.HexColor("#1e293b"),
    )

    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["BodyText"],
        fontSize=9.5,
        leading=14,
        spaceAfter=6,
    )

    small_style = ParagraphStyle(
        "Small",
        parent=styles["BodyText"],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748b"),
    )

    score_style = ParagraphStyle(
        "Score",
        parent=styles["Heading1"],
        fontSize=30,
        leading=34,
        alignment=TA_CENTER,
    )

    story = []

    # --------------------------------------------------
    # DATA
    # --------------------------------------------------

    company = data.get("company", "Unknown organization")
    category = data.get("category", "Employment")

    trust_score = data.get("trust_score", "N/A")
    risk = data.get("risk", "Unknown")
    recommendation = data.get(
        "recommendation",
        "No recommendation available."
    )

    legal_info = data.get("legal_info") or {}
    news = data.get("news") or []
    community = data.get("community") or {}
    score_breakdown = data.get("score_breakdown") or {}

    # --------------------------------------------------
    # HEADER
    # --------------------------------------------------

    story.append(
        Paragraph(
            "TrustBridge AI",
            title_style
        )
    )

    story.append(
        Paragraph(
            "Verification & Risk Assessment Report",
            subtitle_style
        )
    )

    story.append(
        Paragraph(
            "Verify Before You Trust",
            subtitle_style
        )
    )

    # --------------------------------------------------
    # ORGANIZATION SUMMARY
    # --------------------------------------------------

    story.append(
        Paragraph(
            "Organization Summary",
            section_style
        )
    )

    summary_data = [
        [
            Paragraph("<b>Organization</b>", body_style),
            Paragraph(str(company), body_style),
        ],
        [
            Paragraph("<b>Verification Category</b>", body_style),
            Paragraph(str(category), body_style),
        ],
        [
            Paragraph("<b>Trust Score</b>", body_style),
            Paragraph(
                f"<b>{trust_score}</b> / 100",
                body_style
            ),
        ],
        [
            Paragraph("<b>Risk Level</b>", body_style),
            Paragraph(str(risk), body_style),
        ],
    ]

    summary_table = Table(
        summary_data,
        colWidths=[55 * mm, 112 * mm],
    )

    summary_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#f1f5f9"),
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#dbe3ea"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
            ]
        )
    )

    story.append(summary_table)

    # --------------------------------------------------
    # SCORE BREAKDOWN
    # --------------------------------------------------

    story.append(
        Paragraph(
            "Trust Score Breakdown",
            section_style
        )
    )

    score_data = [
        ["Evidence Area", "Score"],
        [
            "Legal / Business Verification",
            f"{score_breakdown.get('legal', 0)} / 30",
        ],
        [
            "News Signals",
            f"{score_breakdown.get('news', 0)} / 30",
        ],
        [
            "Community Reviews",
            f"{score_breakdown.get('community', 0)} / 25",
        ],
        [
            "Evidence Confidence",
            f"{score_breakdown.get('confidence', 0)} / 15",
        ],
        [
            "Total Trust Score",
            f"{score_breakdown.get('total', trust_score)} / 100",
        ],
    ]

    score_table = Table(
        score_data,
        colWidths=[125 * mm, 42 * mm],
    )

    score_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#1e293b"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#dbe3ea"),
                ),
                (
                    "ALIGN",
                    (1, 0),
                    (1, -1),
                    "CENTER",
                ),
                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold",
                ),
                (
                    "FONTNAME",
                    (0, -1),
                    (-1, -1),
                    "Helvetica-Bold",
                ),
                (
                    "BACKGROUND",
                    (0, -1),
                    (-1, -1),
                    colors.HexColor("#f8fafc"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
            ]
        )
    )

    story.append(score_table)

    # --------------------------------------------------
    # LEGAL INFORMATION
    # --------------------------------------------------

    story.append(
        Paragraph(
            "Legal / Organization Information",
            section_style
        )
    )

    legal_data = [
        [
            "Legal Name",
            str(
                legal_info.get(
                    "legal_name",
                    "Not Available"
                )
            ),
        ],
        [
            "LEI",
            str(
                legal_info.get(
                    "lei",
                    "N/A"
                )
            ),
        ],
        [
            "Status",
            str(
                legal_info.get(
                    "status",
                    "Unknown"
                )
            ),
        ],
        [
            "Jurisdiction",
            str(
                legal_info.get(
                    "jurisdiction",
                    "N/A"
                )
            ),
        ],
        [
            "Legal Address",
            str(
                legal_info.get(
                    "legal_address",
                    "Not Available"
                )
            ),
        ],
    ]

    legal_table = Table(
        legal_data,
        colWidths=[55 * mm, 112 * mm],
    )

    legal_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#f1f5f9"),
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#dbe3ea"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
            ]
        )
    )

    story.append(legal_table)

    # --------------------------------------------------
    # NEWS
    # --------------------------------------------------

    story.append(
        Paragraph(
            "Recent News Evidence",
            section_style
        )
    )

    if news:
        for index, item in enumerate(news, start=1):
            story.append(
                Paragraph(
                    f"<b>{index}.</b> {str(item)}",
                    body_style
                )
            )
    else:
        story.append(
            Paragraph(
                "No recent news was found for this organization.",
                body_style
            )
        )

    # --------------------------------------------------
    # COMMUNITY REVIEWS
    # --------------------------------------------------

    story.append(
        Paragraph(
            "Community Review Evidence",
            section_style
        )
    )

    review_count = community.get(
        "review_count",
        0
    )

    average_rating = community.get(
        "average_rating"
    )

    if average_rating is not None:
        rating_text = f"{average_rating} / 5"
    else:
        rating_text = "No rating available"

    community_data = [
        ["Review Count", str(review_count)],
        ["Average Rating", rating_text],
    ]

    community_table = Table(
        community_data,
        colWidths=[55 * mm, 112 * mm],
    )

    community_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    colors.HexColor("#f1f5f9"),
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.HexColor("#dbe3ea"),
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    8,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    7,
                ),
            ]
        )
    )

    story.append(community_table)

    # --------------------------------------------------
    # AI ASSESSMENT
    # --------------------------------------------------

    story.append(
        Paragraph(
            "AI Risk Assessment",
            section_style
        )
    )

    story.append(
        Paragraph(
            str(recommendation),
            body_style
        )
    )

    # --------------------------------------------------
    # DISCLAIMER
    # --------------------------------------------------

    story.append(
        Spacer(1, 10)
    )

    disclaimer = (
        "<b>Important:</b> TrustBridge AI does not declare an "
        "organization legitimate or fraudulent. This report presents "
        "a risk assessment based on available evidence and is intended "
        "to help users make informed decisions. Missing information "
        "does not by itself prove that an organization is fraudulent."
    )

    story.append(
        Table(
            [
                [
                    Paragraph(
                        disclaimer,
                        small_style
                    )
                ]
            ],
            colWidths=[167 * mm],
            style=TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, -1),
                        colors.HexColor("#f1f5f9"),
                    ),
                    (
                        "BOX",
                        (0, 0),
                        (-1, -1),
                        0.5,
                        colors.HexColor("#cbd5e1"),
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        10,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        10,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        9,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        9,
                    ),
                ]
            ),
        )
    )

    story.append(
        Spacer(1, 12)
    )

    story.append(
        Paragraph(
            "Generated by TrustBridge AI ",
            small_style
        )
    )

    # --------------------------------------------------
    # BUILD PDF
    # --------------------------------------------------

    document.build(story)

    buffer.seek(0)

    return buffer.getvalue()