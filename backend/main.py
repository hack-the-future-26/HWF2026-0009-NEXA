from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

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
    company_lower = company.lower()

    if "microsoft" in company_lower:
        score = 96
        risk = "Low"
        recommendation = "Well-established company with a strong reputation."

    elif "google" in company_lower:
        score = 97
        risk = "Low"
        recommendation = "Global technology company with high credibility."

    elif "unknown" in company_lower:
        score = 35
        risk = "High"
        recommendation = "Very limited public information found. Proceed with caution."

    else:
        score = 75
        risk = "Medium"
        recommendation = "Basic information found. Verify contracts and reviews before proceeding."

    return {
        "company": company,
        "trust_score": score,
        "risk": risk,
        "recommendation": recommendation
    }