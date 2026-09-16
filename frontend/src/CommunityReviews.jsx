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
        `http://127.0.0.1:8000/reviews?organization=${encodeURIComponent(
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
      const response = await fetch("http://127.0.0.1:8000/reviews", {
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

  return (
    <section
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "70px 24px 90px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "42px" }}>
        <div className="hero-badge" style={{ display: "inline-flex" }}>
          <span>★</span>
          Community Experiences
        </div>

        <h1 style={{ marginTop: "22px" }}>
          Share what you <span>experienced.</span>
        </h1>

        <p
          className="hero-description"
          style={{ maxWidth: "700px", margin: "18px auto 0" }}
        >
          Help others make safer decisions by sharing your experience with a
          company, university, institute or organization.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: "28px",
          alignItems: "start",
        }}
      >
        <div className="detail-card">
          <div className="detail-header">
            <div className="detail-title">
              <div className="detail-icon">★</div>
              <div>
                <span>COMMUNITY</span>
                <h3>Share your experience</h3>
              </div>
            </div>
          </div>

          <form onSubmit={submitReview}>
            <label>Organization</label>
            <input
              value={organization}
              onChange={(e) => {
                setOrganization(e.target.value);
                setMessage("");
              }}
              onBlur={() => loadReviews(organization)}
              placeholder="Example: ABC Overseas Recruitment"
              style={inputStyle}
            />

            <label>Experience type</label>
            <div style={optionRow}>
              {["Worked", "Studied", "Other"].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setExperienceType(type)}
                  style={{
                    ...optionButton,
                    background:
                      experienceType === type ? "#f1e7dc" : "#fff",
                    fontWeight: experienceType === type ? 700 : 500,
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            <label>Rating</label>
            <div style={starRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => setRating(value)}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontSize: "28px",
                    opacity: value <= rating ? 1 : 0.25,
                  }}
                >
                  ★
                </button>
              ))}
            </div>

            <label>Your experience</label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Tell others about your experience..."
              rows="6"
              style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
            />

            <label>
              Display name{" "}
              <span style={{ fontWeight: 400, color: "#64748b" }}>
                (optional)
              </span>
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Example: Anonymous"
              style={inputStyle}
            />

            {error && <div style={errorStyle}>{error}</div>}
            {message && <div style={successStyle}>{message}</div>}

            <button
              type="submit"
              className="review-button"
              disabled={loading}
              style={{ width: "100%", justifyContent: "center" }}
            >
              {loading ? "Submitting..." : "Submit Experience →"}
            </button>
          </form>
        </div>

        <div>
          <div className="detail-card" style={{ marginBottom: "22px" }}>
            <div className="detail-header">
              <div className="detail-title">
                <div className="detail-icon">★</div>
                <div>
                  <span>COMMUNITY SIGNAL</span>
                  <h3>Review summary</h3>
                </div>
              </div>
            </div>

            {data ? (
              <div style={summaryGrid}>
                <div style={summaryBox}>
                  <span>Reviews</span>
                  <strong>{data.review_count}</strong>
                </div>
                <div style={summaryBox}>
                  <span>Average rating</span>
                  <strong>{data.average_rating ?? "—"} / 5</strong>
                </div>
              </div>
            ) : (
              <p style={{ color: "#64748b", marginBottom: 0 }}>
                Enter an organization name to see its community experiences.
              </p>
            )}
          </div>

          <div className="detail-card">
            <div className="detail-header">
              <div className="detail-title">
                <div className="detail-icon">◉</div>
                <div>
                  <span>EXPERIENCES</span>
                  <h3>Recent community reviews</h3>
                </div>
              </div>
            </div>

            {data?.reviews?.length ? (
              data.reviews.map((review) => (
                <div key={review.id} style={reviewBox}>
                  <div style={reviewHeader}>
                    <strong>{review.display_name || "Anonymous"}</strong>
                    <span>
                      {"★".repeat(review.rating)}
                      <span style={{ opacity: 0.25 }}>
                        {"★".repeat(5 - review.rating)}
                      </span>
                    </span>
                  </div>

                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    {review.experience_type}
                  </div>

                  <p style={{ lineHeight: 1.6 }}>{review.review_text}</p>
                </div>
              ))
            ) : (
              <div className="empty-news">
                <span>★</span>
                <p>
                  {loading
                    ? "Loading reviews..."
                    : "No community reviews have been submitted for this organization yet."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "13px 14px",
  border: "1px solid #dbe3ea",
  borderRadius: "10px",
  marginBottom: "18px",
  fontSize: "15px",
};

const optionRow = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  marginBottom: "18px",
};

const optionButton = {
  padding: "9px 15px",
  borderRadius: "999px",
  border: "1px solid #dbe3ea",
  cursor: "pointer",
};

const starRow = {
  display: "flex",
  gap: "5px",
  marginBottom: "18px",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "15px",
};

const summaryBox = {
  padding: "18px",
  borderRadius: "12px",
  background: "#faf7f2",
};

const reviewBox = {
  padding: "18px 0",
  borderBottom: "1px solid #edf1f5",
};

const reviewHeader = {
  display: "flex",
  justifyContent: "space-between",
  gap: "12px",
  marginBottom: "7px",
};

const errorStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  background: "#fee2e2",
  color: "#991b1b",
  marginBottom: "14px",
};

const successStyle = {
  padding: "12px 14px",
  borderRadius: "10px",
  background: "#dcfce7",
  color: "#166534",
  marginBottom: "14px",
};

export default CommunityReviews;
