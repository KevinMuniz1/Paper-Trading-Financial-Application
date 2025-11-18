import { useState } from 'react';
import PageTitle from '../components/PageTitle';
import NavBar from '../components/NavBar';
import WatchListBar from '../components/watchListBar';
import '../components/DashboardPage.css';
import '../components/NavBar.css';
import StockChart from '../components/stockChart';
import BuyingPowerButton from '../components/buyingPowerButton';
import AccountValue from '../components/totalAccountValue';
import BuyingPowerCard from '../components/CardAddBuyingPower';
import { buildPath } from '../../Path';
import { useParams } from 'react-router-dom';
const DashboardPage = () => {
  const [isCardVisible, setIsCardVisible] = useState(false);
  const { symbol } = useParams();
  

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
          <div>
            <AccountValue />
          </div>
          <StockChart symbol={symbol || ""} />
          <div onClick={toggleBuyingPowerCard} className="button-container">
            <BuyingPowerButton />
          </div>
        </div>
        <div className="right-panel">
          <WatchListBar />
        </div>
      </main>
    </div>
  );
}

export default DashboardPage;