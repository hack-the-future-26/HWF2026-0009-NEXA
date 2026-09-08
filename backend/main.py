from fastapi import FastAPI
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
def search():
    return {
        "company": "ABC Overseas Dubai",
        "trust_score": 89,
        "risk": "Low",
        "recommendation": "Looks genuine. Verify the contract before payment."
    }