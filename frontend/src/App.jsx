import { useEffect, useState } from "react";

function App() {
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/search")
      .then((response) => response.json())
      .then((data) => setCompanyData(data));
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🚀 TrustBridge AI</h1>

      {companyData ? (
        <>
          <h2>{companyData.company}</h2>
          <h3>Trust Score: {companyData.trust_score}/100</h3>
          <h3>Risk: {companyData.risk}</h3>
          <p>{companyData.recommendation}</p>
        </>
      ) : (
        <h2>Loading...</h2>
      )}
    </div>
  );
}

export default App;