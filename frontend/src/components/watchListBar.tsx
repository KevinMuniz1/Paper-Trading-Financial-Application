import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; 
import { buildPath } from "../../Path"; 
import "./NavBar.css";

interface Holding {
  id: string;
  symbol: string;
  currentPrice: number;
  gain: number;
  gainPercent: number;
}

export default function WatchListBar() {
  const navigate = useNavigate();
  const { user } = useAuth();  
  const userId = user?.userId;

  const [holdings, setHoldings] = useState<Holding[]>([]);

  async function fetchHoldings() {
    if (!userId) {
      console.error("No userId found from AuthContext");
      return;
    }

    try {
      const res = await fetch(buildPath("/portfolio/summary"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();

      if (data && data.holdings) {
        const mapped = data.holdings.map((h: any) => ({
          id: h.id || h._id || h.symbol,
          symbol: h.symbol,
          currentPrice: h.currentPrice,
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

    const handler = () => fetchHoldings();
    window.addEventListener("refreshHoldings", handler);

    return () => window.removeEventListener("refreshHoldings", handler);
  }, [userId]);

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
              <div>
                <div className="holdings-stock-symbol">{stock.symbol}</div>
                <div className="holdings-stock-price">
                  ${stock.currentPrice.toFixed(2)}
                </div>
              </div>

              <div className="watchlist-change-group">
                <div className={`stock-change ${stock.gain >= 0 ? "positive" : "negative"}`}>
                  {stock.gain >= 0 ? "+" : ""}{stock.gain.toFixed(2)}
                </div>

                <div className={`stock-change ${stock.gain >= 0 ? "positive" : "negative"}`}>
                  {stock.gain >= 0 ? "+" : ""}{stock.gainPercent.toFixed(2)}%
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
