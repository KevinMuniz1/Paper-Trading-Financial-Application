import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

const NavBar = () => {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
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
    "BTC dropped 1.2%",
    "Market news available",
    "Portfolio +4.3% this week",
  ];

  return (
    <div className="navbar-wrapper">

      <div className="navigation-Bar">

        <Link to="/browse" className="navigation-bar-button search-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </Link>

        <div className="dropdown">
            <button className="dropbtn">Notifications ▼</button>

        <div className="dropdown-content">
            {notifications.map((item, index) => (
         <a key={index}>{item}</a>
        ))}
        </div>
        </div>

        {/* Home */}
        {location.pathname !== "/DashboardPage" ? (
          <Link to="./DashboardPage">
            <h2 className="navigation-bar-button">Home</h2>
          </Link>
        ) : (
          <h2 className="navigation-bar-button">Home</h2>
        )}

        {/* Account */}
        <Link to="/stockPage">
          <h2 className="navigation-bar-button">Account</h2>
        </Link>

  
         <h2 onClick={doLogout} className="navigation-bar-button">Logout</h2>

      </div>
    </div>
  );
};

export default NavBar;
