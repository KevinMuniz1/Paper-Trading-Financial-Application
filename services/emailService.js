const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

console.log('Email service loaded. Resend API Key present:', !!process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, verificationToken) => {
    try {
        console.log('sendVerificationEmail called with:', { email, token: verificationToken.substring(0, 20) + '...' });
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

        console.log('Verification link:', verificationLink);
        console.log('Sending via Resend...');

        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: email,
            subject: 'Verify Your Simplitrade Account',
            html: `
        <!DOCTYPE html>
        <html>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 80%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                        <img src="logo.png" alt="Simplitrade Logo" style="height: 60px;">
                        <div style="text-align: left;">
                            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Simplitrade</h1>
                            <p style="margin: 5px 0 0 0; opacity: 0.9;">Paper Trading Platform</p>
                        </div>
                    </div>
                </div>

                <!-- Content -->
                <div style="padding: 30px; background: #ffffff; border-radius: 0 0 8px 8px;">
                    <h2 style="color: #1f2937; margin: 0 0 16px 0; font-size: 24px;">Verify Your Email Address</h2>
                    <p style="color: #4b5563; margin: 0 0 16px 0; line-height: 1.5;">
                        Welcome to Simplitrade! To start paper trading, please verify your email address by clicking the button below:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background: #25641b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                            Verify Email Address
                        </a>
                    </div>
                    
                    <p style="color: #4b5563; margin: 16px 0 8px 0;">Or copy and paste this link into your browser:</p>
                    <div style="background: #e5e7eb; padding: 12px; border-radius: 4px; font-family: monospace; margin: 8px 0; color: #1f2937;">
                        ${verificationLink}
                    </div>
                    
                    <p style="color: #4b5563; margin: 16px 0 8px 0;"><strong>This link will expire in 24 hours.</strong></p>
                    <p style="color: #4b5563; margin: 8px 0;">If you didn't create an account with Simplitrade, please ignore this email.</p>
                </div>

                <!-- Footer -->
                <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 14px;">
                    <p style="margin: 0 0 8px 0;">&copy; 2024 Simplitrade. All rights reserved.</p>
                    <p style="margin: 0;">Learn to trade risk-free with our paper trading platform</p>
                </div>
            </div>
        </body>
        </html>
      `
        });

        console.log('Resend response received');
        console.log('Resend data:', data);
        console.log('Resend error:', error);

        if (error) {
            console.error('Error sending verification email:', error);
            return { success: false, error };
        }

        console.log('Verification email sent successfully to:', email);
        return { success: true, data };
    } catch (error) {
        console.error('Exception sending verification email:', error);
        console.error('Stack trace:', error.stack);
        return { success: false, error };
    }
};

const sendPasswordResetEmail = async (email, resetToken) => {
    try {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const { data, error } = await resend.emails.send({
            from: process.env.FROM_EMAIL,
            to: email,
            subject: 'Reset Your Simplitrade Password',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { padding: 30px; background: #f9fafb; border-radius: 0 0 8px 8px; }
                .button { background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold; }
                .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
                .code { background: #e5e7eb; padding: 10px; border-radius: 4px; font-family: monospace; margin: 10px 0; }
                .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin: 16px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📈 Simplitrade</h1>
                    <p>Password Reset Request</p>
                </div>
                <div class="content">
                    <h2>Reset Your Password</h2>
                    <p>We received a request to reset your Simplitrade account password. Click the button below to create a new password:</p>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" class="button">Reset Password</a>
                    </p>
                    
                    <p>Or copy and paste this link into your browser:</p>
                    <div class="code">${resetLink}</div>
                    
                    <div class="warning">
                        <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
                        <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Simplitrade. All rights reserved.</p>
                    <p>Secure paper trading platform</p>
                </div>
            </div>
        </body>
        </html>
      `
        });

        if (error) {
            console.error('Error sending password reset email:', error);
            return { success: false, error };
        }

        console.log('Password reset email sent successfully to:', email);
        return { success: true, data };
    } catch (error) {
        console.error('Exception sending password reset email:', error);
        return { success: false, error };
    }
};

module.exports = {
    sendVerificationEmail,
    sendPasswordResetEmail
};