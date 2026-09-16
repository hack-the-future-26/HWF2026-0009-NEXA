import io
import re

from pypdf import PdfReader
from docx import Document


# --------------------------------------------------
# PDF TEXT EXTRACTION
# --------------------------------------------------

def extract_text_from_pdf(file_bytes):
    """
    Extract selectable text from a PDF.
    """

    text_parts = []

    reader = PdfReader(io.BytesIO(file_bytes))

    for page in reader.pages:
        page_text = page.extract_text()

        if page_text:
            text_parts.append(page_text)

    return "\n".join(text_parts)


# --------------------------------------------------
# DOCX TEXT EXTRACTION
# --------------------------------------------------

def extract_text_from_docx(file_bytes):
    """
    Extract text from a DOCX document.
    """

    document = Document(io.BytesIO(file_bytes))

    text_parts = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text_parts.append(paragraph.text)

    # Also extract text from tables
    for table in document.tables:
        for row in table.rows:
            row_text = []

            for cell in row.cells:
                if cell.text.strip():
                    row_text.append(cell.text.strip())

            if row_text:
                text_parts.append(" | ".join(row_text))

    return "\n".join(text_parts)


# --------------------------------------------------
# IMAGE HANDLING
# --------------------------------------------------

def extract_text_from_image(file_bytes):
    """
    Image OCR is intentionally disabled.

    Tesseract is not required for this version.
    """

    raise ValueError(
        "Image OCR is not available in this version. "
        "Please upload a text-based PDF or DOCX document."
    )


# --------------------------------------------------
# MAIN TEXT EXTRACTION
# --------------------------------------------------

def extract_document_text(filename, file_bytes):
    """
    Decide how to extract text based on file type.
    """

    filename = filename.lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)

    if filename.endswith(".docx"):
        return extract_text_from_docx(file_bytes)

    if filename.endswith(
        (".png", ".jpg", ".jpeg", ".webp")
    ):
        return extract_text_from_image(file_bytes)

    raise ValueError(
        "Unsupported file type. Please upload a PDF, DOCX or image."
    )


# --------------------------------------------------
# REGEX FIELD HELPER
# --------------------------------------------------

def find_value(text, patterns):
    """
    Try multiple regular-expression patterns
    and return the first matching value.
    """

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            re.IGNORECASE
        )

        if match:
            return match.group(1).strip()

    return "Not found"


# --------------------------------------------------
# FIELD EXTRACTION
# --------------------------------------------------

def extract_document_fields(text):
    """
    Extract commonly useful fields from an opportunity,
    recruitment or education document.
    """

    organization = find_value(
        text,
        [
            r"(?:company|organization|employer|agency)\s*[:\-]\s*([^\n]+)",
            r"(?:company|organization|employer|agency)\s+name\s*[:\-]\s*([^\n]+)",
        ],
    )

    job_or_course = find_value(
        text,
        [
            r"(?:job\s*title|position|designation|role)\s*[:\-]\s*([^\n]+)",
            r"(?:course|program|programme)\s*[:\-]\s*([^\n]+)",
        ],
    )

    country = find_value(
        text,
        [
            r"(?:country|location|work\s*location)\s*[:\-]\s*([^\n]+)",
        ],
    )

    salary_or_fees = find_value(
        text,
        [
            r"(?:salary|wage|pay|stipend)\s*[:\-]?\s*([^\n]+)",
            r"(?:tuition|fee|fees|payment)\s*[:\-]?\s*([^\n]+)",
        ],
    )

    contact = find_value(
        text,
        [
            r"(?:email|e-mail)\s*[:\-]?\s*([^\s\n]+@[^\s\n]+)",
            r"(\+?\d[\d\s\-]{8,}\d)",
        ],
    )

    visa_information = find_value(
        text,
        [
            r"(?:visa)\s*[:\-]?\s*([^\n]+)",
            r"(?:work\s*visa|student\s*visa)\s*[:\-]?\s*([^\n]+)",
        ],
    )

    payment_requirement = find_value(
        text,
        [
            r"(?:advance\s*payment|processing\s*fee|registration\s*fee)\s*[:\-]?\s*([^\n]+)",
            r"(?:payment\s*required|payment)\s*[:\-]?\s*([^\n]+)",
        ],
    )

    return {
        "organization": organization,
        "job_or_course": job_or_course,
        "country": country,
        "salary_or_fees": salary_or_fees,
        "contact": contact,
        "visa_information": visa_information,
        "payment_requirement": payment_requirement,
    }


# --------------------------------------------------
# RISK INDICATORS
# --------------------------------------------------

def detect_risk_indicators(text):
    """
    Detect wording that may deserve additional verification.

    These are indicators only.
    They do not prove fraud or document forgery.
    """

    text_lower = text.lower()

    indicators = []

    risk_patterns = [
        (
            [
                "pay immediately",
                "payment immediately",
                "urgent payment",
                "pay now",
            ],
            "The document contains urgent payment language. Verify the organization before making any payment.",
        ),
        (
            [
                "guaranteed job",
                "100% job guarantee",
                "guaranteed employment",
            ],
            "The document contains job-guarantee language. Verify the offer independently.",
        ),
        (
            [
                "guaranteed visa",
                "visa guaranteed",
            ],
            "The document contains visa-guarantee language. Verify the opportunity through official visa processes.",
        ),
        (
            [
                "no interview",
                "without interview",
                "interview not required",
            ],
            "The document states that an interview may not be required. Verify the recruitment process independently.",
        ),
        (
            [
                "cash payment",
                "pay in cash",
            ],
            "The document mentions cash payment. Verify why payment is required and request official documentation.",
        ),
        (
            [
                "personal account",
                "personal bank account",
                "send to my account",
            ],
            "The document appears to request payment to a personal account. Verify the recipient carefully.",
        ),
    ]

    for phrases, message in risk_patterns:
        if any(phrase in text_lower for phrase in phrases):
            indicators.append(message)

    if not indicators:
        indicators.append(
            "No obvious predefined risk indicators were detected in the extracted text. This does not confirm document authenticity."
        )

    return indicators


# --------------------------------------------------
# DOCUMENT TYPE
# --------------------------------------------------

def determine_document_type(text):
    """
    Identify the general type of document
    from its text.
    """

    text_lower = text.lower()

    if any(
        word in text_lower
        for word in [
            "offer letter",
            "employment offer",
            "job offer",
        ]
    ):
        return "Employment / Offer Letter"

    if any(
        word in text_lower
        for word in [
            "employment contract",
            "employment agreement",
            "contract of employment",
        ]
    ):
        return "Employment Contract"

    if any(
        word in text_lower
        for word in [
            "admission letter",
            "university",
            "college",
            "course",
            "programme",
            "program",
        ]
    ):
        return "Education / Admission Document"

    if any(
        word in text_lower
        for word in [
            "recruitment",
            "recruitment agency",
            "placement",
        ]
    ):
        return "Recruitment Document"

    return "Document"


# --------------------------------------------------
# COMPLETE DOCUMENT ANALYSIS
# --------------------------------------------------

def analyze_document(filename, file_bytes):
    """
    Complete document-scanning pipeline.
    """

    text = extract_document_text(
        filename,
        file_bytes
    )

    if not text.strip():
        raise ValueError(
            "No readable text was found in this document. "
            "If this is a scanned PDF or image, please use a text-based PDF or DOCX for now."
        )

    fields = extract_document_fields(text)

    risk_indicators = detect_risk_indicators(text)

    document_type = determine_document_type(text)

    return {
        "document_type": document_type,
        **fields,
        "risk_indicators": risk_indicators,
    }