import { useState } from 'react';
import "./DashboardPage.css";
import { usePortfolio } from '../context/PortfolioContext';

interface BuyingPowerCardProps {
  onClose: () => void;
}

function BuyingPowerCard({ onClose }: BuyingPowerCardProps) {
  const [amountToAdd, setAmountToAdd] = useState('');
  const { buyingPower, totalPortfolioValue, totalInvested} = usePortfolio();

  const handleAdd = () => {
    console.log('Adding:', amountToAdd);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="buying-power-card">
      <h2 className="card-title">Add Buying Power</h2>

      <div className="current-power-display">
        <div className="power-label">Current Buying Power</div>
        <div className="power-amount">
          ${buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      <div className="input-section">
        <label className="input-label">Amount to Add</label>
        <div className="input-wrapper">
          <span className="dollar-sign">$</span>
          <input
            type="number"
            value={amountToAdd}
            onChange={(e) => setAmountToAdd(e.target.value)}
            placeholder="0.00"
            className="amount-input"
          />
        </div>
      </div>

      <div className="button-row">
        <button onClick={handleCancel} className="cancel-button">
          Cancel
        </button>
        <button onClick={handleAdd} className="add-button">
          Add
        </button>
      </div>
    </div>
  );
}

export default BuyingPowerCard;