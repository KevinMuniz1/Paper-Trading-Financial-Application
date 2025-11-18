

import { usePortfolio } from '../../context/PortfolioContext';
import "./DashboardPage.css";

function AccountValue(){

    const { totalPortfolioValue, totalGain, totalGainPercent } = usePortfolio();

    return(
    <div className="portfolio-summary">
    <div className="portfolio-value"> ${totalPortfolioValue}</div>
    <div className="portfolio-change positive">+324.12 (+1.35%)</div>
    </div>

    );
};

export default AccountValue