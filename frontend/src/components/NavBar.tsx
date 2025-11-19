import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";
import PageTitle from "./PageTitle";
import { buildPath } from "../../Path";
import { useAuth } from "../context/AuthContext";

interface Holding {
  symbol: string;
  quantity: number;
  price: number;
  currentPrice: number;
  costBasis: number;
  gainPercent?: number;
  gain?: number;
}

const NavBar = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Fetch portfolio holdings on component mount or when user changes
  useEffect(() => {
    if (!loading && user?.userId) {
      fetchPortfolioNotifications();
      const interval = setInterval(fetchPortfolioNotifications, 5 * 60 * 1000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    } else if (!loading && !user) {
      setNotifications(["Please login to see portfolio notifications"]);
    }
  }, [user, loading]);

  const fetchPortfolioNotifications = async () => {
    try {
      if (!user?.userId) {
        setNotifications(["Please login to see portfolio notifications"]);
        return;
      }

      console.log('Fetching portfolio for userId:', user.userId);

      const response = await fetch(buildPath('portfolio/summary'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId })
      });

      const data = await response.json();
      console.log('Portfolio data:', data);

      if (data.holdings && data.holdings.length > 0) {
        const notifs: string[] = [];

        // Fetch daily changes for each holding
        const dailyChanges: { [key: string]: number } = {};
        
        for (const holding of data.holdings.slice(0, 5)) {
          try {
            const changeResponse = await fetch(buildPath('stock/daily-change'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ symbol: holding.symbol })
            });
            const changeData = await changeResponse.json();
            dailyChanges[holding.symbol] = changeData.percentChange || 0;
            console.log(`${holding.symbol} daily change: ${changeData.percentChange}%`);
          } catch (err) {
            console.error(`Error fetching daily change for ${holding.symbol}:`, err);
            dailyChanges[holding.symbol] = 0;
          }
        }

        // Show holdings with their daily changes
        data.holdings.slice(0, 5).forEach((holding: Holding) => {
          // Use daily change instead of overall gain percent
          const dailyChangePercent = dailyChanges[holding.symbol] || 0;
          const emoji = dailyChangePercent >= 0 ? '📈' : '📉';
          const sign = dailyChangePercent > 0 ? '+' : '';
          notifs.push(`${emoji} ${holding.symbol}: ${sign}${dailyChangePercent.toFixed(2)}%`);
          
          console.log(`Display ${holding.symbol}: daily=${dailyChangePercent.toFixed(2)}%, overall gain=${holding.gainPercent?.toFixed(2)}%`);
        });

        // Add portfolio total if available
        if (data.portfolio && data.portfolio.totalPortfolioValue) {
          notifs.push(`💼 Portfolio Value: $${data.portfolio.totalPortfolioValue.toFixed(2)}`);
        }

        if (notifs.length === 0) {
          notifs.push("No holdings yet");
        }

        setNotifications(notifs);
      } else {
        setNotifications(["No holdings in portfolio", "Start trading to see your positions"]);
      }
    } catch (error) {
      console.error('Error fetching portfolio notifications:', error);
      setNotifications(["Unable to load portfolio data"]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setShowAccount(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function doLogout(event: any): void {
        event.preventDefault();
        localStorage.removeItem("user_data");
        window.location.href = '/';
    }

  return (
    <div className="navbar-wrapper">
      <div className="navigation-Bar">
        
        {/* Logo absolutely centered */}
        <div className="nav-logo-section">
          <PageTitle />
        </div>

        {/* Your existing nav items - they'll stay on the right */}
        <div className="nav-item">
          {location.pathname !== "/DashboardPage" ? (
            <Link to="/DashboardPage">
              <h2 className="navigation-bar-button">Home</h2>
            </Link>
          ) : (
            <h2 className="navigation-bar-button">Home</h2>
          )}
        </div>
        
        <Link to="/browse" className="navigation-bar-button search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span className="search-text">Search</span>
        </Link>

        <div 
          className="dropdown" 
          ref={notifRef}
          onMouseEnter={() => setShowNotifications(true)}
          onMouseLeave={() => setShowNotifications(false)}
        >
            <button className="dropbtn">Notifications ▼</button>

        <div className={`dropdown-content ${showNotifications ? 'show' : ''}`}>
            {notifications.length > 0 ? (
              notifications.map((item, index) => (
                <a key={index} style={{ fontSize: '0.9rem', padding: '8px 12px' }}>{item}</a>
              ))
            ) : (
              <a style={{ fontSize: '0.9rem', padding: '8px 12px' }}>Loading notifications...</a>
            )}
        </div>
        </div>

        {/* Account */}
        <div 
          className="dropdown"
          ref={accountRef}
          onMouseEnter={() => setShowAccount(true)}
          onMouseLeave={() => setShowAccount(false)}
        >
          <button className="dropbtn">Account  ▼</button>
          <div className={`dropdown-content ${showAccount ? 'show' : ''}`}>
            <Link to="/accountSettings">Update User Information</Link>
            <a href="#" onClick={doLogout}>Logout</a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NavBar;