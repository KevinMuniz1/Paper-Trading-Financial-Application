import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "./NavBar.css";

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
    "BTC dropped 1.2%",
    "Market news available",
    "Portfolio +4.3% this week",
  ];

  return (
    <div className="navbar-wrapper">

      <div className="navigation-Bar">

        {/* Home */}
        <div className="nav-item">
          {location.pathname !== "/DashboardPage" ? (
            <Link to="/DashboardPage">
              <h2 className="navigation-bar-button">Home</h2>
            </Link>
          ) : (
            <h2 className="navigation-bar-button">Home</h2>
          )}
        </div>
         
        <div className="nav-item">
          <Link to="/news">
            <h2 className="navigation-bar-button">Search</h2>
          </Link>
        </div>

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
