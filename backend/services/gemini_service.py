import os

from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def analyze_company(
    company,
    news_text,
    legal_info,
    category="Employment"
):

    if legal_info is None:
        legal_info = {
            "legal_name": "Not Found",
            "lei": "N/A",
            "status": "Unknown",
            "jurisdiction": "Unknown",
            "legal_address": "Unknown",
        }

    if category == "Education":

        verification_focus = """
Focus on education-related signals such as:

- Whether the organization appears to be an educational institution
- Available institutional/legal information
- Education-related news or reputation signals
- Any obvious warning signs relevant to students
"""

    elif category == "Overseas Opportunity":

        verification_focus = """
Focus on overseas opportunity-related signals such as:

- Recruitment or employment-related information
- Overseas job or opportunity claims
- Payment or recruitment warning signals
- News related to scams, disputes, complaints, or misleading opportunities
"""

    else:

        verification_focus = """
Focus on employment and organization-related signals such as:

- Organization/legal information
- Employment-related reputation
- News related to disputes, complaints, scams, or misleading claims
"""

    prompt = f"""
Analyze the organization '{company}' for the following purpose:

Category: {category}

Verification Focus
------------------
{verification_focus}

Legal Information
-----------------
Legal Name: {legal_info.get("legal_name")}
LEI: {legal_info.get("lei")}
Status: {legal_info.get("status")}
Jurisdiction: {legal_info.get("jurisdiction")}
Address: {legal_info.get("legal_address")}

Recent News
-----------
{news_text}

Based on the available legal information and recent news, provide a
risk assessment relevant to the selected category.

Important:

- Do not claim that an organization is definitely legitimate or fraudulent.
- Treat missing information as unavailable evidence, not proof of fraud.
- Base the assessment only on the available evidence.
- Keep the recommendation practical and concise.

Respond ONLY in this format:

Trust Score: <number out of 100>
Risk: <Low/Medium/High>
Recommendation: <one short recommendation>

Keep the response concise.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    text = response.text

    print("\nGemini Response:")
    print(text)

    trust_score = "N/A"
    risk = "Unknown"
    recommendation = "No recommendation available."

    for line in text.split("\n"):

        line = line.strip()

        if line.startswith("Trust Score:"):

            trust_score = (
                line.replace("Trust Score:", "")
                .replace("/100", "")
                .strip()
            )

        elif line.startswith("Risk:"):

            risk = line.replace("Risk:", "").strip()

        elif line.startswith("Recommendation:"):

            recommendation = line.replace(
                "Recommendation:",
                ""
            ).strip()

    return {
        "trust_score": trust_score,
        "risk": risk,
        "recommendation": recommendation,
    }