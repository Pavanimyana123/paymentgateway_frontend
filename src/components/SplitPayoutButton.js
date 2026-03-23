import React, { useState } from "react";
import axios from "axios";
import CustomNavbar from './Navbar';

const SplitPayoutButton = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleSplitPayout = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/create-split-payout",
        {
          reference_no: "315013757540", // optional if backend fixes it
        }
      );

      console.log("✅ Split payout response:", res.data);
      setResponse(res.data);

    } catch (err) {
      console.error("❌ Split payout error:", err);
      setError(
        err.response?.data?.error || "Split payout failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <CustomNavbar />
    <div style={{ padding: "20px" }}>
      <button
        onClick={handleSplitPayout}
        disabled={loading}
        style={{
          padding: "10px 20px",
          backgroundColor: "#0066cc",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        {loading ? "Processing..." : "Execute Split Payout"}
      </button>

      {/* Response UI */}
      {response && (
        <pre style={{ marginTop: 20, background: "#f4f4f4", padding: 15 }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}

      {error && (
        <p style={{ color: "red", marginTop: 20 }}>{error}</p>
      )}
    </div>
     </>
  );
};

export default SplitPayoutButton;
