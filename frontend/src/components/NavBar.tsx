import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";
import PageTitle from "./PageTitle"; // ← ADD THIS IMPORT

const NavBar = () => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

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

  const notifications = [
    "AAPL up 2.5% today",
    "Market news available",
    "Portfolio +4.3% this week",
  ];

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
            {notifications.map((item, index) => (
         <a key={index}>{item}</a>
        ))}
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