def calculate_trust_score(legal_info, news, review_summary):
    """
    Calculate TrustBridge AI's deterministic trust score.

    Maximum:
    - Legal verification: 30
    - News signals: 30
    - Community reviews: 25
    - Evidence confidence: 15

    Missing information is treated as limited evidence,
    not automatically as evidence of fraud.
    """

    # --------------------------------------------------
    # 1. LEGAL / BUSINESS VERIFICATION - 30 POINTS
    # --------------------------------------------------

    legal_score = 0

    if legal_info:
        lei = str(legal_info.get("lei") or "").strip()
        status = str(legal_info.get("status") or "").lower().strip()
        legal_name = str(
            legal_info.get("legal_name") or ""
        ).strip()

        if lei and lei.upper() != "N/A":
            legal_score += 20

        if "active" in status:
            legal_score += 10
        elif status and status not in ["unknown", "n/a", "not available"]:
            legal_score += 5

        # If a legal name is available but there is no LEI,
        # give limited credit for available legal evidence.
        if legal_name and legal_score == 0:
            legal_score = 10

    legal_score = min(30, legal_score)

    # --------------------------------------------------
    # 2. NEWS SIGNALS - 30 POINTS
    # --------------------------------------------------

    news_count = len(news or [])

    # News quantity is treated as evidence availability,
    # not as proof that the organization is trustworthy.
    #
    # No news = neutral score, not zero.
    if news_count == 0:
        news_score = 15
    elif news_count <= 2:
        news_score = 20
    elif news_count <= 5:
        news_score = 25
    else:
        news_score = 30

    # --------------------------------------------------
    # 3. COMMUNITY REVIEWS - 25 POINTS
    # --------------------------------------------------

    review_count = review_summary.get("review_count", 0)
    average_rating = review_summary.get("average_rating")

    if review_count == 0 or average_rating is None:
        # No reviews should not automatically hurt the score.
        # Give a neutral evidence value.
        community_score = 12
    else:
        # Convert 1-5 rating to a score out of 25.
        community_score = round(
            (float(average_rating) / 5) * 25
        )

        community_score = min(25, max(0, community_score))

    # --------------------------------------------------
    # 4. EVIDENCE CONFIDENCE - 15 POINTS
    # --------------------------------------------------

    confidence_score = 0

    if legal_info:
        confidence_score += 5

    if news_count > 0:
        confidence_score += 5

    if review_count > 0:
        confidence_score += 5

    # If there are no reviews, confidence is still allowed
    # to come from the other available sources.
    confidence_score = min(15, confidence_score)

    # --------------------------------------------------
    # FINAL SCORE
    # --------------------------------------------------

    total_score = (
        legal_score
        + news_score
        + community_score
        + confidence_score
    )

    total_score = min(100, max(0, total_score))

    return {
        "total": total_score,
        "legal": legal_score,
        "news": news_score,
        "community": community_score,
        "confidence": confidence_score,
    }