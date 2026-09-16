from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from services.news_service import get_company_news
from services.gemini_service import analyze_company
from services.gleif_service import get_company_legal_info

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Welcome to TrustBridge AI Backend 🚀"}


@app.get("/search")
def search(company: str = Query(...)):

    # Step 1: Get latest news
    headlines = get_company_news(company)
    news_text = "\n".join(headlines)

    print("\n========== LATEST NEWS ==========")
    for headline in headlines:
        print("-", headline)

    # Step 2: Get legal information from GLEIF
    legal_info = get_company_legal_info(company)

    print("\n========== LEGAL INFORMATION ==========")
    print(legal_info)

    # Step 3: Analyze using Gemini
    result = analyze_company(
        company,
        news_text,
        legal_info
    )

    # Step 4: Return response to frontend
    return {
        "company": company,
        "trust_score": result["trust_score"],
        "risk": result["risk"],
        "recommendation": result["recommendation"],
    }