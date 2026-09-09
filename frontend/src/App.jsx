import { useState } from "react";

function App() {
  const [companyData, setCompanyData] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);

  const searchCompany = () => {
    setLoading(true);

    fetch(`http://127.0.0.1:8000/search?company=${companyName}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setCompanyData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🚀 TrustBridge AI</h1>

      <input
        type="text"
        placeholder="Enter company name"
        value={companyName}
        onChange={(e) => setCompanyName(e.target.value)}
        style={{ padding: "10px", width: "300px", marginRight: "10px" }}
      />

      <button onClick={searchCompany}>
        Analyze
      </button>

      <br />
      <br />

      {loading && <h2>Loading...</h2>}

      {companyData && (
        <>
          <h2>{companyData.company}</h2>
          <h3>Trust Score: {companyData.trust_score}</h3>
          <h3>Risk: {companyData.risk}</h3>
          <p>{companyData.recommendation}</p>
        </>
      )}
    </div>
  );
}

export default App;