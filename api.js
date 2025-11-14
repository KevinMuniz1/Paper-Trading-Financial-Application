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

                console.log('Starting email verification process...');
                console.log('Generating token for user:', nextId, 'email:', email);

                //const testEmail = 'simplitrade.25@gmail.com';
                const verificationToken = generateEmailVerificationToken(nextId, email);
                console.log('Token generated', verificationToken);

                const newUser = {
                    UserID: nextId,
                    FirstName: firstName,
                    LastName: lastName,
                    Email: email,
                    Login: login,
                    Password: password,
                    isEmailVerified: false,
                    emailVerificationToken: verificationToken,
                    verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    createdAt: new Date()
                };

                await db.collection('Users').insertOne(newUser);
                console.log('User created with ID:', nextId);

                // AUTO-SEND VERIFICATION EMAIL
                try {

                    console.log('Calling sendVerificationEmail...');
                    const emailResult = await sendVerificationEmail(email, verificationToken);
                    //const emailResult = await sendVerificationEmail(testEmail, verificationToken);
                    console.log('Email send result:', JSON.stringify(emailResult, null, 2));

                    //change this to only onclude error
                    if (emailResult.success) {
                        //console.error('Failed to send verification email:', emailResult.error);
                        console.error('email success');
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
                    { UserID: user.UserID },
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
        } catch (e) {
            res.status(200).json({
                success: false,
                error: error
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
                // doesnt reveal if email exists or not
                return res.status(200).json({
                    success: true,
                    message: 'If the email exists, a reset link has been sent'
                });
            }

            const resetToken = generatePasswordResetToken(user.UserID, user.Email);
            console.log('🔑 PASSWORD RESET TOKEN:', resetToken);
            console.log('🔗 Reset URL:', `http://localhost:5173/reset-password?token=${resetToken}`);
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
            const result = await db.collection('Users').updateOne(
                { UserID: decoded.userId },
                { $set: { Password: newPassword } }
            );

            if (result.modifiedCount === 0) {
                console.log('❌ No user found with UserID:', decoded.userId);
                return res.status(400).json({
                    success: false,
                    error: 'User not found'
                });
            }

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

     // Function to extract the primary stock ticker from text
    function extractPrimaryTicker(title, description) {
        if (!title && !description) return null;

        const fullText = `${title || ''} ${description || ''}`;

        // Popular stock tickers with their company names for matching
        const tickerMap = {
            'AAPL': ['Apple', 'iPhone', 'iPad', 'Mac', 'iOS'],
            'MSFT': ['Microsoft', 'Windows', 'Xbox', 'Azure', 'Office'],
            'GOOGL': ['Google', 'Alphabet', 'YouTube', 'Android', 'Chrome'],
            'AMZN': ['Amazon', 'AWS', 'Prime', 'Alexa'],
            'NVDA': ['Nvidia', 'GPU', 'graphics card'],
            'META': ['Meta', 'Facebook', 'Instagram', 'WhatsApp', 'Zuckerberg'],
            'TSLA': ['Tesla', 'Musk', 'electric vehicle', 'EV'],
            'JPM': ['JPMorgan', 'JP Morgan', 'Chase'],
            'JNJ': ['Johnson & Johnson', 'J&J'],
            'V': ['Visa'],
            'PG': ['Procter & Gamble', 'P&G'],
            'XOM': ['Exxon', 'ExxonMobil'],
            'UNH': ['UnitedHealth'],
            'MA': ['Mastercard'],
            'HD': ['Home Depot'],
            'CVX': ['Chevron'],
            'MRK': ['Merck'],
            'PFE': ['Pfizer'],
            'ABBV': ['AbbVie'],
            'KO': ['Coca-Cola', 'Coke'],
            'PEP': ['Pepsi', 'PepsiCo'],
            'COST': ['Costco'],
            'WMT': ['Walmart'],
            'DIS': ['Disney'],
            'CSCO': ['Cisco'],
            'NFLX': ['Netflix'],
            'ADBE': ['Adobe'],
            'CRM': ['Salesforce'],
            'NKE': ['Nike'],
            'TMO': ['Thermo Fisher'],
            'ABT': ['Abbott'],
            'ACN': ['Accenture'],
            'MCD': ['McDonald', 'McDonalds'],
            'AVGO': ['Broadcom'],
            'DHR': ['Danaher'],
            'VZ': ['Verizon'],
            'TXN': ['Texas Instruments'],
            'NEE': ['NextEra'],
            'INTC': ['Intel'],
            'CMCSA': ['Comcast'],
            'LIN': ['Linde'],
            'PM': ['Philip Morris'],
            'UPS': ['UPS', 'United Parcel'],
            'RTX': ['Raytheon'],
            'QCOM': ['Qualcomm'],
            'HON': ['Honeywell'],
            'WFC': ['Wells Fargo'],
            'SBUX': ['Starbucks'],
            'AMD': ['AMD', 'Advanced Micro Devices'],
            'SNOW': ['Snowflake'],
            'CRM': ['Salesforce'],
            'SQ': ['Square', 'Block'],
            'PYPL': ['PayPal'],
            'UBER': ['Uber'],
            'ABNB': ['Airbnb'],
            'COIN': ['Coinbase']
        };

        // First check for $TICKER format in title (highest priority)
        const dollarPattern = /\$([A-Z]{1,5})\b/g;
        let match = dollarPattern.exec(title || '');
        if (match) {
            return match[1];
        }

        // Check for company names in title first (title is more important)
        for (const [ticker, keywords] of Object.entries(tickerMap)) {
            for (const keyword of keywords) {
                const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                if (regex.test(title || '')) {
                    return ticker;
                }
            }
        }

        // Then check in description
        for (const [ticker, keywords] of Object.entries(tickerMap)) {
            for (const keyword of keywords) {
                const regex = new RegExp(`\\b${keyword}\\b`, 'i');
                if (regex.test(description || '')) {
                    return ticker;
                }
            }
        }

        // Last resort: check for $TICKER in description
        match = dollarPattern.exec(description || '');
        if (match) {
            return match[1];
        }

        return null;
    }

    // GET NEWS
    app.get('/api/news', async (req, res, next) => {
        // outgoing: articles[], error
        var error = '';

        try {
            const newsApiKey = process.env.NEWS_API_KEY;

            if (!newsApiKey || newsApiKey === 'YOUR_API_KEY_HERE') {
                return res.status(200).json({
                    articles: [],
                    error: 'NewsAPI key not configured. Please add your API key to the .env file.'
                });
            }

            // Fetch stock-specific news from top financial news sources
            // Including Yahoo Finance, Bloomberg, CNBC, Financial Times, Reuters, WSJ
            const query = encodeURIComponent('stocks OR "stock market" OR trading OR earnings OR shares');
            const domains = 'finance.yahoo.com,bloomberg.com,cnbc.com,reuters.com,wsj.com,marketwatch.com,businessinsider.com,forbes.com';

            // Get date range for past 30 days (NewsAPI free tier limitation)
            const toDate = new Date();
            const fromDate = new Date();
            fromDate.setDate(fromDate.getDate() - 30); // 30 days ago

            const fromDateStr = fromDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
            const toDateStr = toDate.toISOString().split('T')[0];

            const response = await fetch(
                `https://newsapi.org/v2/everything?q=${query}&domains=${domains}&from=${fromDateStr}&to=${toDateStr}&language=en&sortBy=publishedAt&pageSize=100&apiKey=${newsApiKey}`
            );

            const data = await response.json();

            if (data.status === 'ok') {
                const articles = data.articles
                    .filter(article => article.title && article.description) // Filter out articles without title or description
                    .map(article => {
                        const primaryTicker = extractPrimaryTicker(article.title, article.description);

                        return {
                            title: article.title,
                            description: article.description,
                            url: article.url,
                            urlToImage: article.urlToImage,
                            publishedAt: article.publishedAt,
                            source: article.source.name,
                            ticker: primaryTicker
                        };
                    })
                    .filter(article => article.ticker !== null); // Only include articles with an identifiable ticker

                res.status(200).json({ articles: articles, error: '' });
            } else {
                error = data.message || 'Failed to fetch news';
                res.status(200).json({ articles: [], error: error });
            }
        } catch (e) {
            error = e.toString();
            res.status(200).json({ articles: [], error: error });
        }
    });

    
}

