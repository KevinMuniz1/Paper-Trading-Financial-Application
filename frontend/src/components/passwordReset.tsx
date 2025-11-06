import { useState } from "react";
import { Router, useNavigate } from "react-router-dom";

function PasswordReset() {
    const [message, setMessage] = useState('');

    async function resetPassword(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
         const navigate = useNavigate();
        // Implement password reset logic here

        //set success message
        setMessage('If this email is registered, a password reset link will be sent.');
        setTimeout(() => navigate('/'), 3000);
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
                    <input type="email" id="email" placeholder="Enter your email" required />
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