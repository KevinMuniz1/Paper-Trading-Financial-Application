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
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionType, setTransactionType] = useState<'add' | 'withdraw'>('add');
  const { buyingPower, fetchPortfolioData } = usePortfolio();
  const { user } = useAuth();

  const handleAdd = async () => {
    if (!user?.userId) {
      console.error('User not found');
      return;
    }

    const amount = parseFloat(amountToAdd);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid amount greater than 0');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    // Use negative amount for withdrawal
    const finalAmount = transactionType === 'withdraw' ? -amount : amount;

    try {
      const response = await fetch(buildPath('portfolio/add-funds'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.userId,
          amount: finalAmount
        })
      });

      const data = await response.json();

      if (data.success) {
        const action = transactionType === 'add' ? 'Added' : 'Withdrew';
        setSuccessMessage(`${action} $${amount.toFixed(2)} ${transactionType === 'add' ? 'to' : 'from'} your account`);
        await fetchPortfolioData(); // Refresh portfolio to show updated balance
        setTimeout(() => onClose(), 1500);  // close after showing message briefly
      } else {
        setErrorMessage(data.error || 'Failed to process transaction');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      setErrorMessage('Failed to process transaction. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <div className="buying-power-card">
      {successMessage && (
        <div style={{
          backgroundColor: '#10b981',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '12px',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          ✓ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div style={{
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '12px',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          ✕ {errorMessage}
        </div>
      )}
      <h2 className="card-title">Add Buying Power</h2>

      <div className="current-power-display">
        <div className="power-label">Current Buying Power</div>
        <div className="power-amount">
          ${buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* Add/Withdraw Toggle */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setTransactionType('add')}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: transactionType === 'add' ? '#007AFF' : '#e5e5e5',
            color: transactionType === 'add' ? 'white' : '#333',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Add
        </button>
        <button
          onClick={() => setTransactionType('withdraw')}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: transactionType === 'withdraw' ? '#FF9500' : '#e5e5e5',
            color: transactionType === 'withdraw' ? 'white' : '#333',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          Withdraw
        </button>
      </div>

      <div className="input-section">
        <label className="input-label">Amount to {transactionType === 'add' ? 'Add' : 'Withdraw'}</label>
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
          {transactionType === 'add' ? 'Add' : 'Withdraw'}
        </button>
      </div>
    </div>
  );
}

export default BuyingPowerCard;