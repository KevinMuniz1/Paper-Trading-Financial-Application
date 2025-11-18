import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
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

import { AuthProvider } from '../context/AuthContext';
import { PortfolioProvider } from '../context/PortfolioContext';

function AppContent() {
  return (
    <>
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
      </Routes>
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-black m-0 p-0">
      <BrowserRouter>
        <AuthProvider>
          <PortfolioProvider>
            <AppContent />
          </PortfolioProvider>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
