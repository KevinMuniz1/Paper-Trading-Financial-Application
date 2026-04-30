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
  dailyPriceChange?: number;
  dailyPercentChange?: number;
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

export default function HoldingsBar() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const userId = user?.userId;
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchHoldings() {
    if (loading || !userId) return;
    try {
      const res = await fetch(buildPath("/portfolio/summary"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!data?.holdings) return;

      const enriched = await Promise.all(
        data.holdings.map(async (h: any) => {
          const dc = await fetchDailyChange(h.symbol);
          return {
            id: h.id || h._id || h.symbol,
            symbol: h.symbol,
            currentPrice: h.currentPrice,
            currentValue: h.currentValue,
            quantity: h.quantity,
            gain: h.gain,
            gainPercent: h.gainPercent,
            dailyPriceChange: dc?.priceChange ?? 0,
            dailyPercentChange: dc?.percentChange ?? 0,
          };
        })
      );
      setHoldings(enriched);
    } catch { /* ignore */ }
  }

  useEffect(() => {
    if (loading || !userId) return;
    fetchHoldings();
    intervalRef.current = setInterval(fetchHoldings, 10_000);
    const handler = () => fetchHoldings();
    window.addEventListener("refreshHoldings", handler);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      window.removeEventListener("refreshHoldings", handler);
    };
  }, [userId, loading]);

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <p className="panel-title">Holdings</p>
      {loading ? (
        <div className="panel-empty">Loading…</div>
      ) : holdings.length === 0 ? (
        <div className="panel-empty">No positions yet</div>
      ) : (
        <div className="holdings-list">
          {holdings.map(h => {
            const up = (h.dailyPercentChange ?? 0) >= 0;
            return (
              <div key={h.id} className="holdings-row" onClick={() => navigate(`/stock/${h.symbol}`)}>
                <div className="row-left">
                  <span className="row-symbol">{h.symbol}</span>
                  <span className="row-sub">{h.quantity} {h.quantity === 1 ? 'share' : 'shares'}</span>
                </div>
                <div className="row-right">
                  <span className="row-price num">${fmt(h.currentPrice)}</span>
                  <span className={`row-change ${up ? 'up' : 'down'}`}>
                    {up ? '+' : ''}{(h.dailyPercentChange ?? 0).toFixed(2)}%
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
