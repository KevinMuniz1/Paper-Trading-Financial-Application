import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { buildPath } from '../../Path';
import { useAuth } from './AuthContext';

interface PortfolioContextType {
  buyingPower: number;
  totalPortfolioValue: number;
  totalInvested: number;
  totalGain: number;
  totalGainPercent: number;
  setBuyingPower: (value: number) => void;
  fetchPortfolioData: () => Promise<void>;
  loading: boolean;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth(); // Get user and token from AuthContext
  const [buyingPower, setBuyingPower] = useState(0);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [totalGainPercent, setTotalGainPercent] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchPortfolioData = async () => {
    if (!user || !token) {
      console.error('User not authenticated');
      return;
    }

    try {
      setLoading(true);

      // Fetch buying power
      const buyingPowerRes = await fetch(buildPath("/portfolio/buying-power"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      const buyingPowerData = await buyingPowerRes.json();

      // Fetch portfolio summary
      const summaryRes = await fetch(buildPath("/portfolio/summary"), {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({})
      });
      const summaryData = await summaryRes.json();

      // Update state
      if (!buyingPowerData.error) {
        setBuyingPower(buyingPowerData.buyingPower || 0);
      }

      if (!summaryData.error && summaryData.portfolio) {
        setTotalPortfolioValue(summaryData.portfolio.totalPortfolioValue || 0);
        setTotalInvested(summaryData.portfolio.totalInvested || 0);
        setTotalGain(summaryData.portfolio.totalGain || 0);
        setTotalGainPercent(summaryData.portfolio.totalGainPercent || 0);
      }

    } catch (error) {
      console.error("Error fetching portfolio data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPortfolioData();
    }
  }, [user]);

  return (
    <PortfolioContext.Provider value={{ 
      buyingPower,
      totalPortfolioValue,
      totalInvested,
      totalGain,
      totalGainPercent,
      setBuyingPower,
      fetchPortfolioData,
      loading
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
}