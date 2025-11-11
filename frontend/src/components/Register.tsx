import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath } from './Path';

function Register() {
  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  async function doRegister(event: any): Promise<void> {
    event.preventDefault();

    if (!firstName || !lastName || !email || !login || !password) {
      setMessage('Please fill in all fields');
      return;
    }

    const obj = { firstName, lastName, email, login, password };
    const js = JSON.stringify(obj);

    try {
      const response = await fetch(buildPath('register'), {
        method: 'POST',
        body: js,
        headers: { 'Content-Type': 'application/json' }
      });

      const res = await response.json();

      if (res.id <= 0) {
        setMessage(res.error || 'Registration failed');
      } else {
        setMessage('Registration successful! Please log in.');
        // Redirect to login page after 2 seconds
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error: any) {
      setMessage(error.toString());
    }
  }

  return (
    <div id="registerDiv">
      <h2 id="register-title">Create Account</h2>
      
      {message && (
        <div className={message.includes('successful') ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}
      
      <form onSubmit={doRegister}>
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Choose a username"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" id="registerButton">
          Create Account
        </button>
      </form>

      <div className="form-footer">
        <span>Already have an account? </span>
        <a href="/">Sign in here</a>
      </div>
    </div>
  );
}

export default Register;