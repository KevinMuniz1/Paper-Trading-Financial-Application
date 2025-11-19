import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { buildPath } from "../../Path";
import "./NavBar.css";

interface WatchlistItem {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
}

export default function WatchlistSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId;
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  async function fetchWatchlist() {
    if (!userId) {
      console.error("No userId found from AuthContext");
      return;
    }

    try {
      const res = await fetch(buildPath("/watchlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();

      if (data && data.watchlist) {
        setWatchlist(data.watchlist);
      }
    } catch (err) {
      console.error("Error fetching watchlist:", err);
    }
  }

  useEffect(() => {
    fetchWatchlist();

    // Auto-refresh every 10 seconds
    intervalRef.current = setInterval(() => {
      fetchWatchlist();
    }, 10000);

    // Listen for manual refresh events
    const handler = () => fetchWatchlist();
    window.addEventListener("refreshWatchlist", handler);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("refreshWatchlist", handler);
    };
  }, [userId]);

  return (
    <div className="watchlist-container">
      <h2 className="watchlist-title">Watchlist</h2>
      <div className="watchlist-list">
        {watchlist.map((stock) => (
          <div
            key={stock.symbol}
            className="watchlist-item"
            onClick={() => navigate(`/stock/${stock.symbol}`)}
          >
            <div className="watchlist-item-info">
              <div className="holdings-left">
                <div className="holdings-stock-symbol">{stock.symbol}</div>
                <div className="holdings-quantity">
                  {stock.name}
                </div>
              </div>

              <div className="holdings-right">
                <div className="holdings-stock-price">
                  ${stock.currentPrice.toFixed(2)}
                </div>

                <div className="watchlist-change-group">
                  <div className={`stock-change ${stock.change >= 0 ? "positive" : "negative"}`}>
                    {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}
                  </div>
                  <div className={`stock-change-percent ${stock.change >= 0 ? "positive" : "negative"}`}>
                    {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {watchlist.length === 0 && (
        <div className="watchlist-empty">No stocks in watchlist</div>
      )}
    </div>
  );
}