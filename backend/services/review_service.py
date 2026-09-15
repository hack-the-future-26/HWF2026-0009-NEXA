from database import get_connection


def normalize_organization(name):
    return name.strip().lower()


def add_review(
    organization,
    experience_type,
    rating,
    review_text,
    display_name=None
):
    conn = get_connection()

    conn.execute(
        """
        INSERT INTO reviews (
            organization,
            experience_type,
            rating,
            review_text,
            display_name
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            organization.strip(),
            experience_type.strip(),
            rating,
            review_text.strip(),
            display_name.strip() if display_name else None
        )
    )

    conn.commit()

    review_id = conn.execute(
        "SELECT last_insert_rowid()"
    ).fetchone()[0]

    conn.close()

    return {
        "id": review_id,
        "message": "Review submitted successfully."
    }


def get_reviews(organization):
    conn = get_connection()

    rows = conn.execute(
        """
        SELECT
            id,
            organization,
            experience_type,
            rating,
            review_text,
            display_name,
            created_at
        FROM reviews
        WHERE LOWER(organization) = ?
        ORDER BY id DESC
        """,
        (normalize_organization(organization),)
    ).fetchall()

    conn.close()

    return [dict(row) for row in rows]


def get_review_summary(organization):
    conn = get_connection()

    row = conn.execute(
        """
        SELECT
            COUNT(*) AS review_count,
            AVG(rating) AS average_rating
        FROM reviews
        WHERE LOWER(organization) = ?
        """,
        (normalize_organization(organization),)
    ).fetchone()

    conn.close()

    return {
        "review_count": row["review_count"],
        "average_rating": (
            round(row["average_rating"], 1)
            if row["average_rating"] is not None
            else None
        )
    }