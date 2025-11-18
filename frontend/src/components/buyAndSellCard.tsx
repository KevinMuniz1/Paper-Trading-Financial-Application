// TradeStockCard.tsx
import { useState } from 'react';
import "./DashboardPage.css";

interface TradeStockCardProps {
  onClose: () => void;
  stockSymbol: string;
  stockName: string;
  currentPrice: number;
}

function TradeStockCard({ onClose, stockSymbol, stockName, currentPrice }: TradeStockCardProps) {
  const [shares, setShares] = useState('');
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');

  const totalAmount = shares ? parseFloat(shares) * currentPrice : 0;

  const handleTrade = () => {
    console.log(`${tradeType}ing ${shares} shares of ${stockSymbol} for $${totalAmount.toFixed(2)}`);
    // Add your trade logic here
    onClose();
  };

  const handleCancel = () => {
    onClose();
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
        <button onClick={handleCancel} className="cancel-button">
          Cancel
        </button>
        <button 
          onClick={handleTrade} 
          className={`trade-button ${tradeType === 'buy' ? 'buy-button' : 'sell-button'}`}
          disabled={!shares || parseFloat(shares) <= 0}
        >
          {tradeType === 'buy' ? 'Buy' : 'Sell'}
        </button>
      </div>
    </div>
  );
}

export default TradeStockCard;