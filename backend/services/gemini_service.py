import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def analyze_company(company, news_text):

    prompt = f"""
    Analyze the company '{company}'.

    Recent News:
    {news_text}

    Based on the recent news, provide ONLY:

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

    print("Gemini Response:")
    print(text)

    trust_score = "N/A"
    risk = "Unknown"
    recommendation = text

    for line in text.split("\n"):
        if line.startswith("Trust Score:"):
            trust_score = line.replace("Trust Score:", "").replace("/100", "").strip()

        elif line.startswith("Risk:"):
            risk = line.replace("Risk:", "").strip()

        elif line.startswith("Recommendation:"):
            recommendation = line.replace("Recommendation:", "").strip()

    return {
        "trust_score": trust_score,
        "risk": risk,
        "recommendation": recommendation,
    }