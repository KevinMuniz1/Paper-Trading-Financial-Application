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

interface DailyChange {
  symbol: string;
  priceChange: number;
  percentChange: number;
  currentPrice: number;
  previousClose: number;
}

async function fetchDailyStockChange(symbol: string): Promise<DailyChange | null> {
  try {
    
    // Call YOUR backend instead of Yahoo Finance directly
    const response = await fetch(buildPath("stock/daily-change"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol })
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.error) {
      return null;
    }
    
    
    return {
      symbol: data.symbol,
      priceChange: data.priceChange,
      percentChange: data.percentChange,
      currentPrice: data.currentPrice,
      previousClose: data.previousClose
    };
  } catch (error) {
    return null;
  }
}

export default function HoldingsBar() {
  
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const userId = user?.userId;
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  console.log(" HoldingsBar render - loading:", loading, "userId:", userId, "user:", user);

  async function fetchHoldings() {
    
    if (loading) {
      console.log("Skipping fetch - auth still loading");
      return;
    }
    
    if (!userId) {
      return;
    }

    console.log(" Starting to fetch holdings for userId:", userId);

    try {
      const res = await fetch(buildPath("/portfolio/summary"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();

      if (data && data.holdings) {
        console.log(` Processing ${data.holdings.length} holdings...`);
        
        // Fetch daily changes for each holding
        const holdingsWithDailyChange = await Promise.all(
          data.holdings.map(async (h: any) => {
            const dailyChange = await fetchDailyStockChange(h.symbol);
            
            const holding = {
              id: h.id || h._id || h.symbol,
              symbol: h.symbol,
              currentPrice: h.currentPrice,
              currentValue: h.currentValue,
              quantity: h.quantity,
              gain: h.gain,
              gainPercent: h.gainPercent,
              dailyPriceChange: dailyChange?.priceChange || 0,
              dailyPercentChange: dailyChange?.percentChange || 0
            };
            
            return holding;
          })
        );

        setHoldings(holdingsWithDailyChange);
      } else {
      }
    } catch (err) {
    }
  }

  useEffect(() => {
    
    if (loading) {
      return;
    }

    if (!userId) {
      return;
    }

    fetchHoldings();

    intervalRef.current = setInterval(() => {
      fetchHoldings();
    }, 5000);

    const handler = () => {
      fetchHoldings();
    };
    window.addEventListener("refreshHoldings", handler);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      window.removeEventListener("refreshHoldings", handler);
    };
  }, [userId, loading]);


  if (loading) {
    return (
      <div className="watchlist-container">
        <h2 className="watchlist-title">Holdings</h2>
        <div className="watchlist-empty">Loading...</div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="watchlist-container">
        <h2 className="watchlist-title">Holdings</h2>
        <div className="watchlist-empty">Please log in to view holdings</div>
      </div>
    );
  }


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
                  <div className={`stock-change ${(stock.dailyPriceChange ?? 0) >= 0 ? "positive" : "negative"}`}>
                    {(stock.dailyPriceChange ?? 0) >= 0 ? "+$" : "$"}
                    {stock.dailyPriceChange?.toFixed(2) || "0.00"}
                  </div>
                  <div className={`stock-change-percent ${(stock.dailyPercentChange ?? 0) >= 0 ? "positive" : "negative"}`}>
                    {(stock.dailyPercentChange ?? 0) >= 0 ? "+" : ""}
                    {stock.dailyPercentChange?.toFixed(2) || "0.00"}%
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