import PageTitle from '../components/PageTitle';
import NavBar from '../components/NavBar';
import WatchListBar from '../components/watchListBar';
import '../components/DashboardPage.css';
import '../components/NavBar.css';
import StockChart from '../components/stockChart';




const DashboardPage = () => {
    return (
            <div className="layout-wrapper">  
                    <div className='logo-navigation-combo'>
                  <PageTitle />
                  <NavBar/>
                  </div>
                  <main className="main-section">
                    <div className="left-panel">
                      <StockChart />
                    </div>
                    <div className="right-panel">
                      <WatchListBar />
                    </div>
                  </main>
                </div>
              );
}
export default DashboardPage;