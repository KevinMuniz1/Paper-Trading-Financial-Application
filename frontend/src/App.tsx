import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VerifyEmailPage from "./pages/VerifyEmailPage";
import BrowsePage from "./pages/BrowsePage";
import NavBar from "./components/NavBar";

function AppContent() {
  const location = useLocation();
  const authPages = ['/', '/register', '/verify-email'];
  const showNavBar = !authPages.includes(location.pathname);

  return (
    <>
      {showNavBar && <NavBar />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/DashBoardPage" element={<DashboardPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/browse" element={<BrowsePage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
<div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-black m-0 p-0">
        <div className="min-h-screen flex items-center justify-center p-4">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div></div>
  );
}

export default App;