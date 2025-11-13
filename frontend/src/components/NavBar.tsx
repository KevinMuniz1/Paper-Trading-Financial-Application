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

  const notifications = [
    "AAPL up 2.5% today",
    "BTC dropped 1.2%",
    "Market news available",
    "Portfolio +4.3% this week",
  ];

  return (
    <div className="navbar-wrapper">

      <div className="navigation-Bar">

        <Link to="/news">
          <h2 className="navigation-bar-button">Search</h2>
        </Link>

        <div className="nav-item has-dropdown" ref={notifRef}>
          <h2 className="navigation-bar-button" onClick={() => setShowNotifications((prev) => !prev)}
           > Notifications</h2>

          {showNotifications && (
            <div className="notif-popover">
              <div className="notif-header">
                Recent Notifications
                <span
                  className="notif-close"
                  onClick={() => setShowNotifications(false)}
                >
                  ✖
                </span>
              </div>
              <div className="notif-list">
                {notifications.map((n, i) => (
                  <div key={i} className="notif-item">
                    {n}
                  </div>
                ))}
              </div>
              <div className="notif-footer">View all →</div>
            </div>
          )}
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
        <Link to="./SearchAndNewsPage">
          <h2 className="navigation-bar-button">Account</h2>
        </Link>
      </div>
    </div>
  );
};

export default NavBar;
