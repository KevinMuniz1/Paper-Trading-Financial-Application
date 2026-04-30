import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VerifyEmailPage from "./pages/VerifyEmailPage";
import BrowsePage from "./pages/BrowsePage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import ForgotPasswordPage from './pages/forgot-password';
import ResetPasswordPage from './pages/reset-password';
import DisplayStockPage from "./pages/StockPage";
import TradeHistoryPage from "./pages/TradeHistoryPage";
import { AuthProvider } from './context/AuthContext';
import { PortfolioProvider } from './context/PortfolioContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PortfolioProvider>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/DashBoardPage" element={<DashboardPage />} />
            <Route path="/accountSettings" element={<AccountSettingsPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/stock/:symbol" element={<DisplayStockPage />} />
            <Route path="/trades" element={<TradeHistoryPage />} />
          </Routes>
        </PortfolioProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
