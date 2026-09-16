from fastapi import FastAPI, Query, UploadFile, File, HTTPException
from fastapi.responses import Response
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import traceback


from services.news_service import get_company_news
from services.gemini_service import analyze_company
from services.gleif_service import get_company_legal_info
from services.trust_score_service import calculate_trust_score
from services.document_scanner_service import analyze_document
from services.pdf_report_service import generate_verification_report
from database import init_db
from services.review_service import (
    add_review,
    get_reviews,
    get_review_summary
)

load_dotenv()

app = FastAPI()

init_db()

class ReviewCreate(BaseModel):
    organization: str = Field(min_length=2, max_length=200)
    experience_type: str = Field(min_length=2, max_length=50)
    rating: int = Field(ge=1, le=5)
    review_text: str = Field(min_length=10, max_length=2000)
    display_name: str | None = Field(default=None, max_length=80)

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
def search(
    company: str = Query(...),
    category: str = Query("Employment")
):
    print(f"\nSearching: {company}")
    print(f"Category: {category}")
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
            legal_info,
            category
        )

        
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
    # STEP 4 - Community Reviews
    # -------------------------
    try:
        review_summary = get_review_summary(company)
    except Exception as e:
        print("\n========== REVIEW ERROR ==========")
        traceback.print_exc()

        review_summary = {
            "review_count": 0,
            "average_rating": None  
        }   

    print("\n========== COMMUNITY REVIEWS ==========")
    print(review_summary)

    # -------------------------
    # STEP 5 - Trust Score
    # -------------------------
    score_breakdown = calculate_trust_score(
        legal_info=legal_info,
        news=headlines,
        review_summary=review_summary
    )

    trust_score = score_breakdown["total"]

    print("\n========== TRUST SCORE ==========")
    print(score_breakdown)


    # -------------------------
    # STEP 6 - Response
    # -------------------------
    return {
        "company": company,
        "trust_score": trust_score,
        "risk": risk,
        "recommendation": recommendation,
        "legal_info": legal_info,
        "news": headlines,
        "community": {
            "review_count": review_summary["review_count"],
            "average_rating": review_summary["average_rating"]
        },
        "score_breakdown": score_breakdown

    }
    
@app.post("/reviews")
def create_review(review: ReviewCreate):

    result = add_review(
        organization=review.organization,
        experience_type=review.experience_type,
        rating=review.rating,
        review_text=review.review_text,
        display_name=review.display_name
    )

    return result


@app.get("/reviews")
def fetch_reviews(
    organization: str = Query(..., min_length=1)
):

    reviews = get_reviews(organization)
    summary = get_review_summary(organization)

    return {
        "organization": organization,
        "review_count": summary["review_count"],
        "average_rating": summary["average_rating"],
        "reviews": reviews
    }


# --------------------------------------------------
# Document Scanner
# --------------------------------------------------

@app.post("/scan-document")
async def scan_document(
    file: UploadFile = File(...)
):
    try:
        allowed_types = {
            "application/pdf",
            "image/png",
            "image/jpeg",
            "image/webp",
        }

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail="Unsupported file type. Please upload a PDF or image."
            )

        file_bytes = await file.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty."
            )

        result = analyze_document(
            file.filename,
            file_bytes
        )

        return result

    except HTTPException:
        raise

    except ValueError as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    except Exception:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Unable to analyze this document right now."
        )
    

# --------------------------------------------------
# PDF Verification Report
# --------------------------------------------------

@app.post("/generate-report")
def generate_report(data: dict):
    try:
        pdf_bytes = generate_verification_report(data)

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    'attachment; filename="TrustBridge_Verification_Report.pdf"'
                )
            },
        )

    except Exception:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Unable to generate the verification report."
        )

