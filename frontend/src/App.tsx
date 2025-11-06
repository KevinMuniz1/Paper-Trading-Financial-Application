import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NewViewPage from './pages/NewViewPage';
import PortfolioPage from './pages/PortfolioPage';
import TradePage from './pages/TradePage';
import ForgotPasswordPage from './pages/forgot-password';

function App() {
  return (
<div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-black m-0 p-0">
        <div className="min-h-screen flex items-center justify-center p-4">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </BrowserRouter>
    </div></div>
  );
}

/*
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
}*/
export default App;