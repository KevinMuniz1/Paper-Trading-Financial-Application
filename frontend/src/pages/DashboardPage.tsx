import { useState } from 'react';
import PageTitle from '../components/PageTitle';
import NavBar from '../components/NavBar';
import HoldingsBar from '../components/HoldingsBar';
import WatchlistSection from '../components/WatchlistSection';
import '../components/DashboardPage.css';
import '../components/NavBar.css';
import PortfolioChartAdvanced from '../components/portfolioChart';
import BuyingPowerButton from '../components/buyingPowerButton';
import BuyingPowerCard from '../components/CardAddBuyingPower';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const { user } = useAuth();
  
  // Get userId from AuthContext (note: property is 'userId' not 'id')
  const userId = user?.userId;

  function toggleBuyingPowerCard() {
    setIsCardVisible(!isCardVisible);
  }

  return (
    <div className="layout-wrapper">  
      <div className='logo-navigation-combo'>
        <PageTitle />
        <NavBar/>
      </div>
      
      <main className="main-section">
        {isCardVisible && (
          <div className="modal-overlay" onClick={() => setIsCardVisible(false)}>
            <div className="buyingPowerDiv" onClick={(e) => e.stopPropagation()}>
              <BuyingPowerCard onClose={() => setIsCardVisible(false)} />
            </div>
          </div>
        )}
        
        <div className="left-panel">
          
          {/* Portfolio Chart - displays historical portfolio performance */}
          {userId ? (
            <PortfolioChartAdvanced userId={userId} />
          ) : (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#666' 
            }}>
              Please log in to view your portfolio
            </div>
          )}
          
          <div onClick={toggleBuyingPowerCard} className="button-container">
            <BuyingPowerButton />
          </div>
        </div>
        
        <div className="right-panel">
          <div className="holdings-box">
            <HoldingsBar />
          </div>
          <div className="watchlist-box">
            <WatchlistSection />
          </div>
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;