import { useState } from "react";
import CommunityReviews from "./CommunityReviews";
import "./app.css";

function App() {
  const [companyData, setCompanyData] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [category, setCategory] = useState("Employment");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState("dashboard");

  const searchCompany = async () => {
    if (!companyName.trim()) return;

    setLoading(true);
    setError("");
    setCompanyData(null);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/search?company=${encodeURIComponent(
          companyName.trim()
        )}&category=${encodeURIComponent(category)}`
      );

      if (!response.ok) {
        throw new Error("Unable to analyze this organization.");
      }

      const data = await response.json();
      setCompanyData(data);
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

  const downloadReport = async () => {
  if (!companyData) return;

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/generate-report",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...companyData,
          category,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Unable to generate the verification report.");
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "TrustBridge_Verification_Report.pdf";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);

    setError(
      "We couldn't generate the verification report right now."
    );
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
          <button
            className={`nav-link ${currentPage === "dashboard" ? "active" : ""}`}
            onClick={() => setCurrentPage("dashboard")}
          >
            Dashboard
          </button>
          <button
            className={`nav-link ${currentPage === "community" ? "active" : ""}`}
            onClick={() => setCurrentPage("community")}
          >
            Community Reviews
          </button>
        </nav>
      </header>

      <main>
        {currentPage === "community" ? (
          <CommunityReviews
            initialOrganization={companyData?.company || ""}
          />
        ) : (
          <>
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

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                  justifyContent: "flex-end",
                }}
              >
              <div className="analyzed-badge">
                <span>●</span> Analysis complete
              </div>

              <button
                className="review-button"
                onClick={downloadReport}
              >
                Download PDF
             </button>
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

                  <span className="source-status pending">
                    COMING NEXT
                  </span>
                </div>

                <h3>Community Experiences</h3>

                <p>
                  Experiences from people who worked or studied there will
                  help strengthen future assessments.
                </p>

                <div className="evidence-footer">
                  <span>Community database</span>
                  <strong>Building</strong>
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
                onClick={() => setCurrentPage("community")}
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
          </>
        )}
      </main>

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
  );
}

export default App;