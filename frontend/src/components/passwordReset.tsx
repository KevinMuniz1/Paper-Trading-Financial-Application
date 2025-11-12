import { useState } from "react";
import { Router, useNavigate } from "react-router-dom";

function PasswordReset() {
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    async function resetPassword(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        
        try {
            const response = await fetch('/api/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email,
                })
            });

            const result = await response.json();
            console.log('Password reset response:', result);

            if (response.ok) {
                setMessage('If this email is registered, a password reset link will be sent.');
                setTimeout(() => navigate('/'), 3000);
            } else {
                setMessage('An error occurred. Please try again.');
                console.error('Password reset failed:', result);
            }
        } catch (error) {
            console.error('Error sending password reset request:', error);
            setMessage('An error occurred. Please try again.');
        }
    }

    return (
        <div id="passwordResetDiv">
            <h2 id="inner-title">Password Reset</h2>
            <p>Please enter your email address to receive a password reset link.</p>
            
            {message && (
                <div className="success-message">
                    {message}
                </div>
            )}
            
            <form>
                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input type="email" id="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <button type="submit" id="resetButton" onClick={resetPassword}>
                    Send Reset Link
                </button>
            </form>
            <div className="form-footer">
                <span>Back To <a href="/">Sign in here</a></span>
            </div>
        </div>
    );
};
export default PasswordReset;