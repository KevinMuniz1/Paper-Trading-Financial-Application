import { useState } from 'react';
import "./DashboardPage.css";
import { usePortfolio } from '../context/PortfolioContext';
import { useAuth } from '../context/AuthContext';
import { buildPath } from '../../Path';

interface BuyingPowerCardProps {
  onClose: () => void;
}

function BuyingPowerCard({ onClose }: BuyingPowerCardProps) {
  const [amountToAdd, setAmountToAdd] = useState('');
  const { buyingPower, fetchPortfolioData } = usePortfolio();
  const { user } = useAuth();

  const handleAdd = async () => {
    if (!user?.userId) {
      alert('User not found');
      return;
    }

    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    try {
      const response = await fetch(buildPath('portfolio/add-funds'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          amount: amount
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message || `Successfully added $${amount.toFixed(2)} to your account`);
        await fetchPortfolioData(); // Refresh portfolio to show updated balance
        onClose();
      } else {
        alert(data.error || 'Failed to add buying power');
      }
    } catch (error) {
      console.error('Error adding buying power:', error);
      alert('Failed to add buying power');
    }
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