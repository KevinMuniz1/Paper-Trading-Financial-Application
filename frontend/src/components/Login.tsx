import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath } from './Path';



function Login() {
  const [message, setMessage] = useState('');
  const [loginName, setLoginName] = useState('');
  const [loginPassword, setPassword] = useState('');


  const navigate = useNavigate();

  async function doLogin(event: any): Promise<void> {
    event.preventDefault();

    const obj = { login: loginName, password: loginPassword };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('login'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();

      if (res.id <= 0) {
        setMessage(res.error || 'User/Password combination incorrect');
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
      console.error('Login error:', error);
      setMessage('Connection error. Please check if the server is running.');
    }
  }

  return (
    <div id="loginDiv">
      <h2 id="inner-title">Welcome Back</h2>
      
      {message && (
        <div className="error-message">
          {message}
        </div>
      )}
      
      <form onSubmit={doLogin}>
        <div className="form-group">
          <label htmlFor="loginName">Username</label>
          <input
            type="text"
            id="loginName"
            placeholder="Enter your username"
            value={loginName}
            onChange={(e) => setLoginName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="loginPassword">Password</label>
          <input
            type="password"
            id="loginPassword"
            placeholder="Enter your password"
            value={loginPassword}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" id="loginButton">
          Sign In
        </button>
      </form>

      <div className="form-footer">
        <span>Don't have an account? </span>
        <a href="/register">Register here</a>
      </div>
    </div>
  );
}

export default Login;
