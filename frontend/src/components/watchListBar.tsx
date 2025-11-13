import { useState } from "react";
import "./NavBar.css";

interface Stock {
  id: string;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function WatchListBar() {
  const [watchlist, setWatchlist] = useState<Stock[]>([
    { id: "1", symbol: "AAPL", price: 185.32, change: 2.45, changePercent: 1.34 },
    { id: "2", symbol: "TSLA", price: 243.55, change: -5.23, changePercent: -2.10 },
    { id: "3", symbol: "NVDA", price: 501.76, change: 12.89, changePercent: 2.64 },
    { id: "4", symbol: "MSFT", price: 378.91, change: -1.34, changePercent: -0.35 },
    { id: "5", symbol: "GOOGL", price: 142.68, change: 0.89, changePercent: 0.63 },
  ]);

  const handleRemove = (id: string) => {
    setWatchlist(watchlist.filter((stock) => stock.id !== id));
  };

  const handleStockClick = (symbol: string) => {
    console.log(`Clicked on ${symbol}`);
  };

  return (
    <div className="watchlist-container">
      <h2 className="watchlist-title">Holdings</h2>

      <div className="watchlist-list">
        {watchlist.map((stock) => (
          <div
            key={stock.id}
            className="watchlist-item"
            onClick={() => handleStockClick(stock.symbol)}
          >
            <div className="watchlist-item-info">
              <div>
                <div className="stock-symbol">{stock.symbol}</div>
                <div className="stock-price">${stock.price.toFixed(2)}</div>
              </div>

              <div className="watchlist-change-group">
                <div
                  className={`stock-change ${
                    stock.change >= 0 ? "positive" : "negative"
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change.toFixed(2)}
                </div>
                <div
                  className={`stock-change ${
                    stock.change >= 0 ? "positive" : "negative"
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>

            <button
              className="remove-button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(stock.id);
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {watchlist.length === 0 && (
        <div className="watchlist-empty">No stocks in your watchlist</div>
      )}
    </div>
  );
}
