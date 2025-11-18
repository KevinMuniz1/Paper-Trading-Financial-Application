import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageTitle from '../components/PageTitle';
import { buildPath } from '../components/Path';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [message, setMessage] = useState('Verifying your email...');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');
            
            if (!token) {
                setMessage('Invalid verification link');
                return;
            }

            try {
                const response = await fetch(buildPath('verify-email'), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (data.success) {
                    setMessage('Email verified successfully! Redirecting to dashboard...');
                    setIsSuccess(true);
                    
                    // Redirect to dashboard after 2 seconds
                    setTimeout(() => {
                        navigate('/dashboard');
                    }, 2000);
                } else {
                    setMessage(`Verification failed: ${data.error}`);
                    setIsSuccess(false);
                }
            } catch (error) {
                setMessage('Network error. Please try again.');
                setIsSuccess(false);
            }
        };

        verifyEmail();
    }, [searchParams, navigate]);

    // fix this to improve visual aspect
    return (
        <div>
            <PageTitle />
            <div style={{ 
                textAlign: 'center', 
                marginTop: '50px',
                padding: '20px'
            }}>
                <h2>Email Verification</h2>
                <p style={{ 
                    color: isSuccess ? 'green' : 'red',
                    fontSize: '18px',
                    marginTop: '20px'
                }}>
                    {message}
                </p>
                {!isSuccess && (
                    <button 
                        onClick={() => navigate('/')}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            backgroundColor: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Go to Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerifyEmailPage;