import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath } from './Path';



function Login() {
  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const navigate = useNavigate();

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();
    setIsLoading(true);

    const obj = { login: loginName, password: loginPassword };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('login'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = JSON.parse(await response.text());

      if (res.id <= 0) {
        setMessage('User/Password combination incorrect');
      } else {
        const user = {
          firstName: res.firstName,
          lastName: res.lastName,
          id: res.id,
        };
        localStorage.setItem('user_data', JSON.stringify(user));
        setMessage('');
        navigate('/dashboard');
      }
    } catch (error: any) {
      alert(error.toString());
    } finally {
      setIsLoading(false);
    }
  }
/*
  return (
    <div id="loginDiv">
      <span id="inner-title">PLEASE LOG IN</span><br />
      <input
        type="text"
        id="loginName"
        placeholder="Username"
        onChange={(e) => setLoginName(e.target.value)}
      /><br />
      <input
        type="password"
        id="loginPassword"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <input
        type="submit"
        id="loginButton"
        className="buttons"
        value="Do It"
        onClick={doLogin}
      /><br />
      <span id="loginResult">{message}</span>

      {/*<p>Don't have an account? <a href="/register">Register here</a></p>}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <span>Don't have an account? </span>
        <a href="/register" style={{ color: '#007bff', textDecoration: 'underline' }}>
          Register here
        </a>
      </div>

    </div>
  
  
  );  */
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-green-600 to-black m-0 p-0">
      {/* Glass Effect Overlay */}
      <div></div>
      
      {/* Main Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* Glass Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 border border-white/30">
              <span className="text-white text-2xl font-bold">S</span>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">
              WELCOME BACK
            </h2>
            <p className="text-green-100">Sign in to your trading account</p>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={doLogin}>
            {/* Username Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={loginPassword}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent transition-all duration-200 backdrop-blur-sm"
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {message && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 backdrop-blur-sm">
                <p className="text-red-100 text-sm font-medium">{message}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none backdrop-blur-sm"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In to Trade'
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-green-200">
              Don't have an account?{' '}
              <a 
                href="/register" 
                className="text-white hover:text-green-300 font-semibold transition-colors duration-200 underline underline-offset-2"
              >
                Start trading today
              </a>
            </p>
          </div>
        </div>
      </div>

      
    </div>
  );
}


export default Login;
