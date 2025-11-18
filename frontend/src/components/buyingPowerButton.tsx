import "./DashboardPage.css";
import { useState, useEffect } from "react";
import { buildPath } from "../../Path";
import { usePortfolio } from '../context/PortfolioContext';

function BuyingPowerButton() {
  const { buyingPower, totalPortfolioValue, totalInvested} = usePortfolio();

  return (
    <div>
      <button className="outlined-btn">
        Buying Power: ${buyingPower.toFixed(2)} &gt;
      </button>
    </div>
  );
}

export default BuyingPowerButton;