import sqlite3
from pathlib import Path


# Database file will be created inside the backend folder
DB_PATH = Path(__file__).resolve().parent / "trustbridge.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()

    conn.execute("""
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            organization TEXT NOT NULL,
            experience_type TEXT NOT NULL,
            rating INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
            review_text TEXT NOT NULL,
            display_name TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.execute("""
        CREATE INDEX IF NOT EXISTS idx_reviews_organization
        ON reviews(organization)
    """)

    conn.commit()
    conn.close()