import os
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv


load_dotenv()


DATABASE_URL = os.getenv("DATABASE_URL")


def get_connection():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL is not set in the .env file.")

    return psycopg2.connect(DATABASE_URL)


def init_db():
    conn = get_connection()

    with conn.cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                organization TEXT NOT NULL,
                experience_type TEXT NOT NULL,
                rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
                review_text TEXT NOT NULL,
                display_name TEXT,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_reviews_organization
            ON reviews(organization)
        """)

    conn.commit()
    conn.close()