import { Link, useLocation } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
    const location = useLocation();

    return (
        <nav className="sidebar">
            <div className="sidebar-header">
                <Link to="/dashboard" className="brand-link">
                    <div className="brand-icon">PT</div>
                    <span className="brand-text">Paper Trading</span>
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
                        <div className="link-icon">👀</div>
                        <span className="link-text">New View</span>
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
        </nav>
    );
};

export default NavBar;