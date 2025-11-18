import PageTitle from '../components/PageTitle';
import NavBar from '../components/NavBar';
import WatchListBar from '../components/watchListBar';
import '../components/DashboardPage.css';
import '../components/NavBar.css';
import StockChart from '../components/stockChart';
import BuyingPowerComponent from '../components/buyingPowerButton';
import AccountValue from '../components/totalAccountValue';
import { useEffect, useState } from "react";
import { buildPath } from '../../Path';
import TradeStockCard from '../components/buyAndSellCard';

const DisplayStockPage = () => {
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTradeModalVisible, setIsTradeModalVisible] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    fetchOverview("AAPL");
  }, []);

  const fetchOverview = async (symbol: string) => {
    try {
      setLoading(true);
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

  const toggleWatchlist = () => {
    setIsInWatchlist(!isInWatchlist);
    console.log(isInWatchlist ? 'Removed from watchlist' : 'Added to watchlist');
    // Add your actual watchlist logic here
  };

  return (
    <div className="layout-wrapper">  
      <div className='logo-navigation-combo'>
        <PageTitle />
        <NavBar/>
      </div>
      <main className="main-section">
        {/* Trade Modal */}
        {isTradeModalVisible && (
          <div className="modal-overlay" onClick={() => setIsTradeModalVisible(false)}>
            <div className="buyingPowerDiv" onClick={(e) => e.stopPropagation()}>
              <TradeStockCard 
                onClose={() => setIsTradeModalVisible(false)}
                stockSymbol={overview?.Symbol || "AAPL"}
                stockName={overview?.Name || "Apple Inc"}
                currentPrice={150.00}
              />
            </div>
          </div>
        )}

        <div className="left-panel">
          <div>
            <AccountValue />
          </div>
          <StockChart />
          
          {/* Action Buttons */}
          <div className="button-container" style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => {
                console.log("Trade button clicked!");
                console.log("overview:", overview);
                setIsTradeModalVisible(true);
              }}
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
                border: `2px solid ${isInWatchlist ? '#f59e0b' : '#667eea'}`,
                borderRadius: '8px',
                background: isInWatchlist ? '#fffbeb' : 'white',
                color: isInWatchlist ? '#f59e0b' : '#667eea',
                cursor: 'pointer',
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

          <div className="stock-text-box">
            {loading && <span>Loading...</span>}
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