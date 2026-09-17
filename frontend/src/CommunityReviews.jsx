import { useEffect, useState } from "react";

function CommunityReviews({ initialOrganization = "" }) {
  const [organization, setOrganization] = useState(initialOrganization);
  const [experienceType, setExperienceType] = useState("Worked");
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadReviews = async (name) => {
    if (!name.trim()) {
      setData(null);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `https://trustbridge-backend-x3m5.onrender.com/reviews?organization=${encodeURIComponent(
          name.trim()
        )}`
      );

      if (!response.ok) {
        throw new Error("Unable to load reviews.");
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError("Unable to load community reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrganization) {
      setOrganization(initialOrganization);
      loadReviews(initialOrganization);
    }
  }, [initialOrganization]);

  const submitReview = async (event) => {
    event.preventDefault();

    if (!organization.trim()) {
      setError("Please enter the organization name.");
      return;
    }

    if (reviewText.trim().length < 10) {
      setError("Please write at least 10 characters about your experience.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("https://trustbridge-backend-x3m5.onrender.com/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization: organization.trim(),
          experience_type: experienceType,
          rating,
          review_text: reviewText.trim(),
          display_name: displayName.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to submit review.");
      }

      setMessage("Your experience was submitted successfully.");
      setReviewText("");
      setDisplayName("");

      await loadReviews(organization);
    } catch (err) {
      console.error(err);
      setError("We couldn't submit your review right now.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (value, interactive = false) => {
    return (
      <div className={interactive ? "community-rating-selector" : "community-stars"}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            onClick={
              interactive
                ? () => setRating(star)
                : undefined
            }
            className={interactive ? "rating-star-button" : "review-star"}
            aria-label={interactive ? `${star} star rating` : undefined}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  return (
    <section className="community-page">
      <div className="community-hero">
        <div className="hero-badge community-badge">
          <span>★</span>
          Community Experiences
        </div>

        <h1>
          Real experiences.
          <br />
          <span>Safer decisions.</span>
        </h1>

        <p>
          Share what you experienced with a company, university,
          institute or organization and help others make informed
          decisions.
        </p>
      </div>

      <div className="community-layout">
        {/* LEFT: SHARE EXPERIENCE */}
        <div className="community-form-card">
          <div className="community-card-heading">
            <div className="community-heading-icon">★</div>

            <div>
              <span>SHARE YOUR EXPERIENCE</span>
              <h2>Help others make safer decisions</h2>
            </div>
          </div>

          <p className="community-form-intro">
            Your experience can help someone identify warning signs
            before making an important decision.
          </p>

          <form onSubmit={submitReview}>
            <div className="community-field">
              <label>Organization</label>

              <input
                value={organization}
                onChange={(e) => {
                  setOrganization(e.target.value);
                  setMessage("");
                  setError("");
                }}
                onBlur={() => loadReviews(organization)}
                placeholder="Example: ABC Overseas Recruitment"
              />

              <span className="field-hint">
                Enter the company, university, institute or agency name.
              </span>
            </div>

            <div className="community-field">
              <label>What was your experience?</label>

              <div className="experience-options">
                {["Worked", "Studied", "Other"].map((type) => (
                  <button
                    type="button"
                    key={type}
                    className={`experience-option ${
                      experienceType === type ? "selected" : ""
                    }`}
                    onClick={() => setExperienceType(type)}
                  >
                    <span>
                      {type === "Worked"
                        ? "💼"
                        : type === "Studied"
                        ? "🎓"
                        : "👤"}
                    </span>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="community-field">
              <label>Overall rating</label>

              <div className="rating-area">
                {renderStars(rating, true)}

                <span className="rating-value">
                  {rating} / 5
                </span>
              </div>
            </div>

            <div className="community-field">
              <label>Your experience</label>

              <textarea
                value={reviewText}
                onChange={(e) => {
                  setReviewText(e.target.value);
                  setError("");
                }}
                placeholder="Tell others about your experience. What went well? Were there any concerns or warning signs?"
                rows="6"
              />

              <span className="field-hint">
                Please provide honest and useful details. Minimum 10 characters.
              </span>
            </div>

            <div className="community-field">
              <label>
                Display name{" "}
                <span className="optional-label">(optional)</span>
              </label>

              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Example: Anonymous"
              />
            </div>

            {error && (
              <div className="community-alert error">
                <span>!</span>
                {error}
              </div>
            )}

            {message && (
              <div className="community-alert success">
                <span>✓</span>
                {message}
              </div>
            )}

            <button
              type="submit"
              className="review-button community-submit"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit Experience →"}
            </button>
          </form>
        </div>

        {/* RIGHT: COMMUNITY SIGNAL */}
        <div className="community-results">
          <div className="community-summary-card">
            <div className="community-card-heading">
              <div className="community-heading-icon">✦</div>

              <div>
                <span>COMMUNITY SIGNAL</span>
                <h2>What people experienced</h2>
              </div>
            </div>

            {data ? (
              <>
                <div className="community-summary-grid">
                  <div className="community-stat">
                    <span>COMMUNITY REVIEWS</span>
                    <strong>{data.review_count}</strong>
                    <small>
                      {data.review_count === 1
                        ? "experience shared"
                        : "experiences shared"}
                    </small>
                  </div>

                  <div className="community-stat rating-stat">
                    <span>AVERAGE RATING</span>

                    <strong>
                      {data.average_rating ?? "—"}
                    </strong>

                    {data.average_rating !== null && (
                      <div className="summary-stars">
                        {"★".repeat(
                          Math.round(data.average_rating)
                        )}
                        <span>
                          {"★".repeat(
                            5 - Math.round(data.average_rating)
                          )}
                        </span>
                      </div>
                    )}

                    <small>out of 5</small>
                  </div>
                </div>

                <div className="community-signal-note">
                  <span>ⓘ</span>
                  <p>
                    Community experiences are one part of TrustBridge
                    AI's evidence. They help users understand real-world
                    experiences but should be considered alongside other
                    verification sources.
                  </p>
                </div>
              </>
            ) : (
              <div className="community-empty-summary">
                <div>★</div>
                <h3>Search for an organization</h3>
                <p>
                  Enter an organization name above to see available
                  community experiences.
                </p>
              </div>
            )}
          </div>

          {/* RECENT REVIEWS */}
          <div className="community-reviews-card">
            <div className="community-card-heading">
              <div className="community-heading-icon">◉</div>

              <div>
                <span>EXPERIENCES</span>
                <h2>Recent community reviews</h2>
              </div>
            </div>

            {data?.reviews?.length ? (
              <div className="community-review-list">
                {data.reviews.map((review) => (
                  <article
                    key={review.id}
                    className="community-review-item"
                  >
                    <div className="review-top-row">
                      <div className="review-author">
                        <div className="review-avatar">
                          {(review.display_name || "A")
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {review.display_name || "Anonymous"}
                          </strong>

                          <span>
                            {review.experience_type}
                          </span>
                        </div>
                      </div>

                      <div className="review-rating">
                        <span>
                          {"★".repeat(review.rating)}
                        </span>
                        <small>{review.rating}/5</small>
                      </div>
                    </div>

                    <p className="review-text">
                      {review.review_text}
                    </p>

                    <div className="review-footer">
                      <span>Community experience</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="community-empty-reviews">
                <div className="empty-review-icon">★</div>

                <h3>
                  {loading
                    ? "Loading reviews..."
                    : "No reviews yet"}
                </h3>

                <p>
                  {loading
                    ? "Please wait while we load the community experiences."
                    : "Be the first to share an experience for this organization."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const communityStyles = `
.community-page {
  max-width: 1150px;
  margin: 0 auto;
  padding: 68px 24px 90px;
}

.community-hero {
  text-align: center;
  max-width: 780px;
  margin: 0 auto 48px;
}

.community-badge {
  display: inline-flex;
}

.community-hero h1 {
  margin: 22px 0 16px;
}

.community-hero p {
  max-width: 700px;
  margin: 0 auto;
  color: #64748b;
  font-size: 16px;
  line-height: 1.7;
}

.community-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}

.community-form-card,
.community-summary-card,
.community-reviews-card {
  background: #ffffff;
  border: 1px solid #e7e5e1;
  border-radius: 18px;
  padding: 28px;
  box-shadow: 0 8px 30px rgba(45, 35, 25, 0.05);
}

.community-card-heading {
  display: flex;
  align-items: center;
  gap: 13px;
  padding-bottom: 22px;
  border-bottom: 1px solid #edf1f5;
}

.community-heading-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1e7dc;
  color: #8b5e3c;
  font-size: 19px;
  flex-shrink: 0;
}

.community-card-heading span {
  display: block;
  color: #8b5e3c;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  margin-bottom: 4px;
}

.community-card-heading h2 {
  margin: 0;
  font-size: 20px;
  color: #263238;
}

.community-form-intro {
  color: #64748b;
  line-height: 1.65;
  margin: 20px 0 26px;
}

.community-field {
  margin-bottom: 22px;
}

.community-field label {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
}

.optional-label {
  color: #94a3b8;
  font-weight: 400;
}

.community-field input,
.community-field textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #dbe3ea;
  border-radius: 11px;
  padding: 13px 14px;
  background: #ffffff;
  color: #263238;
  font-size: 15px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.community-field input:focus,
.community-field textarea:focus {
  border-color: #a67c52;
  box-shadow: 0 0 0 3px rgba(166, 124, 82, 0.1);
}

.community-field textarea {
  resize: vertical;
  min-height: 145px;
  font-family: inherit;
  line-height: 1.6;
}

.field-hint {
  display: block;
  color: #94a3b8;
  font-size: 12px;
  margin-top: 6px;
  line-height: 1.5;
}

.experience-options {
  display: flex;
  gap: 9px;
  flex-wrap: wrap;
}

.experience-option {
  border: 1px solid #dbe3ea;
  background: #ffffff;
  border-radius: 10px;
  padding: 10px 14px;
  cursor: pointer;
  color: #475569;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.experience-option:hover {
  border-color: #c8aa8b;
}

.experience-option.selected {
  background: #f1e7dc;
  border-color: #c8aa8b;
  color: #6f472c;
}

.experience-option span {
  margin-right: 6px;
}

.rating-area {
  display: flex;
  align-items: center;
  gap: 13px;
}

.community-rating-selector {
  display: flex;
  gap: 2px;
}

.rating-star-button {
  border: none;
  background: transparent;
  color: #d9b99b;
  font-size: 30px;
  line-height: 1;
  padding: 2px;
  cursor: pointer;
  transition: transform 0.15s, color 0.15s;
}

.rating-star-button:hover {
  transform: scale(1.1);
}

.rating-star-button:nth-child(-n + 5) {
  color: #a67c52;
}

.rating-value {
  color: #64748b;
  font-size: 14px;
  font-weight: 700;
}

.community-alert {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 12px 14px;
  border-radius: 10px;
  margin-bottom: 14px;
  font-size: 14px;
  line-height: 1.5;
}

.community-alert span {
  font-weight: 800;
}

.community-alert.error {
  background: #fee2e2;
  color: #991b1b;
}

.community-alert.success {
  background: #dcfce7;
  color: #166534;
}

.community-submit {
  width: 100%;
  justify-content: center;
  margin-top: 3px;
}

.community-results {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.community-summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 24px;
}

.community-stat {
  background: #faf7f2;
  border: 1px solid #eee7df;
  border-radius: 14px;
  padding: 20px;
}

.community-stat > span {
  display: block;
  color: #8b5e3c;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.09em;
  margin-bottom: 8px;
}

.community-stat strong {
  display: block;
  font-size: 32px;
  color: #263238;
  line-height: 1.1;
}

.community-stat small {
  display: block;
  color: #94a3b8;
  margin-top: 5px;
}

.summary-stars {
  margin-top: 8px;
  color: #a67c52;
  letter-spacing: 1px;
  font-size: 14px;
}

.summary-stars span {
  color: #d9d2ca;
}

.community-signal-note {
  display: flex;
  gap: 10px;
  margin-top: 18px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 11px;
  color: #64748b;
}

.community-signal-note span {
  flex-shrink: 0;
}

.community-signal-note p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}

.community-empty-summary {
  text-align: center;
  padding: 35px 15px 10px;
}

.community-empty-summary > div {
  width: 54px;
  height: 54px;
  margin: 0 auto 13px;
  border-radius: 50%;
  background: #f1e7dc;
  color: #8b5e3c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.community-empty-summary h3 {
  margin: 0 0 7px;
  color: #334155;
}

.community-empty-summary p {
  margin: 0;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
}

.community-review-list {
  margin-top: 4px;
}

.community-review-item {
  padding: 22px 0;
  border-bottom: 1px solid #edf1f5;
}

.community-review-item:last-child {
  border-bottom: none;
  padding-bottom: 4px;
}

.review-top-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.review-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.review-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #f1e7dc;
  color: #8b5e3c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
}

.review-author strong {
  display: block;
  color: #334155;
  font-size: 14px;
  margin-bottom: 3px;
}

.review-author span {
  display: block;
  color: #94a3b8;
  font-size: 12px;
}

.review-rating {
  text-align: right;
}

.review-rating > span {
  color: #a67c52;
  letter-spacing: 1px;
  font-size: 14px;
}

.review-rating small {
  display: block;
  color: #94a3b8;
  font-size: 11px;
  margin-top: 3px;
}

.review-text {
  color: #475569;
  font-size: 14px;
  line-height: 1.7;
  margin: 15px 0 12px;
}

.review-footer {
  color: #a0aab5;
  font-size: 11px;
}

.community-empty-reviews {
  text-align: center;
  padding: 42px 15px 20px;
}

.empty-review-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: #faf7f2;
  color: #c8aa8b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
}

.community-empty-reviews h3 {
  margin: 0 0 7px;
  color: #334155;
}

.community-empty-reviews p {
  max-width: 390px;
  margin: 0 auto;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 800px) {
  .community-page {
    padding: 48px 18px 70px;
  }

  .community-layout {
    grid-template-columns: 1fr;
  }

  .community-hero h1 {
    font-size: 34px;
  }
}

@media (max-width: 500px) {
  .community-form-card,
  .community-summary-card,
  .community-reviews-card {
    padding: 21px;
    border-radius: 15px;
  }

  .community-summary-grid {
    grid-template-columns: 1fr;
  }

  .review-top-row {
    flex-direction: column;
  }

  .review-rating {
    text-align: left;
  }
}
`;

if (
  typeof document !== "undefined" &&
  !document.getElementById("community-reviews-styles")
) {
  const style = document.createElement("style");
  style.id = "community-reviews-styles";
  style.textContent = communityStyles;
  document.head.appendChild(style);
}

export default CommunityReviews;