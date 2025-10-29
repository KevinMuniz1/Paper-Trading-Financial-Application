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
    }
  }

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

      {/*<p>Don't have an account? <a href="/register">Register here</a></p>*/}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <span>Don't have an account? </span>
        <a href="/register" style={{ color: '#007bff', textDecoration: 'underline' }}>
          Register here
        </a>
      </div>

    </div>
  );
}

export default Login;
