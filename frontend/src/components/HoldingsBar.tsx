import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { buildPath } from "../../Path";
import "./NavBar.css";

interface Holding {
  id: string;
  symbol: string;
  currentPrice: number;
  currentValue: number;
  quantity: number;
  gain: number;
  gainPercent: number;
}

export default function HoldingsBar() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchHoldings() {
    if (!token) {
      console.error("No token found from AuthContext");
      return;
    }

    try {
      const res = await fetch(buildPath("/portfolio/summary"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({  })
      });

      const data = await res.json();

      if (data && data.holdings) {
        const mapped = data.holdings.map((h: any) => ({
          id: h.id || h._id || h.symbol,
          symbol: h.symbol,
          currentPrice: h.currentPrice,
          currentValue: h.currentValue,
          quantity: h.quantity,
          gain: h.gain,
          gainPercent: h.gainPercent
        }));

        setHoldings(mapped);
      }
    } catch (err) {
      console.error("Error fetching holdings:", err);
    }
  }

  useEffect(() => {
    fetchHoldings();

    // Auto-refresh every 5 seconds
    intervalRef.current = setInterval(() => {
      fetchHoldings();
    }, 5000);

    // Listen for manual refresh events
    const handler = () => fetchHoldings();
    window.addEventListener("refreshHoldings", handler);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("refreshHoldings", handler);
    };
  }, [token]);

  return (
    <div className="watchlist-container">
      <h2 className="watchlist-title">Holdings</h2>
      <div className="watchlist-list">
        {holdings.map((stock) => (
          <div
            key={stock.id}
            className="watchlist-item"
            onClick={() => navigate(`/stock/${stock.symbol}`)}
            style={{ cursor: "pointer" }}
          >
            <div className="watchlist-item-info">
              <div className="holdings-left">
                <div className="holdings-stock-symbol">{stock.symbol}</div>
                <div className="holdings-quantity">
                  {stock.quantity} {stock.quantity === 1 ? 'share' : 'shares'}
                </div>
              </div>

              <div className="holdings-right">
                <div className="holdings-prices">
                  <div className="holdings-stock-price">
                    ${stock.currentPrice.toFixed(2)}
                  </div>
                  <div className="holdings-total-value">
                    ${stock.currentValue.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                </div>

                <div className="watchlist-change-group">
                  <div className={`stock-change ${stock.gain >= 0 ? "positive" : "negative"}`}>
                    {stock.gain >= 0 ? "+" : ""}{stock.gain.toFixed(2)}
                  </div>
                  <div className={`stock-change-percent ${stock.gain >= 0 ? "positive" : "negative"}`}>
                    {stock.gain >= 0 ? "+" : ""}{stock.gainPercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {holdings.length === 0 && (
        <div className="watchlist-empty">No current holdings</div>
      )}
    </div>
  );
}
