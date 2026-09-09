from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
import os
import requests

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
    news_url = (
    "https://newsapi.org/v2/everything?"
    f'qInTitle="{company}"&'
    "language=en&"
    "sortBy=relevancy&"
    "pageSize=3&"
    f"apiKey={NEWS_API_KEY}"
    )

    news_response = requests.get(news_url)
    news_data = news_response.json()

     
    headlines = []

    if news_data.get("status") == "ok":
      for article in news_data.get("articles", [])[:3]:
        headlines.append(article["title"])

    news_text = "\n".join(headlines)

    print(news_text)

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
            trust_score = line.replace("Trust Score:", "").strip()
        elif line.startswith("Risk:"):
            risk = line.replace("Risk:", "").strip()
        elif line.startswith("Recommendation:"):
            recommendation = line.replace("Recommendation:", "").strip()

    return {
        "company": company,
        "trust_score": trust_score,
        "risk": risk,
        "recommendation": recommendation,
    }