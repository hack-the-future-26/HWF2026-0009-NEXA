import { useEffect, useState } from "react";
import "./app.css";

function App() {
  const [companyData, setCompanyData] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState("Employment");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [averageRating, setAverageRating] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewForm, setReviewForm] = useState({
    experience_type: "Employment",
    rating: 5,
    review_text: "",
    display_name: "",
  });

  const fetchReviews = async (organization) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/reviews?organization=${encodeURIComponent(
          organization.trim()
        )}`
      );

      if (!response.ok) {
        throw new Error("Unable to load community reviews.");
      }

      const data = await response.json();

      setReviews(data.reviews || []);
      setReviewCount(data.review_count || 0);
      setAverageRating(data.average_rating ?? null);
    } catch (err) {
      console.error("Review fetch error:", err);
      setReviews([]);
      setReviewCount(0);
      setAverageRating(null);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();

    if (!companyData?.company) return;

    setReviewSubmitting(true);
    setReviewMessage("");

    try {
      const response = await fetch("http://127.0.0.1:8000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          organization: companyData.company,
          experience_type: reviewForm.experience_type,
          rating: Number(reviewForm.rating),
          review_text: reviewForm.review_text,
          display_name: reviewForm.display_name || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail?.[0]?.msg || "Unable to submit review."
        );
      }

      setReviewMessage("Review submitted successfully!");

      setReviewForm({
        experience_type: "Employment",
        rating: 5,
        review_text: "",
        display_name: "",
      });

      await fetchReviews(companyData.company);

      setTimeout(() => {
        setShowReviewForm(false);
        setReviewMessage("");
      }, 1200);
    } catch (err) {
      console.error("Review submission error:", err);
      setReviewMessage(err.message || "Unable to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const searchCompany = async () => {
    if (!companyName.trim()) return;

    setLoading(true);
    setError("");
    setCompanyData(null);
    setReviews([]);
    setReviewCount(0);
    setAverageRating(null);
    setShowReviewForm(false);
    setReviewMessage("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/search?company=${encodeURIComponent(
          companyName.trim()
        )}`
      );

      if (!response.ok) {
        throw new Error("Unable to analyze this organization.");
      }

      const data = await response.json();
      setCompanyData(data);
      await fetchReviews(data.company);
    } catch (err) {
      console.error(err);
      setError(
        "We couldn't analyze this organization right now. Please check that the TrustBridge AI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      searchCompany();
    }
  };

  const getRiskColor = (risk) => {
    if (!risk) return "#64748b";

    const value = risk.toLowerCase();

    if (value.includes("low")) return "#16a34a";
    if (value.includes("medium")) return "#d97706";
    if (value.includes("high")) return "#dc2626";

    return "#64748b";
  };

  const getRiskBackground = (risk) => {
    if (!risk) return "#f1f5f9";

    const value = risk.toLowerCase();

    if (value.includes("low")) return "#dcfce7";
    if (value.includes("medium")) return "#fef3c7";
    if (value.includes("high")) return "#fee2e2";

    return "#f1f5f9";
  };

  const getScoreNumber = (score) => {
    const number = Number.parseInt(score, 10);

    if (Number.isNaN(number)) return null;

    return Math.min(100, Math.max(0, number));
  };

  const getScoreMessage = (score) => {
    const number = getScoreNumber(score);

    if (number === null) return "Assessment unavailable";
    if (number >= 80) return "Strong trust indicators";
    if (number >= 60) return "Some areas need attention";
    if (number >= 40) return "Proceed with caution";

    return "High caution recommended";
  };

  return (
    <>
      <style>{`
        .review-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(15, 23, 42, 0.55);
          backdrop-filter: blur(5px);
        }
        .review-modal {
          width: min(560px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: #fff;
          border-radius: 22px;
          padding: 28px;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.25);
        }
        .review-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 8px;
        }
        .review-modal-header span {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .12em;
          color: #2563eb;
        }
        .review-modal-header h2 {
          margin: 6px 0 0;
          font-size: 26px;
          color: #0f172a;
        }
        .review-close {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #f1f5f9;
          color: #475569;
          font-size: 24px;
          cursor: pointer;
        }
        .review-organization {
          margin: 0 0 22px;
          color: #64748b;
          line-height: 1.6;
        }
        .review-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 16px;
        }
        .review-field > span {
          font-size: 13px;
          font-weight: 700;
          color: #334155;
        }
        .review-field input,
        .review-field select,
        .review-field textarea {
          width: 100%;
          border: 1px solid #dbe3ee;
          border-radius: 12px;
          padding: 12px 14px;
          background: #f8fafc;
          color: #0f172a;
          font: inherit;
          outline: none;
        }
        .review-field input:focus,
        .review-field select:focus,
        .review-field textarea:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, .1);
          background: #fff;
        }
        .review-field textarea {
          resize: vertical;
          min-height: 120px;
        }
        .review-message {
          padding: 11px 13px;
          border-radius: 10px;
          margin-bottom: 14px;
          font-size: 13px;
          font-weight: 600;
        }
        .review-message.success {
          background: #dcfce7;
          color: #166534;
        }
        .review-message.error {
          background: #fee2e2;
          color: #991b1b;
        }
        .review-submit {
          width: 100%;
          padding: 13px 18px;
          border-radius: 12px;
          background: #2563eb;
          color: #fff;
          font-weight: 700;
          cursor: pointer;
          font-size: 14px;
        }
        .review-submit:hover {
          background: #1d4ed8;
        }
        .review-submit:disabled {
          opacity: .65;
          cursor: not-allowed;
        }
        .review-disclaimer {
          margin: 16px 0 0;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.6;
        }
        .community-review-panel {
          margin-top: 24px;
        }
        @media (max-width: 600px) {
          .review-modal-overlay { padding: 12px; }
          .review-modal {
            padding: 20px;
            border-radius: 18px;
          }
          .review-modal-header h2 { font-size: 22px; }
        }
      `}</style>

      <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">🛡️</div>

          <div>
            <div className="brand-name">TrustBridge AI</div>
            <div className="brand-tagline">Verify Before You Trust</div>
          </div>
        </div>

        <nav className="nav-links">
          <button className="nav-link active">Dashboard</button>
          <button className="nav-link">Community Reviews</button>
        </nav>
      </header>

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-badge">
            <span>✦</span>
            AI-Powered Organization Verification
          </div>

          <h1>
            Make informed decisions
            <br />
            <span>before you trust.</span>
          </h1>

          <p className="hero-description">
            Verify companies, universities, institutes and organizations using
            legal records, recent news and AI-powered risk analysis.
          </p>

          {/* SEARCH */}
          <div className="search-container">
            <div className="search-box">
              <span className="search-icon">⌕</span>

              <input
                value={companyName}
                onChange={(event) => {
                  setCompanyName(event.target.value);
                  setCompanyData(null);
                  setError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter company, university, institute or organization..."
              />

              <button
                className="analyze-button"
                onClick={searchCompany}
                disabled={loading}
              >
                {loading ? "Analyzing..." : "Analyze →"}
              </button>
            </div>

            <div className="search-hint">
              Example: Google, Microsoft, a university, recruitment agency...
            </div>
          </div>

          {/* CATEGORY */}
          <div className="category-section">
            <span className="category-label">What are you checking?</span>

            <div className="category-buttons">
              {["Employment", "Education", "Overseas Opportunity"].map(
                (item) => (
                  <button
                    key={item}
                    className={`category-button ${
                      category === item ? "selected" : ""
                    }`}
                    onClick={() => setCategory(item)}
                  >
                    {item === "Employment" && "💼"}
                    {item === "Education" && "🎓"}
                    {item === "Overseas Opportunity" && "🌍"}
                    {item}
                  </button>
                )
              )}
            </div>
          </div>
        </section>

        {/* LOADING */}
        {loading && (
          <section className="loading-section">
            <div className="loading-spinner"></div>

            <h2>Analyzing {companyName}...</h2>

            <p>
              TrustBridge AI is checking legal information, recent news and
              generating a risk assessment.
            </p>

            <div className="loading-steps">
              <span>✓ Organization search</span>
              <span>◌ Legal verification</span>
              <span>◌ News analysis</span>
              <span>◌ AI assessment</span>
            </div>
          </section>
        )}

        {/* ERROR */}
        {error && !loading && (
          <section className="error-box">
            <div className="error-icon">!</div>

            <div>
              <strong>Analysis unavailable</strong>
              <p>{error}</p>
            </div>
          </section>
        )}

        {/* RESULTS */}
        {companyData && !loading && (
          <section className="results fade-in">
            {/* ORGANIZATION HEADER */}
            <div className="result-header">
              <div>
                <div className="result-label">
                  {category} verification result
                </div>

                <h2>{companyData.company}</h2>

                <p>
                  AI-powered assessment based on available organizational
                  evidence.
                </p>
              </div>

              <div className="analyzed-badge">
                <span>●</span> Analysis complete
              </div>
            </div>

            {/* SCORE CARDS */}
            <div className="summary-grid">
              <div className="summary-card score-card">
                <div className="card-label">Trust Score</div>

                <div className="score-display">
                  <div
                    className="score-ring"
                    style={{
                      "--score": `${getScoreNumber(
                        companyData.trust_score
                      ) || 0}%`,
                    }}
                  >
                    <div className="score-inner">
                      <strong>
                        {companyData.trust_score === "N/A"
                          ? "—"
                          : companyData.trust_score}
                      </strong>
                      <span>/100</span>
                    </div>
                  </div>

                  <div className="score-text">
                    <strong>
                      {getScoreMessage(companyData.trust_score)}
                    </strong>

                    <span>
                      Based on currently available evidence
                    </span>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-label">Risk Level</div>

                <div className="risk-display">
                  <div
                    className="risk-icon"
                    style={{
                      color: getRiskColor(companyData.risk),
                      background: getRiskBackground(companyData.risk),
                    }}
                  >
                    {companyData.risk?.toLowerCase().includes("low")
                      ? "✓"
                      : companyData.risk
                          ?.toLowerCase()
                          .includes("medium")
                      ? "!"
                      : "⚠"}
                  </div>

                  <div>
                    <strong
                      style={{
                        color: getRiskColor(companyData.risk),
                      }}
                    >
                      {companyData.risk || "Unknown"}
                    </strong>

                    <span>Overall risk assessment</span>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <div className="card-label">Legal Status</div>

                <div className="legal-status-display">
                  <div className="verified-icon">✓</div>

                  <div>
                    <strong>
                      {companyData.legal_info?.status || "Unknown"}
                    </strong>

                    <span>GLEIF record check</span>
                  </div>
                </div>
              </div>
            </div>

            {/* EVIDENCE SOURCES */}
            <div className="section-heading">
              <div>
                <span className="eyebrow">EVIDENCE</span>
                <h3>Verification overview</h3>
              </div>

              <span className="evidence-note">
                Based on available data sources
              </span>
            </div>

            <div className="evidence-grid">
              <div className="evidence-card">
                <div className="evidence-top">
                  <div className="evidence-icon legal">⚖</div>

                  <span className="source-status">CHECKED</span>
                </div>

                <h3>Legal Records</h3>

                <p>
                  Organization information checked against available GLEIF
                  legal entity records.
                </p>

                <div className="evidence-footer">
                  <span>Source</span>
                  <strong>GLEIF</strong>
                </div>
              </div>

              <div className="evidence-card">
                <div className="evidence-top">
                  <div className="evidence-icon news">◉</div>

                  <span className="source-status">
                    {companyData.news?.length ? "FOUND" : "NO DATA"}
                  </span>
                </div>

                <h3>News Intelligence</h3>

                <p>
                  Recent news related to the organization is analyzed for
                  potential reputation signals.
                </p>

                <div className="evidence-footer">
                  <span>Articles found</span>
                  <strong>{companyData.news?.length || 0}</strong>
                </div>
              </div>

              <div className="evidence-card community-card">
                <div className="evidence-top">
                  <div className="evidence-icon community">★</div>

                  <span className="source-status">
                    {reviewCount > 0 ? "AVAILABLE" : "NO REVIEWS"}
                  </span>
                </div>

                <h3>Community Experiences</h3>

                <p>
                  Real experiences from people who worked or studied there
                  help others make safer decisions.
                </p>

                <div className="evidence-footer">
                  <span>
                    {reviewCount > 0
                      ? `${reviewCount} review${reviewCount === 1 ? "" : "s"}`
                      : "Community database"}
                  </span>
                  <strong>
                    {averageRating !== null ? `★ ${averageRating}/5` : "No data"}
                  </strong>
                </div>
              </div>
            </div>

            {/* AI ASSESSMENT */}
            <div className="ai-card">
              <div className="ai-header">
                <div className="ai-title">
                  <div className="ai-icon">✦</div>

                  <div>
                    <span>TRUSTBRIDGE AI</span>
                    <h3>AI Risk Assessment</h3>
                  </div>
                </div>

                <span className="ai-powered">AI ANALYSIS</span>
              </div>

              <div className="ai-content">
                <p>{companyData.recommendation}</p>
              </div>

              <div className="ai-note">
                <span>ⓘ</span>
                TrustBridge AI provides a risk assessment based on available
                evidence. It does not declare an organization legitimate or
                fraudulent.
              </div>
            </div>

            {/* DETAILS */}
            <div className="details-grid">
              {/* LEGAL */}
              <div className="detail-card">
                <div className="detail-header">
                  <div className="detail-title">
                    <div className="detail-icon">⚖</div>

                    <div>
                      <span>VERIFICATION</span>
                      <h3>Legal Information</h3>
                    </div>
                  </div>

                  <span className="checked-pill">✓ Checked</span>
                </div>

                <div className="detail-list">
                  <div className="detail-row">
                    <span>Legal Name</span>
                    <strong>
                      {companyData.legal_info?.legal_name ||
                        "Not Available"}
                    </strong>
                  </div>

                  <div className="detail-row">
                    <span>LEI</span>
                    <strong className="lei-value">
                      {companyData.legal_info?.lei || "N/A"}
                    </strong>
                  </div>

                  <div className="detail-row">
                    <span>Status</span>
                    <strong>
                      {companyData.legal_info?.status || "Unknown"}
                    </strong>
                  </div>

                  <div className="detail-row">
                    <span>Jurisdiction</span>
                    <strong>
                      {companyData.legal_info?.jurisdiction || "N/A"}
                    </strong>
                  </div>

                  <div className="detail-row">
                    <span>Address</span>
                    <strong>
                      {companyData.legal_info?.legal_address ||
                        "Not Available"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* NEWS */}
              <div className="detail-card">
                <div className="detail-header">
                  <div className="detail-title">
                    <div className="detail-icon news-detail">◉</div>

                    <div>
                      <span>INTELLIGENCE</span>
                      <h3>Recent News</h3>
                    </div>
                  </div>

                  <span className="news-count">
                    {companyData.news?.length || 0} articles
                  </span>
                </div>

                <div className="news-list">
                  {companyData.news?.length ? (
                    companyData.news.map((item, index) => (
                      <div className="news-item" key={index}>
                        <div className="news-number">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div>
                          <p>{item}</p>
                          <span>Recent news source</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-news">
                      <span>📰</span>
                      <p>No recent news was found for this organization.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COMMUNITY REVIEWS */}
            <div className="detail-card community-review-panel">
              <div className="detail-header">
                <div className="detail-title">
                  <div className="detail-icon">★</div>
                  <div>
                    <span>COMMUNITY</span>
                    <h3>Community Reviews</h3>
                  </div>
                </div>

                <span className="news-count">
                  {reviewCount} review{reviewCount === 1 ? "" : "s"}
                </span>
              </div>

              {reviewCount > 0 ? (
                <div className="news-list">
                  {reviews.slice(0, 3).map((review) => (
                    <div className="news-item" key={review.id}>
                      <div className="news-number">★</div>
                      <div>
                        <p>
                          {"★".repeat(review.rating)}
                          {"☆".repeat(5 - review.rating)}
                        </p>
                        <p>{review.review_text}</p>
                        <span>
                          {review.display_name || "Community member"} ·{" "}
                          {review.experience_type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-news">
                  <span>💬</span>
                  <p>
                    No community reviews yet. Be the first person to share
                    your experience.
                  </p>
                </div>
              )}

              <button
                type="button"
                className="review-button"
                onClick={() => {
                  setShowReviewForm(true);
                  setReviewMessage("");
                }}
                style={{ marginTop: "18px", width: "100%" }}
              >
                Share Your Experience →
              </button>
            </div>

            {/* COMMUNITY CTA */}
            <div className="community-cta">
              <div className="community-cta-icon">★</div>

              <div className="community-cta-content">
                <span>HELP THE COMMUNITY</span>

                <h3>
                  Have you worked or studied here?
                </h3>

                <p>
                  Share your experience and help others make safer decisions.
                  Community reviews will become part of TrustBridge AI's
                  verification system.
                </p>
              </div>

              <button
                className="review-button"
                type="button"
                onClick={() => {
                  setShowReviewForm(true);
                  setReviewMessage("");
                }}
              >
                Share Experience →
              </button>
            </div>
          </section>
        )}

        {/* EMPTY STATE */}
        {!companyData && !loading && !error && (
          <section className="empty-state">
            <div className="empty-state-icon">🛡️</div>

            <h2>Start your verification</h2>

            <p>
              Enter an organization above to see its legal information,
              reputation signals and AI-powered risk assessment.
            </p>
          </section>
        )}
      </main>

      {/* COMMUNITY REVIEW MODAL */}
      {showReviewForm && companyData && (
        <div
          className="review-modal-overlay"
          onClick={() => {
            if (!reviewSubmitting) {
              setShowReviewForm(false);
              setReviewMessage("");
            }
          }}
        >
          <div
            className="review-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="review-modal-header">
              <div>
                <span>COMMUNITY EXPERIENCE</span>
                <h2>Share your experience</h2>
              </div>

              <button
                type="button"
                className="review-close"
                onClick={() => {
                  setShowReviewForm(false);
                  setReviewMessage("");
                }}
                disabled={reviewSubmitting}
              >
                ×
              </button>
            </div>

            <p className="review-organization">
              Sharing your experience about <strong>{companyData.company}</strong>
            </p>

            <form onSubmit={submitReview}>
              <label className="review-field">
                <span>Experience type</span>
                <select
                  value={reviewForm.experience_type}
                  onChange={(event) =>
                    setReviewForm({
                      ...reviewForm,
                      experience_type: event.target.value,
                    })
                  }
                  required
                >
                  <option>Employment</option>
                  <option>Education</option>
                  <option>Recruitment</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="review-field">
                <span>Rating</span>
                <select
                  value={reviewForm.rating}
                  onChange={(event) =>
                    setReviewForm({
                      ...reviewForm,
                      rating: Number(event.target.value),
                    })
                  }
                  required
                >
                  <option value={5}>★★★★★ — Excellent</option>
                  <option value={4}>★★★★☆ — Good</option>
                  <option value={3}>★★★☆☆ — Average</option>
                  <option value={2}>★★☆☆☆ — Poor</option>
                  <option value={1}>★☆☆☆☆ — Very poor</option>
                </select>
              </label>

              <label className="review-field">
                <span>Your experience</span>
                <textarea
                  value={reviewForm.review_text}
                  onChange={(event) =>
                    setReviewForm({
                      ...reviewForm,
                      review_text: event.target.value,
                    })
                  }
                  placeholder="Tell others about your experience..."
                  minLength={10}
                  maxLength={2000}
                  rows={5}
                  required
                />
              </label>

              <label className="review-field">
                <span>Name (optional)</span>
                <input
                  value={reviewForm.display_name}
                  onChange={(event) =>
                    setReviewForm({
                      ...reviewForm,
                      display_name: event.target.value,
                    })
                  }
                  placeholder="Your name"
                  maxLength={80}
                />
              </label>

              {reviewMessage && (
                <div
                  className={`review-message ${
                    reviewMessage.toLowerCase().includes("success")
                      ? "success"
                      : "error"
                  }`}
                >
                  {reviewMessage}
                </div>
              )}

              <button
                type="submit"
                className="review-submit"
                disabled={reviewSubmitting}
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review →"}
              </button>
            </form>

            <p className="review-disclaimer">
              Please share genuine experiences only. Do not include passwords,
              phone numbers, financial details, or other sensitive information.
            </p>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <div className="footer-brand">
          🛡️ <strong>TrustBridge AI</strong>
        </div>

        <p>
          AI-powered organization trust & risk assessment platform
        </p>

        <span>Built for safer decisions • Hack the Future 26</span>
      </footer>
    </div>
    </>
  );
}

export default App;