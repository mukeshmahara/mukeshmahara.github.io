import React, { useState, useEffect } from "react";

const WinnerCard = ({ winner }) => {
  const details = winner.details;
  return (
    <div className="winner-card">
      <div className="winner-header">
        <span className="winner-code">{winner.code}</span>
        <span className="winner-rank">Rank #{details.rank}</span>
      </div>
      <div className="winner-details">
        {details.category && (
          <div className="detail-row">
            <span className="detail-label">Category:</span>
            <span className="detail-value">{details.category}</span>
          </div>
        )}
        {details.fiscalYear && (
          <div className="detail-row">
            <span className="detail-label">Fiscal Year:</span>
            <span className="detail-value">{details.fiscalYear}</span>
          </div>
        )}
        {details.drawTitle && (
          <div className="detail-row">
            <span className="detail-label">Draw:</span>
            <span className="detail-value draw-title">{details.drawTitle}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default function CouponCheckerComponent() {
  const [couponInput, setCouponInput] = useState("");
  const [results, setResults] = useState(null);
  const [winners, setWinners] = useState(new Set());
  const [winnerDetails, setWinnerDetails] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, found: 0 });
  const apiEndpoint = "https://prize.ird.gov.np/api/v1/public/winners";

  useEffect(() => {
    loadAllWinners();
  }, []);

  const loadAllWinners = async () => {
    try {
      // Load from static JSON file instead of API
      const response = await fetch("/winners-data.json");
      const data = await response.json();

      const newWinners = new Set();
      const newWinnerDetails = new Map();

      // Process data (same as before)
      processWinners(data, newWinners, newWinnerDetails);

      setWinners(newWinners);
      setWinnerDetails(newWinnerDetails);
      setLoading(false);
    } catch (error) {
      console.error("Error loading winners:", error);
      setLoading(false);
    }
  };

  const processWinners = (data, winnersSet, detailsMap) => {
    if (!data || !data.draws) return;

    data.draws.forEach((draw) => {
      if (draw.winners && Array.isArray(draw.winners)) {
        draw.winners.forEach((winner) => {
          if (winner.prize_coupon_number) {
            const couponNumber = winner.prize_coupon_number.trim();
            winnersSet.add(couponNumber);
            detailsMap.set(couponNumber, {
              rank: winner.winner_rank,
              fiscalYear: winner.prize_fiscal_year_code,
              category: draw.category_title_en,
              drawTitle: draw.title_en,
              claimOpen: draw.claim_open,
            });
          }
        });
      }
    });
  };

  const parseCouponInput = (input) => {
    return input
      .split(/[\n,\s]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((code) => code.replace(/[\s,;-]/g, ""))
      .filter((code, index, self) => self.indexOf(code) === index);
  };

  const checkCoupons = () => {
    if (!couponInput.trim()) {
      alert("Please enter at least one coupon code");
      return;
    }

    const coupons = parseCouponInput(couponInput);
    if (coupons.length === 0) {
      alert("No valid coupon codes found. Please check your input.");
      return;
    }

    const winningCodes = coupons
      .filter((coupon) => winners.has(coupon))
      .map((code) => ({ code, details: winnerDetails.get(code) }));

    const nonWinningCodes = coupons.filter((coupon) => !winners.has(coupon));

    setStats({ total: coupons.length, found: winningCodes.length });
    setResults({
      winners: winningCodes.length > 0 ? winningCodes : null,
      nonWinners: nonWinningCodes.length > 0 ? nonWinningCodes : null,
    });
  };
  if (loading) {
    return (
      <div className="coupon-checker">
        <div className="loading-message">Loading winner data...</div>
      </div>
    );
  }

  return (
    <div className="coupon-checker">
      <div className="coupon-checker-header">
        <h1>🏆 IRD Prize Coupon Checker</h1>
        <p>Check if your coupon codes are winners!</p>
      </div>

      <div className="input-section">
        <h2>Enter Your Coupon Codes</h2>
        <div className="input-group">
          <textarea
            value={couponInput}
            onChange={(e) => setCouponInput(e.target.value)}
            placeholder="Enter coupon codes, one per line... (e.g., 048915618211, 047751629120)"
            rows="6"
          />
          <div className="button-group">
            <button onClick={checkCoupons} className="btn btn-primary">
              Check Winners
            </button>
            <button
              onClick={() => {
                setCouponInput("");
                setResults(null);
              }}
              className="btn btn-secondary"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="input-help">
          <small>
            Tip: Paste multiple coupon codes separated by spaces, commas, or new
            lines
          </small>
        </div>
      </div>

      {results && (
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Checked</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat-card win">
            <span className="stat-label">Winners Found</span>
            <span className="stat-value">{stats.found}</span>
          </div>
        </div>
      )}

      <div className="results-section">
        <h2>Results</h2>
        {!results ? (
          <p className="placeholder">
            Enter coupon codes above and click "Check Winners" to see results
          </p>
        ) : (
          <>
            {results.winners && results.winners.length > 0 && (
              <div className="results-group winners">
                <h3 className="winners-title">
                  🎉 Winners Found ({results.winners.length})
                </h3>
                <div className="winner-cards">
                  {results.winners.map((winner, idx) => (
                    <WinnerCard key={idx} winner={winner} />
                  ))}
                </div>
              </div>
            )}

            {results.nonWinners && results.nonWinners.length > 0 && (
              <div className="results-group non-winners">
                <h3 className="non-winners-title">
                  Not Winners ({results.nonWinners.length})
                </h3>
                <div className="non-winner-codes">
                  {results.nonWinners.map((code, idx) => (
                    <span key={idx} className="code-badge">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
<div className="coupon-checker-component">
  <div className="header">
    <h1>🏆 IRD Prize Coupon Checker</h1>
    <p>Check if your coupon codes are winners!</p>
  </div>

  <div className="info-section">
    <h2>Quick Access</h2>
    <p>The full-featured Coupon Checker is available as a standalone page:</p>
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      <a
        href="/coupon-checker.html"
        className="nav-button btn-primary"
        style={{
          display: "inline-block",
          padding: "15px 30px",
          margin: "10px",
          textDecoration: "none",
        }}
      >
        Open Prize Checker
      </a>
      <a
        href="https://prize.ird.gov.np"
        target="_blank"
        rel="noopener noreferrer"
        className="nav-button btn-secondary"
        style={{
          display: "inline-block",
          padding: "15px 30px",
          margin: "10px",
          textDecoration: "none",
        }}
      >
        Visit IRD Prize Portal
      </a>
    </div>
  </div>

  <div className="info-section">
    <h2>How to Use</h2>
    <ol style={{ textAlign: "left", maxWidth: "600px", margin: "0 auto" }}>
      <li>Click "Open Prize Checker" button above</li>
      <li>Paste your coupon codes in the text area</li>
      <li>Click "Check Winners" to see results</li>
    </ol>
  </div>
</div>;
