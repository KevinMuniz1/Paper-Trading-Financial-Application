import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { buildPath } from "../../Path";
import "./NavBar.css";

interface WatchlistItem {
  symbol: string;
  name: string;
  currentPrice: number;
  dailyPriceChange: number;
  dailyPercentChange: number;
}

async function fetchDailyChange(symbol: string) {
  try {
    const res = await fetch(buildPath("stock/daily-change"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    });
    const data = await res.json();
    if (data.error) return null;
    return { priceChange: data.priceChange, percentChange: data.percentChange, currentPrice: data.currentPrice };
  } catch { return null; }
}

export default function WatchlistSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.userId;
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchWatchlist() {
    if (!userId) return;
    try {
      const res = await fetch(buildPath("watchlist"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!data?.watchlist) return;

      const enriched = await Promise.all(
        data.watchlist.map(async (item: any) => {
          const dc = await fetchDailyChange(item.symbol);
          return {
            symbol: item.symbol,
            name: item.name,
            currentPrice: dc?.currentPrice ?? item.currentPrice ?? 0,
            dailyPriceChange: dc?.priceChange ?? 0,
            dailyPercentChange: dc?.percentChange ?? 0,
          };
        })
      );
      setWatchlist(enriched);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    fetchWatchlist();
    intervalRef.current = setInterval(fetchWatchlist, 15_000);
    const handler = () => fetchWatchlist();
    window.addEventListener("refreshWatchlist", handler);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("refreshWatchlist", handler);
    };
  }, [userId]);

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <p className="panel-title">Watchlist</p>
      {watchlist.length === 0 ? (
        <div className="panel-empty">No stocks added yet</div>
      ) : (
        <div className="watchlist-list">
          {watchlist.map(s => {
            const up = s.dailyPercentChange >= 0;
            return (
              <div key={s.symbol} className="watchlist-row" onClick={() => navigate(`/stock/${s.symbol}`)}>
                <div className="row-left">
                  <span className="row-symbol">{s.symbol}</span>
                  <span className="row-sub">{s.name}</span>
                </div>
                <div className="row-right">
                  <span className="row-price num">${fmt(s.currentPrice)}</span>
                  <span className={`row-change ${up ? 'up' : 'down'}`}>
                    {up ? '+' : ''}{s.dailyPercentChange.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
