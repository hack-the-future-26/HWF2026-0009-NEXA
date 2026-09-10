from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
import os

from services.news_service import get_company_news
from services.gemini_service import analyze_company

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

NEWS_API_KEY = os.getenv("NEWS_API_KEY")

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
    
    headlines = get_company_news(company)

    news_text = "\n".join(headlines)

    print("Latest News:")
    for headline in headlines:
        print("-", headline)

    result = analyze_company(company, news_text)

    return {
    "company": company,
    **result
    }