from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import traceback

from services.news_service import get_company_news
from services.gemini_service import analyze_company
from services.gleif_service import get_company_legal_info

load_dotenv()

app = FastAPI()

# --------------------------------------------------
# CORS
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Home
# --------------------------------------------------
@app.get("/")
def home():
    return {
        "message": "Welcome to TrustBridge AI Backend 🚀"
    }


# --------------------------------------------------
# Search Company
# --------------------------------------------------
@app.get("/search")
def search(company: str = Query(...)):

    print(f"\nSearching: {company}")

    # -------------------------
    # STEP 1 - News
    # -------------------------
    try:
        headlines = get_company_news(company)
    except Exception:
        headlines = []

    news_text = "\n".join(headlines)

    print("\n========== NEWS ==========")
    if headlines:
        for h in headlines:
            print("-", h)
    else:
        print("No news found.")

    # -------------------------
    # STEP 2 - Legal
    # -------------------------
    try:
        legal_info = get_company_legal_info(company)

    except Exception as e:
        print("\n========== GLEIF ERROR ==========")
        traceback.print_exc()

        legal_info = {
            "legal_name": "Not Available",
            "status": "Unknown",
            "lei": "N/A",
            "jurisdiction": "N/A",
            "legal_address": "N/A"
        }

    print("\n========== LEGAL ==========")
    print(legal_info)

    # -------------------------
    # STEP 3 - Gemini Analysis
    # -------------------------
    try:

        result = analyze_company(
            company,
            news_text,
            legal_info
        )

        trust_score = result["trust_score"]
        risk = result["risk"]
        recommendation = result["recommendation"]

        print("\n========== AI RESULT ==========")
        print(result)

    except Exception as e:

        print("\n========== GEMINI ERROR ==========")
        traceback.print_exc()

        # Fallback values
        trust_score = "N/A"
        risk = "Unknown"

        if "429" in str(e):
            recommendation = (
                "Gemini API quota has been exceeded. "
                "Please wait a minute or use another API key."
            )
        else:
            recommendation = (
                "AI analysis is currently unavailable."
            )

    # -------------------------
    # STEP 4 - Response
    # -------------------------
    return {
        "company": company,
        "trust_score": trust_score,
        "risk": risk,
        "recommendation": recommendation,
        "legal_info": legal_info,
        "news": headlines
    }