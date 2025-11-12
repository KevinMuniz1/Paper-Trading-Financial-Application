import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
    const location = useLocation();

    // get user data from localStorage
    const userData = localStorage.getItem('user_data');
    let username = "User"; 

    if (userData) {
        try {
            const user = JSON.parse(userData);
            username = `${user.firstName} ${user.lastName}`;
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }

    function doLogout(event: any): void {
        event.preventDefault();
        localStorage.removeItem("user_data");
        window.location.href = '/';
    }

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <Link to="/dashboard" className="brand-link">
                    <div className="brand-icon">PT</div>
                    <span className="brand-text">SimpliTrade</span>
                </Link>
            </div>
            <ul className="sidebar-menu">
                <li className="sidebar-item">
                    <Link 
                        to="/dashboard" 
                        className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                    >
                        <div className="link-icon">🏠</div>
                        <span className="link-text">Home</span>
                    </Link>
                </li>
                <li className="sidebar-item">
                    <Link 
                        to="/new-view" 
                        className={`sidebar-link ${location.pathname === '/new-view' ? 'active' : ''}`}
                    >
                        <div className="link-icon">📰</div>
                        <span className="link-text">News</span>
                    </Link>
                </li>
                <li className="sidebar-item">
                    <Link 
                        to="/portfolio" 
                        className={`sidebar-link ${location.pathname === '/portfolio' ? 'active' : ''}`}
                    >
                        <div className="link-icon">💼</div>
                        <span className="link-text">Portfolio</span>
                    </Link>
                </li>
                <li className="sidebar-item">
                    <Link 
                        to="/trade" 
                        className={`sidebar-link ${location.pathname === '/trade' ? 'active' : ''}`}
                    >
                        <div className="link-icon">📈</div>
                        <span className="link-text">Trade</span>
                    </Link>
                </li>
            </ul>
            <div className="user-section">
                <div className="user-info">
                    <span className="user-name">Logged In As {username}</span>
                </div>
                <button 
                    type="button" 
                    className="logout-button"
                    onClick={doLogout}
                >
                    <span className="link-text">Log Out</span>
                </button>
            </div>
        </nav>
    );
};

export default NavBar;