import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { buildPath } from './Path';

function Register() {
  const [message, setMessage] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  async function doRegister(event: any): Promise<void> {
    event.preventDefault();

    if (!firstName || !lastName || !login || !password) {
      setMessage('Please fill in all fields');
      return;
    }

    const obj = { firstName, lastName, login, password };
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
      <span id="inner-title">CREATE ACCOUNT</span><br />
      <input
        type="text"
        placeholder="First Name"
        onChange={(e) => setFirstName(e.target.value)}
      /><br />
      <input
        type="text"
        placeholder="Last Name"
        onChange={(e) => setLastName(e.target.value)}
      /><br />
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setLogin(e.target.value)}
      /><br />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      /><br />
      <input
        type="submit"
        className="buttons"
        value="Register"
        onClick={doRegister}
      /><br />
      <span id="registerResult">{message}</span>
    </div>
  );
}

export default Register;