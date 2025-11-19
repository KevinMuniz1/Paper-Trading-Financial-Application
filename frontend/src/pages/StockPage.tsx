import PageTitle from '../components/PageTitle';
import NavBar from '../components/NavBar';
import WatchListBar from '../components/watchListBar';
import '../components/DashboardPage.css';
import '../components/NavBar.css';
import StockChart from '../components/stockChart';
import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { buildPath } from '../../Path';
import TradeStockCard from '../components/buyAndSellCard';
import { useAuth } from '../context/AuthContext';

const DisplayStockPage = () => {
  const { symbol } = useParams();
  const { token } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTradeModalVisible, setIsTradeModalVisible] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  // -----------------------------
  // REFRESH UI AFTER BUY/SELL
  // -----------------------------
  function refreshAfterTrade() {
    setIsTradeModalVisible(false);

    // Trigger refresh for holdings bar
    window.dispatchEvent(new Event("refreshHoldings"));

    // Trigger refresh for total portfolio value
    window.dispatchEvent(new Event("refreshAccountValue"));

    console.log("Trade completed → refreshing UI...");
  }

  // -----------------------------
  // LOAD STOCK OVERVIEW
  // -----------------------------
  useEffect(() => {
    if (symbol) {
      fetchOverview(symbol.toUpperCase());
      checkWatchlistStatus(symbol.toUpperCase());
    }
  }, [symbol, token]);

  const fetchOverview = async (symbol: string) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(buildPath(`overview/${symbol}`), {
        method: "GET",
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setOverview(data.overview);
      }

    } catch (err) {
      console.error("Overview fetch error:", err);
      setError("Failed to load stock information.");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // CHECK WATCHLIST STATUS
  // -----------------------------
  const checkWatchlistStatus = async (symbol: string) => {
    if (!token) return;

    try {
      const response = await fetch(buildPath('watchlist/check'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ symbol })
      });

      const data = await response.json();
      setIsInWatchlist(data.isInWatchlist);
    } catch (err) {
      console.error('Error checking watchlist status:', err);
    }
  };

  // -----------------------------
  // WATCHLIST TOGGLE
  // -----------------------------
  const toggleWatchlist = async () => {
    if (!token || !symbol) return;

    try {
      if (isInWatchlist) {
        // Remove from watchlist
        const response = await fetch(buildPath('watchlist/delete'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ symbol: symbol.toUpperCase() })
        });

        const data = await response.json();
        if (data.success) {
          setIsInWatchlist(false);
          window.dispatchEvent(new Event('refreshWatchlist'));
          console.log('Removed from watchlist');
        } else {
          alert(data.error || 'Failed to remove from watchlist');
        }
      } else {
        // Add to watchlist
        const response = await fetch(buildPath('watchlist/add'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ symbol: symbol.toUpperCase() })
        });

        const data = await response.json();
        if (data.success) {
          setIsInWatchlist(true);
          window.dispatchEvent(new Event('refreshWatchlist'));
          console.log('Added to watchlist');
        } else {
          alert(data.error || 'Failed to add to watchlist');
        }
      }
    } catch (err) {
      console.error('Error toggling watchlist:', err);
      alert('Failed to update watchlist');
    }
  };

  if (!symbol) {
    return (
      <div className="layout-wrapper">
        <div className='logo-navigation-combo'>
          <PageTitle />
          <NavBar/>
        </div>
        <main className="main-section">
          <div className="left-panel">
            <p>No stock symbol provided. Please select a stock.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="layout-wrapper">  
      {/* Header */}
      <div className='logo-navigation-combo'>
        <NavBar/>
      </div>

      <main className="main-section">

        {/* ----------------------------
            TRADE MODAL
        ----------------------------- */}
        {isTradeModalVisible && (
          <div className="modal-overlay" onClick={() => setIsTradeModalVisible(false)}>
            <div className="buyingPowerDiv" onClick={(e) => e.stopPropagation()}>
              <TradeStockCard
                onClose={() => setIsTradeModalVisible(false)}
                onTradeSuccess={refreshAfterTrade}       // ← NEW
                stockSymbol={overview?.Symbol || symbol}
                stockName={overview?.Name || symbol}
                currentPrice={150.00}
              />
            </div>
          </div>
        )}

        {/* ----------------------------
            MAIN LEFT PANEL
        ----------------------------- */}
        <div className="left-panel">

          <StockChart symbol={symbol || ""} />

          {/* ---- Buttons ---- */}
          <div className="stock-action-buttons">
            <button 
              onClick={() => setIsTradeModalVisible(true)}
              style={{
                flex: 1,
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s'
              }}
            >
              Trade
            </button>

            <button 
              onClick={toggleWatchlist}
              style={{
                flex: 1,
                padding: '0.875rem',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                borderRadius: '8px',
                background: isInWatchlist ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: isInWatchlist ? '0 4px 12px rgba(245, 158, 11, 0.3)' : '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>
                {isInWatchlist ? '⭐' : '☆'}
              </span>
              {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
          </div>

          {/* Stock Text */}
          <div className="stock-text-box">
            {loading && <span>Loading {symbol}...</span>}
            {error && <span style={{ color: "red" }}>{error}</span>}
            {overview && (
              <>
                <h3>
                  {overview.Name} ({overview.Symbol})
                </h3>
                <p>{overview.Description}</p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default DisplayStockPage;
