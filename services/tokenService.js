const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'key_cop4331_jwt_main';
const EMAIL_VERIFICATION_SECRET = process.env.EMAIL_VERIFICATION_SECRET || 'key_cop4331_email_verify';
const PASSWORD_RESET_SECRET = process.env.PASSWORD_RESET_SECRET || 'key_cop4331_password_reset';

// (expires in 24 hours)
const generateEmailVerificationToken = (userId, email) => {
    return jwt.sign(
        { userId, email, type: 'email_verification' },
        EMAIL_VERIFICATION_SECRET,
        { expiresIn: '24h' }
    );
};

// (expires in 1 hour)
const generatePasswordResetToken = (userId, email) => {
    return jwt.sign(
        { userId, email, type: 'password_reset' },
        PASSWORD_RESET_SECRET,
        { expiresIn: '1h' }
    );
};

const verifyEmailToken = (token) => {
    try {
        return jwt.verify(token, EMAIL_VERIFICATION_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired verification token');
    }
};

const verifyPasswordResetToken = (token) => {
    try {
        return jwt.verify(token, PASSWORD_RESET_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired password reset token');
    }
};

// generate regular JWT for authenticated users
const generateAuthToken = (user) => {
    return jwt.sign(
        {
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
};

module.exports = {
    generateEmailVerificationToken,
    generatePasswordResetToken,
    verifyEmailToken,
    verifyPasswordResetToken,
    generateAuthToken
};