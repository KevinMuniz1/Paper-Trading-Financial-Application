import PageTitle from '../components/PageTitle';
import NavBar from '../components/NavBar';
import WatchListBar from '../components/watchListBar';
import '../components/DashboardPage.css';
import '../components/NavBar.css';
import StockChart from '../components/stockChart';
import BuyingPowerComponent from '../components/buyingPower';
import AccountValue from '../components/totalAccountValue';


const DashboardPage = () => {
    return (
            <div className="layout-wrapper">  
                    <div className='logo-navigation-combo'>
                  <PageTitle />
                  <NavBar/>
                  </div>
                  <main className="main-section">
                    <div className="left-panel">
                      <div>
                         <AccountValue />
                      </div>
                     
                      <StockChart />

                      <div className="button-container">
                      <BuyingPowerComponent />
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