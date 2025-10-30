import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NewViewPage from './pages/NewViewPage';
import PortfolioPage from './pages/PortfolioPage';
import TradePage from './pages/TradePage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/new-view" element={<NewViewPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/trade" element={<TradePage />} />
            </Routes>
        </BrowserRouter>
    );
}
export default App;