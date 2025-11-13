import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VerifyEmailPage from "./pages/VerifyEmailPage";
import News from "./components/News";

function App() {
  return (
<div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-black m-0 p-0">
        <div className="min-h-screen flex items-center justify-center p-4">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/DashboardPage" element={<DashboardPage />} />
          <Route path="/DashBoardPage" element={<DashboardPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/news" element={<News/>} />
        </Routes>
      </BrowserRouter>
    </div></div>
  );
}

export default App;