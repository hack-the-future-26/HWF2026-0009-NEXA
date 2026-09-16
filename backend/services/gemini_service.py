import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def analyze_company(company, news_text, legal_info):

    if legal_info is None:
        legal_info = {
            "legal_name": "Not Found",
            "lei": "N/A",
            "status": "Unknown",
            "jurisdiction": "Unknown",
            "legal_address": "Unknown",
        }

    prompt = f"""
Analyze the company '{company}'.

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

Based on BOTH the legal verification and the recent news, respond ONLY in this format:

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
            recommendation = line.replace("Recommendation:", "").strip()

    return {
        "trust_score": trust_score,
        "risk": risk,
        "recommendation": recommendation,
    }