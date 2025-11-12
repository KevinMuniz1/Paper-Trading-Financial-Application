require('express');
require('mongodb');
require('dotenv').config();
const { PORT, MONGODB_URL } = require('./config');
const { generateEmailVerificationToken, generatePasswordResetToken, verifyEmailToken, verifyPasswordResetToken } = require('./services/tokenService');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./services/emailService');

exports.setApp = function (app, client) {

    // LOGIN
    app.post('/api/login', async (req, res, next) => {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error
        var error = '';
        const { login, password } = req.body;
        const db = client.db('Finance-app');
        try {
            const results = await
                db.collection('Users').find({
                    Login: login,
                    Password: password
                }).toArray();

            var id = -1;
            var fn = '';
            var ln = '';

            if (results.length > 0) {
                /* 
                uncomment this later! will require email verification to login, 
                not included for now for testing
                if(!results[0].isEmailVerified){ // ← Use the correct field name
                    error = 'Please verify your email before logging in';
                } else {*/

                id = results[0].UserID;
                fn = results[0].FirstName;
                ln = results[0].LastName;
            } else {
                error = 'Invalid login credentials';
            }

            var ret = { id: id, firstName: fn, lastName: ln, error: error };
            res.status(200).json(ret);
        } catch (e) {
            res.status(200).json({ id: -1, firstName: '', lastName: '', error: e.toString() });
        }
    });

    // REGISTER USERS
    app.post('/api/register', async (req, res, next) => {
        // incoming: firstName, lastName, email, login, password
        // outgoing: id, error
        var error = '';
        const { firstName, lastName, email, login, password } = req.body;

        try {
            const db = client.db('Finance-app');

            const existingUser = await db.collection('Users').find({ Login: login }).toArray();
            const existingEmail = await db.collection('Users').find({ Email: email }).toArray();

            if (existingUser.length > 0) {
                error = 'Username already exists';
            } else if (existingEmail.length > 0) {
                error = 'Email already exists';
            } else {

                const lastUser = await db.collection('Users').find().sort({ UserID: -1 }).limit(1).toArray();
                const nextId = lastUser.length > 0 ? lastUser[0].UserID + 1 : 1;

                const newUser = {
                    UserID: nextId,
                    FirstName: firstName,
                    LastName: lastName,
                    Email: email,
                    Login: login,
                    Password: password,
                    isEmailVerified: false,
                    emailVerificationToken: null,
                    verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    createdAt: new Date()
                };

                await db.collection('Users').insertOne(newUser);
                console.log('User created with ID:', nextId);

                // AUTO-SEND VERIFICATION EMAIL
                try {

                    console.log('Starting email verification process...');
                    console.log('Generating token for user:', nextId, 'email:', email);

                    //const testEmail = 'simplitrade.25@gmail.com';
                    const verificationToken = generateEmailVerificationToken(nextId, email);
                    console.log('Token generated');

                    console.log('Calling sendVerificationEmail...');
                    const emailResult = await sendVerificationEmail(email, verificationToken);
                    //const emailResult = await sendVerificationEmail(testEmail, verificationToken);
                    console.log('Email send result:', JSON.stringify(emailResult, null, 2));

                    //change this to only onclude error
                    if (emailResult.success) {
                        //console.error('Failed to send verification email:', emailResult.error);
                        console.error('email success');

                        await db.collection('Users').updateOne(
                            { UserID: newUser.userId },
                            {
                                $set: {
                                    emailVerificationToken: verificationToken
                                }
                            }
                        );
                    } else {
                        console.error('Failed to send verification email:', emailResult.error);
                    }
                } catch (emailError) {
                    console.error('Error sending verification email:', emailError);
                    // registration finishes even if verif does nto work
                }

                var ret = {
                    id: nextId,
                    error: error,
                    message: 'Registration successful! Please check your email to verify your account.'
                };
                res.status(200).json(ret);
                return;
            }

        }
        catch (e) {
            error = e.toString();
            console.error('Registration error:', e);
        }
        var ret = { id: -1, error: error };
        res.status(200).json(ret);
    });

    // ADD CARDS
    app.post('/api/addcard', async (req, res, next) => {
        // incoming: userId, tickerSymbol, cardName, createdAt
        // outgoing: error
        const { userId, cardName, tickerSymbol } = req.body;
        const newCard = {
            userId: parseInt(userId),
            cardName: cardName,
            tickerSymbol: tickerSymbol,
            //assetPrice: assetPrice,
            createdAt: new Date()
        };

        var error = '';
        try {
            const db = client.db('Finance-app');
            await db.collection('Trades').insertOne(newCard);
        }
        catch (e) {
            error = e.toString();
        }
        var ret = { error: error };
        res.status(200).json(ret);
    });

    // SEARCH CARDS
    app.post('/api/searchcards', async (req, res, next) => {
        // incoming: userId, search
        // outgoing: results[], error
        var error = '';
        const { userId, search } = req.body;

        var _search = search.trim();
        const db = client.db('Finance-app');

        const query = { userId: parseInt(userId) };

        if (_search && _search !== '') {
            query.$or = [
                { "tickerSymbol": { $regex: _search + '.*', $options: 'i' } },
                { "cardName": { $regex: _search + '.*', $options: 'i' } },
            ];
        }

        const results = await db.collection('Trades').find(query).toArray();

        var _ret = [];
        for (var i = 0; i < results.length; i++) {
            //_ret.push(results[i].Trades);
            _ret.push(`${results[i].cardName} (${results[i].tickerSymbol})`);
        }
        var ret = { results: _ret, error: error };
        res.status(200).json(ret);
    });

    // Verify Email 
    app.post('/api/verify-email', async (req, res) => {
        // incoming: token
        // outgoing: success, error
        var error = '';

        try {
            const { token } = req.body;

            const decoded = verifyEmailToken(token);


            const db = client.db('Finance-app');

            const user = await db.collection('Users').findOne({
                emailVerificationToken: token
            });

            if (!user) {
                error = 'Invalid verification token';
            } else {

                // Update user verification status in database
                await db.collection('Users').updateOne(
                    { UserID: decoded.userId },
                    {
                        $set: {
                            isEmailVerified: true,
                            emailVerificationToken: null,
                            verificationTokenExpires: null
                        }
                    }
                );

                res.status(200).json({
                    success: true,
                    message: 'Email verified successfully'
                });
            }
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    });

    // Request Password Reset
    app.post('/api/forgot-password', async (req, res) => {
        try {
            const { email } = req.body;

            // Find user by email
            const db = client.db('Finance-app');
            const user = await db.collection('Users').findOne({ Email: email });

            if (!user) {
                console.log('User not found for email:', email);
                // doesnt reveal if email exists or not
                return res.status(200).json({
                    success: true,
                    message: 'If the email exists, a reset link has been sent'
                });
            }

            const resetToken = generatePasswordResetToken(user.UserID, user.email);
            const result = await sendPasswordResetEmail(email, resetToken);

            if (result.success) {
                res.status(200).json({
                    success: true,
                    message: 'If the email exists, a reset link has been sent'
                });
            } else {
                res.status(500).json({
                    success: false,
                    error: 'Failed to send reset email'
                });
            }
        } catch (error) {
            console.error('Error in forgot password:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // Reset Password
    app.post('/api/reset-password', async (req, res) => {
        try {
            const { token, newPassword } = req.body;

            const decoded = verifyPasswordResetToken(token);

            const db = client.db('Finance-app');
            // hash the password
            await db.collection('Users').updateOne(
                { UserID: decoded.userId },
                { $set: { Password: newPassword } }
            );

            res.status(200).json({
                success: true,
                message: 'Password reset successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    });

}

