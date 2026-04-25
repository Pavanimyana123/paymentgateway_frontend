import React, { useEffect, useState } from "react";
import axios from "axios";
import CustomNavbar from "./Navbar";
import BaseURL from './BaseURL';

const SplitPayoutHistory = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ---------------- FETCH DATA ----------------
  const fetchSplitPayouts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BaseURL}/api/split-payouts`
      );

      setPayouts(res.data.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load split payout history");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- USE EFFECT ----------------
  useEffect(() => {
    fetchSplitPayouts();
  }, []);

  return (
    <>
      <CustomNavbar />

      <div style={{ marginTop: 30, padding: 20 }}>
        <h3>Split Payout History</h3>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <table
          border="1"
          cellPadding="8"
          style={{ width: "100%", marginTop: 10 }}
        >
          <thead style={{ background: "#f5f5f5" }}>
            <tr>
              <th>ID</th>
              <th>Reference No</th>
              <th>Sub Account</th>
              <th>Vendor Amount</th>
              <th>Merchant Commission</th>
              <th>CC Avenue Fee</th>
              <th>Tax on Fee</th>
              <th>Status</th>
              <th>Created At</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: 20 }}>
                  Loading split payout history...
                </td>
              </tr>
            ) : payouts.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: 20 }}>
                  No split payouts found
                </td>
              </tr>
            ) : (
              payouts.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.reference_number}</td>
                  <td>{row.sub_account_id}</td>
                  <td>₹{row.vendor_payout}</td>
                  <td>₹{row.merchant_commission}</td>
                  <td>₹{row.ccavenue_fee}</td>
                  <td>₹{row.tax_on_transaction}</td>
                  <td
                    style={{
                      color: row.status === "SUCCESS" ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {row.status}
                  </td>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SplitPayoutHistory;
