import PageTitle from '../components/PageTitle';
import NavBar from '../components/NavBar';
import WatchListBar from '../components/watchListBar';
import '../components/DashboardPage.css';
import '../components/NavBar.css';
import StockChart from '../components/stockChart';
import BuyingPowerComponent from '../components/buyingPower';
import AccountValue from '../components/totalAccountValue';
import { useEffect, useState } from "react";
import { buildPath } from '../../Path';


const DisplayStockPage = () => {

 const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOverview("APPL"); // make dynamic later
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