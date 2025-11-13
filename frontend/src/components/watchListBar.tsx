import { useState } from "react";

interface Stock {
  id: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function WatchListBar() {
  // Sample data - replace with your API/database data later
  const [watchlist, setWatchlist] = useState<Stock[]>([
    { id: "1", symbol: "AAPL", price: 185.32, change: 2.45, changePercent: 1.34 },
    { id: "2", symbol: "TSLA", price: 243.55, change: -5.23, changePercent: -2.10 },
    { id: "3", symbol: "NVDA", price: 501.76, change: 12.89, changePercent: 2.64 },
    { id: "4", symbol: "MSFT", price: 378.91, change: -1.34, changePercent: -0.35 },
    { id: "5", symbol: "GOOGL", price: 142.68, change: 0.89, changePercent: 0.63 },
  ]);

  const handleRemove = (id: string) => {
    setWatchlist(watchlist.filter(stock => stock.id !== id));
  };

  const handleStockClick = (symbol: string) => {
    console.log(`Clicked on ${symbol}`);
    // Add your logic here to update the main chart
  };

  return (
    <div style={{
      width: "100%",
      height: "100%",
      padding: "24px",
      overflowY: "scroll",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      <h2 style={{
        fontSize: "24px",
        fontWeight: "600",
        marginBottom: "24px",
        color: "#000000ff"
      }}>
        Holdings 
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {watchlist.map((stock) => (
          <div
            key={stock.id}
            onClick={() => handleStockClick(stock.symbol)}
            style={{
              backgroundColor: "#252547ff",
              borderRadius: "8px",
              padding: "16px",
              cursor: "pointer",
              transition: "background-color 0.2s",
              position: "relative"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#545cabff"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#252547ff"}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{
                  fontSize: "18px",
                  fontWeight: "600",
                  color: "#ffffff",
                  marginBottom: "4px"
                }}>
                  {stock.symbol}
                </div>
                <div style={{
                  fontSize: "20px",
                  fontWeight: "500",
                  color: "#ffffff"
                }}>
                  ${stock.price.toFixed(2)}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: stock.change >= 0 ? "#00C853" : "#FF3B30"
                }}>
                  {stock.change >= 0 ? "+" : ""}{stock.change.toFixed(2)}
                </div>
                <div style={{
                  fontSize: "14px",
                  fontWeight: "500",
                  color: stock.change >= 0 ? "#00C853" : "#FF3B30"
                }}>
                  {stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(stock.id);
              }}
              style={{
                position: "absolute",
                top: "8px",
                right: "8px",
                background: "none",
                border: "none",
                color: "#666",
                fontSize: "18px",
                cursor: "pointer",
                padding: "4px 8px",
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ff3b30"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#666"}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {watchlist.length === 0 && (
        <div style={{
          textAlign: "center",
          color: "#666",
          marginTop: "40px",
          fontSize: "16px"
        }}>
          No stocks in your watchlist
        </div>
      )}
    </div>
  );
}