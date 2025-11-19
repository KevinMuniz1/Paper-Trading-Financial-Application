// TradeStockCard.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { buildPath } from '../../Path';
import "./DashboardPage.css";

interface TradeStockCardProps {
  onClose: () => void;
  onTradeSuccess: () => void;   // ← NEW: notify parent page
  stockSymbol: string;
  stockName: string;
  currentPrice: number;
}

function TradeStockCard({ onClose, onTradeSuccess, stockSymbol, stockName, currentPrice }: TradeStockCardProps) {
  const [shares, setShares] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  const { user } = useAuth();
  const userId = user?.userId || 0;
  const quantity = parseInt(shares);
  const totalAmount = shares ? quantity * currentPrice : 0;

  // ---------------------------
  // BUY STOCK → /addstock
  // ---------------------------
  async function buyStock() {
    try {

      //const parsedUserId = parseInt(userId);
      console.log("=== BUY STOCK DEBUG ===");
      console.log("Raw userId from localStorage:", userId);
      console.log("Parsed userId:", userId);
      console.log("Request payload:", {
        userId: userId,
        cardName: stockName,
        tickerSymbol: stockSymbol,
        quantity: quantity
      });

      const res = await fetch(buildPath("/addstock"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          //userId: parseInt(userId),
          userId: userId,
          cardName: stockName,
          tickerSymbol: stockSymbol,
          quantity: quantity
        })
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      alert(data.message || `Successfully purchased ${quantity} shares of ${stockSymbol}`);
      onTradeSuccess();  // refresh holdings + account value
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to execute trade.");
    }
  }

  // ---------------------------
  // SELL STOCK → /sell
  // ---------------------------
  async function sellStock() {
    try {
      // Find tradeId for this symbol
      const findRes = await fetch(buildPath("/searchstocks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, search: stockSymbol })
      });

      const findData = await findRes.json();
      const holding = findData.results?.find((t: any) => t.symbol === stockSymbol);

      if (!holding) {
        alert(`You do not own any shares of ${stockSymbol}.`);
        return;
      }

      const tradeId = holding.id;

      const res = await fetch(buildPath("/sell"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          tradeId,
          quantity
        })
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        return;
      }

      alert(data.message || `Successfully sold ${quantity} shares of ${stockSymbol}`);
      onTradeSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Sell failed.");
    }
  }

  // ---------------------------
  // MAIN HANDLER
  // ---------------------------
  const handleTrade = () => {
    if (!shares || quantity <= 0){
      alert("Please enter a valid number of shares.");
      return;
    }

    if (tradeType === "buy") {
      buyStock();
    } else {
      sellStock();
    }
  };

  return (
    <div className="trade-card">
      <h2 className="trade-title">Trade {stockSymbol}</h2>

      {/* Stock Info */}
      <div className="stock-info-display">
        <div className="stock-name">{stockName}</div>
        <div className="stock-price">
          ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Buy/Sell Toggle */}
      <div className="trade-type-section">
        <button
          className={`trade-type-button ${tradeType === 'buy' ? 'active-buy' : ''}`}
          onClick={() => setTradeType('buy')}
        >
          Buy
        </button>
        <button
          className={`trade-type-button ${tradeType === 'sell' ? 'active-sell' : ''}`}
          onClick={() => setTradeType('sell')}
        >
          Sell
        </button>
      </div>

      {/* Shares Input */}
      <div className="input-section">
        <label className="input-label">Number of Shares</label>
        <input
          type="number"
          value={shares}
          onChange={(e) => setShares(e.target.value)}
          placeholder="0"
          className="shares-input"
          min="0"
          step="1"
        />
      </div>

      {/* Total Amount Display */}
      <div className={`total-display ${tradeType === 'buy' ? 'total-buy' : 'total-sell'}`}>
        <div className="total-label">
          {tradeType === 'buy' ? 'Total Cost' : 'Total Gain'}
        </div>
        <div className="total-amount">
          {tradeType === 'buy' ? '-' : '+'}${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="button-row">
        <button onClick={onClose} className="cancel-button">
          Cancel
        </button>
        <button 
          onClick={handleTrade} 
          className={`trade-button ${tradeType === 'buy' ? 'buy-button' : 'sell-button'}`}
          disabled={!shares || quantity <= 0}
        >
          {tradeType === 'buy' ? 'Buy' : 'Sell'}
        </button>
      </div>
    </div>
  );
}

export default TradeStockCard;
