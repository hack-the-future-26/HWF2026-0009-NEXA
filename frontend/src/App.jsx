import {  useState } from "react";

function App() {
  const [companyData, setCompanyData] = useState(null);
  const [companyName, setCompanyName] = useState("");

  const searchCompany = () => {
  fetch(`http://127.0.0.1:8000/search?company=${companyName}`)
    .then((response) => response.json())
    .then((data) => setCompanyData(data));
};

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>🚀 TrustBridge AI</h1>
      <input
  type="text"
  placeholder="Enter company name"
  value={companyName}
  onChange={(e) => setCompanyName(e.target.value)}
  style={{
    padding: "10px",
    width: "300px",
    marginRight: "10px",
  }}
/>


<button
  onClick={searchCompany}
  style={{ padding: "10px 20px" }}
>
  Analyze
</button>
<br />
<br />

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