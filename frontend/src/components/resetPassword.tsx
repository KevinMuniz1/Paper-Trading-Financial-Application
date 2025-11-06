import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Get the reset token from URL parameters
    const token = searchParams.get('token');

    async function handlePasswordReset(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        
        // Validate passwords match
        if (newPassword !== confirmPassword) {
            setMessage('Passwords do not match. Please try again.');
            return;
        }

        if (newPassword.length < 6) {
            setMessage('Password must be at least 6 characters long.');
            return;
        }

        try {
            // Implement API call to reset password
            // await fetch('/api/reset-password', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ 
            //         token: token,
            //         newPassword: newPassword 
            //     })
            // });

            setMessage('Password successfully reset! Redirecting to login...');
            
            // Navigate back to login after 2 seconds
            setTimeout(() => navigate('/'), 2500);
        } catch (error) {
            setMessage('Error resetting password. Please try again or request a new reset link.');
        }
    }

    return (
        <div id="passwordResetDiv">
            <h2 id="inner-title">Set New Password</h2>
            <p>Please enter your new password below.</p>
            
            {message && (
                <div className={message.includes('successfully') ? 'success-message' : 'error-message'}>
                    {message}
                </div>
            )}
            
            <form onSubmit={handlePasswordReset}>
                <div className="form-group">
                    <label htmlFor="newPassword">New Password</label>
                    <input 
                        type="password" 
                        id="newPassword" 
                        placeholder="Enter new password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required 
                        minLength={6}
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <input 
                        type="password" 
                        id="confirmPassword" 
                        placeholder="Confirm new password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required 
                        minLength={6}
                    />
                </div>
                
                <button type="submit" id="resetButton">
                    Update Password
                </button>
            </form>
            
            <div className="form-footer">
                <span>Remember your password? </span>
                <a href="/">Sign in here</a>
            </div>
        </div>
    );
}

export default ResetPassword;