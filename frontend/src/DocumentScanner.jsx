import { useState } from "react";

function DocumentScanner() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    setFile(selectedFile || null);
    setResult(null);
    setError("");
  };

  const scanDocument = async () => {
    if (!file) {
      setError("Please choose a document first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/scan-document",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to scan this document."
        );
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Document scanning is currently unavailable."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      style={{
        maxWidth: "1050px",
        margin: "0 auto",
        padding: "70px 24px 90px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          marginBottom: "42px",
        }}
      >
        <div
          className="hero-badge"
          style={{ display: "inline-flex" }}
        >
          <span>⌕</span>
          Document Intelligence
        </div>

        <h1 style={{ marginTop: "22px" }}>
          Check a document{" "}
          <span>before you trust it.</span>
        </h1>

        <p
          className="hero-description"
          style={{
            maxWidth: "720px",
            margin: "18px auto 0",
          }}
        >
          Upload an offer letter, recruitment document,
          admission letter or contract to extract important
          details and identify potential risk indicators.
        </p>
      </div>

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-title">
            <div className="detail-icon">📄</div>

            <div>
              <span>DOCUMENT SCANNER</span>
              <h3>Upload a document</h3>
            </div>
          </div>
        </div>

        <div
          style={{
            border: "2px dashed #dbe3ea",
            borderRadius: "14px",
            padding: "35px 20px",
            textAlign: "center",
            background: "#faf7f2",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "10px",
            }}
          >
            📄
          </div>

          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
          />

          <p
            style={{
              color: "#64748b",
              marginBottom: 0,
            }}
          >
            Supported: PDF, PNG, JPG, JPEG and WEBP
          </p>

          {file && (
            <p style={{ marginBottom: 0 }}>
              <strong>Selected:</strong> {file.name}
            </p>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: "12px 14px",
              borderRadius: "10px",
              background: "#fee2e2",
              color: "#991b1b",
              marginTop: "18px",
            }}
          >
            {error}
          </div>
        )}

        <button
          className="review-button"
          onClick={scanDocument}
          disabled={loading || !file}
          style={{
            width: "100%",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {loading
            ? "Analyzing document..."
            : "Scan Document →"}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: "28px" }}>
          <div className="detail-card">
            <div className="detail-header">
              <div className="detail-title">
                <div className="detail-icon">✦</div>

                <div>
                  <span>DOCUMENT ANALYSIS</span>
                  <h3>Extracted information</h3>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: "15px",
              }}
            >
              {[
                ["Organization", result.organization],
                ["Document type", result.document_type],
                ["Job / Course", result.job_or_course],
                ["Country", result.country],
                ["Salary / Fees", result.salary_or_fees],
                [
                  "Payment requirement",
                  result.payment_requirement,
                ],
                ["Contact", result.contact],
                [
                  "Visa information",
                  result.visa_information,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    background: "#faf7f2",
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      color: "#64748b",
                      fontSize: "13px",
                      marginBottom: "5px",
                    }}
                  >
                    {label}
                  </span>

                  <strong>
                    {value || "Not found"}
                  </strong>
                </div>
              ))}
            </div>
          </div>

          <div
            className="detail-card"
            style={{ marginTop: "22px" }}
          >
            <div className="detail-header">
              <div className="detail-title">
                <div className="detail-icon">⚠</div>

                <div>
                  <span>RISK INDICATORS</span>
                  <h3>Potential areas to verify</h3>
                </div>
              </div>
            </div>

            {result.risk_indicators?.length ? (
              <ul
                style={{
                  lineHeight: 1.7,
                  paddingLeft: "20px",
                }}
              >
                {result.risk_indicators.map(
                  (item, index) => (
                    <li key={index}>{item}</li>
                  )
                )}
              </ul>
            ) : (
              <p style={{ color: "#64748b" }}>
                No obvious risk indicators were identified
                from the available document content.
              </p>
            )}

            <div
              style={{
                marginTop: "18px",
                padding: "13px 15px",
                borderRadius: "10px",
                background: "#f1f5f9",
                color: "#475569",
                lineHeight: 1.6,
              }}
            >
              ⓘ This scanner identifies potential risk
              indicators from the available document content.
              It does not prove that a document is genuine or
              fraudulent.
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DocumentScanner;