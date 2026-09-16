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

    with conn.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO reviews (
                organization,
                experience_type,
                rating,
                review_text,
                display_name
            )
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
            """,
            (
                organization.strip(),
                experience_type.strip(),
                rating,
                review_text.strip(),
                display_name.strip() if display_name else None
            )
        )

        review_id = cursor.fetchone()[0]

    conn.commit()
    conn.close()

    return {
        "id": review_id,
        "message": "Review submitted successfully."
    }


def get_reviews(organization):
    conn = get_connection()

    with conn.cursor() as cursor:
        cursor.execute(
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
            WHERE LOWER(organization) = %s
            ORDER BY id DESC
            """,
            (normalize_organization(organization),)
        )

        rows = cursor.fetchall()

    conn.close()

    columns = [
        "id",
        "organization",
        "experience_type",
        "rating",
        "review_text",
        "display_name",
        "created_at"
    ]

    return [
        dict(zip(columns, row))
        for row in rows
    ]


def get_review_summary(organization):
    conn = get_connection()

    with conn.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                COUNT(*) AS review_count,
                AVG(rating) AS average_rating
            FROM reviews
            WHERE LOWER(organization) = %s
            """,
            (normalize_organization(organization),)
        )

        row = cursor.fetchone()

    conn.close()

    return {
        "review_count": row[0],
        "average_rating": (
            round(float(row[1]), 1)
            if row[1] is not None
            else None
        )
    }