const express = require('express');
const router = express.Router();
require('mongodb');
require('dotenv').config(); 
const { PORT, MONGODB_URL } = require('./config');
const newsService = require('./services/newsService');
const { generateEmailVerificationToken, generatePasswordResetToken, verifyEmailToken, verifyPasswordResetToken } = require('./services/tokenService');
const { sendVerificationEmail, sendPasswordResetEmail } = require('./services/emailService');
const stockService = require('./services/stockService');
const { updatePortfolioTotals, getPortfolioData } = require('./services/portfolioService');
const topMoversService = require('./services/topMoversService');
const searchService = require('./services/searchService');
const baseUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

module.exports = function (client) {
    // Initialize NewsService with DB instance
    const db = client.db('Finance-app');
    newsService.setDb(db);

    // LOGIN
    router.post('/login', async (req, res, next) => {
        // incoming: login, password
        // outgoing: id, firstName, lastName, email, login, error
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
            var em = '';
            var lg = '';

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
                em = results[0].Email;
                lg = results[0].Login;
            } else {
                error = 'Invalid login credentials';
            }

            var ret = { id: id, firstName: fn, lastName: ln, email: em, login: lg, error: error };
            res.status(200).json(ret);
        } catch (e) {
            res.status(200).json({ id: -1, firstName: '', lastName: '', email: '', login: '', error: e.toString() });
        }
    });

    // REGISTER USERS
    router.post('/register', async (req, res, next) => {
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

                // register newUserin portfolio collection
                const newPortfolio = {
                    userId: nextId,
                    buyingPower: 0.00, // start with no buying power
                    totalPortfolioValue: 0.00,
                    totalInvested: 0.00,
                    totalGain: 0.00,
                    totalGainPercent: 0.00,
                    lastUpdated: new Date(),
                    createdAt: new Date()
                };

                await db.collection('Portfolio').insertOne(newPortfolio);

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
                    // registration finishes even if verif does not work
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
    router.post('/verify-email', async (req, res) => {
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
    router.post('/forgot-password', async (req, res) => {
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

            const resetToken = generatePasswordResetToken(user.UserID, user.Email);
            console.log('PASSWORD RESET TOKEN:', resetToken);
            console.log('Reset URL:', `http://${baseUrl}/reset-password?token=${resetToken}`);
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
    router.post('/reset-password', async (req, res) => {
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
                console.log(' No user found with UserID:', decoded.userId);
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

    // VIEW BUYING POWER
    router.post('/portfolio/buying-power', async (req, res, next) => {
        const { userId } = req.body;
        var error = '';

        try {
            const db = client.db('Finance-app');
            const portfolio = await db.collection('Portfolio').findOne({ userId: parseInt(userId) });

            if (!portfolio) {
                error = 'Portfolio not found';
                var ret = { buyingPower: 0, error: error };
                res.status(200).json(ret);
                return;
            }

            var ret = {
                buyingPower: portfolio.buyingPower,
                lastUpdated: portfolio.lastUpdated,
                error: error
            };
            res.status(200).json(ret);
        }
        catch (e) {
            error = e.toString();
            var ret = { buyingPower: 0, error: error };
            res.status(200).json(ret);
        }
    });

    
    // ADD BUYING POWER
    router.post('/portfolio/add-funds', async (req, res, next) => {
        // incoming: userId, amount
        // outgoing: success, error, newBalance
        var error = '';
        const { userId, amount } = req.body;

        try {
            const db = client.db('Finance-app');

            // data validation input

            if (isNaN(amount) || parseFloat(amount) <= 0) {
                error = 'Amount must be a positive number';
                var ret = { success: false, error: error, newBalance: 0 };
                res.status(200).json(ret);
                return;
            }

            const addAmount = parseFloat(amount);

            // check if portfolio exists
            const portfolio = await db.collection('Portfolio').findOne({ userId: parseInt(userId) });
            if (!portfolio) {
                error = 'Portfolio not found for user';
                var ret = { success: false, error: error, newBalance: 0 };
                res.status(200).json(ret);
                return;
            }

            // update buying power
            const result = await db.collection('Portfolio').updateOne(
                { userId: parseInt(userId) },
                { 
                    $inc: { buyingPower: addAmount },
                    $set: { lastUpdated: new Date() }
                }
            );

            if (result.modifiedCount === 0) {
                error = 'Failed to update buying power';
                var ret = { success: false, error: error, newBalance: 0 };
                res.status(200).json(ret);
                return;
            }

            // get updated balance
            const updatedPortfolio = await db.collection('Portfolio').findOne({ userId: parseInt(userId) });
            
            console.log(`Added $${addAmount.toFixed(2)} to user ${userId}. New balance: $${updatedPortfolio.buyingPower.toFixed(2)}`);

            var ret = { 
                success: true, 
                error: error,
                newBalance: updatedPortfolio.buyingPower,
                message: `Successfully added $${addAmount.toFixed(2)} to your account. New balance: $${updatedPortfolio.buyingPower.toFixed(2)}`
            };
            res.status(200).json(ret);

        } catch (e) {
            error = e.toString();
            console.error('Add funds error:', e);
            var ret = { success: false, error: error, newBalance: 0 };
            res.status(200).json(ret);
        }
    });

    // ADD TRADES CARD 
    router.post('/addcard', async (req, res, next) => {
        const { userId, cardName, tickerSymbol, shares = 1 } = req.body;
        var error = '';

        try {
            const db = client.db('Finance-app');
            
            // get current stock price
            const currentPrice = await stockService.getCurrentPrice(tickerSymbol);
            if (!currentPrice) {
                error = 'Could not fetch stock price';
                var ret = { error: error };
                res.status(200).json(ret);
                return;
            }

            const totalCost = currentPrice * shares;

            // check buying power
            const portfolio = await db.collection('Portfolio').findOne({ userId: parseInt(userId) });
            if (!portfolio) {
                error = 'Portfolio not found';
                var ret = { error: error };
                res.status(200).json(ret);
                return;
            }

            if (portfolio.buyingPower < totalCost) {
                error = `Insufficient buying power. Need $${totalCost.toFixed(2)}, have $${portfolio.buyingPower.toFixed(2)}`;
                var ret = { error: error };
                res.status(200).json(ret);
                return;
            }
            
            // check if tickersymbol is in portfolio already + update share val 
            const existingTrade = await db.collection('Trades').findOne({ userId: parseInt(userId), tickerSymbol: tickerSymbol.toUpperCase() });
            if (existingTrade) {
                const newShares = existingTrade.shares + parseInt(shares);
                const newTotalCost = existingTrade.totalCost + totalCost;
                const newPurchasePrice = newTotalCost / newShares;
                await db.collection('Trades').updateOne(
                    { _id: existingTrade._id },
                    { $set: {
                        shares: newShares,
                        purchasePrice: newPurchasePrice,
                        totalCost: newTotalCost
                    }}
                );
            } else {
                // create trade in Trades collection
                const newTrade = {
                    userId: parseInt(userId),
                    tickerSymbol: tickerSymbol.toUpperCase(),
                    cardName: cardName,
                    shares: parseInt(shares),
                    purchasePrice: currentPrice,
                    currentPrice: currentPrice,
                    totalCost: totalCost,
                    currentValue: totalCost,
                    gain: 0.00,
                    gainPercent: 0.00,
                    purchaseDate: new Date(),
                    createdAt: new Date()
                };

                await db.collection('Trades').insertOne(newTrade);
                console.log(`Trade created: ${shares} ${tickerSymbol} for user ${userId}`);
            }

            // update buying power
            await db.collection('Portfolio').updateOne(
                { userId: parseInt(userId) },
                { 
                    $inc: { buyingPower: -totalCost },
                    $set: { lastUpdated: new Date() }
                }
            );

            // update portfolio totals 
            await updatePortfolioTotals(userId, db);

            var ret = { 
                error: error,
                message: `Successfully purchased ${shares} share(s) of ${tickerSymbol} for $${totalCost.toFixed(2)}`
            };
            res.status(200).json(ret);
        }
        catch (e) {
            error = e.toString();
            console.error('Add card error:', e);
            var ret = { error: error };
            res.status(200).json(ret);
        }
    });

    // SEARCH TRADES CARDS
    router.post('/searchcards', async (req, res, next) => {
        // incoming: userId, search
        // outgoing: results[], error
        var error = '';
        const { userId, search } = req.body;

        try {
            const db = client.db('Finance-app');
            var _search = search ? search.trim() : '';

            const query = { userId: parseInt(userId) };

            if (_search && _search !== '') {
                query.$or = [
                    { "tickerSymbol": { $regex: _search + '.*', $options: 'i' } },
                    { "cardName": { $regex: _search + '.*', $options: 'i' } },
                ];
            }

            // Get trades with current prices
            const trades = await db.collection('Trades').find(query).toArray();

            if (trades.length === 0) {
                var ret = { results: [], error: error };
                res.status(200).json(ret);
                return;
            }

            // Get current prices for all symbols in search results
            const symbols = [...new Set(trades.map(trade => trade.tickerSymbol))];
            const currentPrices = await stockService.getMultiplePrices(symbols);

            // Format results with detailed information including quantities
            var _ret = [];
            for (var i = 0; i < trades.length; i++) {
                const trade = trades[i];
                const currentPrice = currentPrices[trade.tickerSymbol] || trade.currentPrice;
                const currentValue = currentPrice * trade.quantity;
                const gain = currentValue - trade.totalCost;
                const gainPercent = trade.totalCost > 0 ? (gain / trade.totalCost) * 100 : 0;

                _ret.push({
                    id: trade._id,
                    symbol: trade.tickerSymbol,
                    name: trade.cardName,
                    quantity: trade.quantity,
                    purchasePrice: trade.purchasePrice,
                    currentPrice: currentPrice,
                    totalCost: trade.totalCost,
                    currentValue: currentValue,
                    gain: gain,
                    gainPercent: gainPercent,
                    purchaseDate: trade.purchaseDate,
                    isPositive: gain >= 0
                });
            }

            var ret = { 
                results: _ret, 
                error: error,
                searchQuery: _search,
                totalResults: _ret.length
            };
            res.status(200).json(ret);

        } catch (e) {
            error = e.toString();
            console.error('Search cards error:', e);
            var ret = { 
                results: [], 
                error: error 
            };
            res.status(200).json(ret);
        }
    });

    // SELL TRADE/CARD
    router.post('/sell', async (req, res, next) => {
        // incoming: userId, tradeId, quantity 
        // outgoing: success, error, message, saleAmount, remainingQuantity
        var error = '';
        const { userId, tradeId, quantity } = req.body;

        try {
            const db = client.db('Finance-app');

            if (!userId || !tradeId) {
                error = 'User ID and Trade ID are required';
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            // Find the trade
            const trade = await db.collection('Trades').findOne({
                _id: new require('mongodb').ObjectId(tradeId),
                userId: parseInt(userId)
            });

            if (!trade) {
                error = 'Trade not found';
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            const sellQuantity = quantity ? parseInt(quantity) : trade.quantity;
            
            if (sellQuantity <= 0 || sellQuantity > trade.quantity) {
                error = `Invalid quantity. You can sell between 1 and ${trade.quantity} shares`;
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            // Get current price for sale
            const currentPrice = await stockService.getCurrentPrice(trade.tickerSymbol);
            const saleAmount = currentPrice * sellQuantity;

            if (sellQuantity === trade.quantity) {
                // Sell all shares - delete the trade
                await db.collection('Trades').deleteOne({
                    _id: new require('mongodb').ObjectId(tradeId)
                });
            } else {
                // Sell partial shares - update the trade
                const remainingQuantity = trade.quantity - sellQuantity;
                const remainingCost = (trade.totalCost / trade.quantity) * remainingQuantity;
                
                await db.collection('Trades').updateOne(
                    { _id: new require('mongodb').ObjectId(tradeId) },
                    {
                        $set: {
                            quantity: remainingQuantity,
                            totalCost: remainingCost,
                            currentPrice: currentPrice,
                            currentValue: currentPrice * remainingQuantity
                        }
                    }
                );
            }

            // Add sale amount to buying power
            await db.collection('Portfolio').updateOne(
                { userId: parseInt(userId) },
                { 
                    $inc: { buyingPower: saleAmount },
                    $set: { lastUpdated: new Date() }
                }
            );

            // Update portfolio totals
            await updatePortfolioTotals(userId, db);

            console.log(`Sold ${sellQuantity} share(s) of ${trade.tickerSymbol} for user ${userId}. Sale amount: $${saleAmount.toFixed(2)}`);

            var ret = {
                success: true,
                error: error,
                message: `Successfully sold ${sellQuantity} share(s) of ${trade.tickerSymbol} for $${saleAmount.toFixed(2)}`,
                saleAmount: saleAmount,
                soldQuantity: sellQuantity,
                remainingQuantity: sellQuantity === trade.quantity ? 0 : trade.quantity - sellQuantity,
                symbol: trade.tickerSymbol,
                salePrice: currentPrice
            };
            res.status(200).json(ret);

        } catch (e) {
            error = e.toString();
            console.error('Sell trade error:', e);
            var ret = { success: false, error: error };
            res.status(200).json(ret);
        }
    });

    // SELL ALL SHARES OF SYMBOL
    router.post('/sell-all', async (req, res, next) => {
        // incoming: userId, symbol
        // outgoing: success, error, message, totalSaleAmount, soldQuantity
        var error = '';
        const { userId, symbol } = req.body;

        try {
            const db = client.db('Finance-app');

            if (!userId || !symbol) {
                error = 'User ID and stock symbol are required';
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            // Find all trades for this symbol
            const trades = await db.collection('Trades').find({
                userId: parseInt(userId),
                tickerSymbol: symbol.toUpperCase()
            }).toArray();

            if (trades.length === 0) {
                error = `No holdings found for ${symbol}`;
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            // Get current price
            const currentPrice = await stockService.getCurrentPrice(symbol.toUpperCase());
            
            // Calculate total sale amount and quantity
            let totalSaleAmount = 0;
            let totalQuantity = 0;

            for (const trade of trades) {
                const tradeSaleAmount = currentPrice * trade.quantity;
                totalSaleAmount += tradeSaleAmount;
                totalQuantity += trade.quantity;
            }

            // Delete all trades for this symbol
            await db.collection('Trades').deleteMany({
                userId: parseInt(userId),
                tickerSymbol: symbol.toUpperCase()
            });

            // Add total sale amount to buying power
            await db.collection('Portfolio').updateOne(
                { userId: parseInt(userId) },
                { 
                    $inc: { buyingPower: totalSaleAmount },
                    $set: { lastUpdated: new Date() }
                }
            );

            // Update portfolio totals
            await updatePortfolioTotals(userId, db);

            console.log(`Sold all ${totalQuantity} share(s) of ${symbol} for user ${userId}. Total sale: $${totalSaleAmount.toFixed(2)}`);

            var ret = {
                success: true,
                error: error,
                message: `Successfully sold all ${totalQuantity} share(s) of ${symbol} for $${totalSaleAmount.toFixed(2)}`,
                totalSaleAmount: totalSaleAmount,
                soldQuantity: totalQuantity,
                symbol: symbol.toUpperCase(),
                salePrice: currentPrice
            };
            res.status(200).json(ret);

        } catch (e) {
            error = e.toString();
            console.error('Sell all error:', e);
            var ret = { success: false, error: error };
            res.status(200).json(ret);
        }
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
    router.get('/news', async (req, res, next) => {
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

    // DISPLAY PORTFOLIO SUMMARY 
    router.post('/portfolio/summary', async (req, res, next) => {
        const { userId } = req.body;
        var error = '';

        try {
            const db = client.db('Finance-app');
            
            // Update prices first
            await updatePortfolioTotals(userId, db);
            
            // Get updated data
            const portfolioData = await getPortfolioData(userId, db);

            var ret = {
                ...portfolioData,
                error: error
            };
            res.status(200).json(ret);
        }
        catch (e) {
            error = e.toString();
            console.error('Portfolio summary error:', e);
            var ret = { 
                portfolio: null, 
                holdings: [], 
                error: error 
            };
            res.status(200).json(ret);
        }
    });
    
    // ADD TO WATCHLIST
    router.post('/watchlist/add', async (req, res, next) => {
        // incoming: userId, symbol
        // outgoing: success, error, message
        var error = '';
        const { userId, symbol } = req.body;

        try {
            if (!userId || !symbol) {
                error = 'User ID and stock symbol are required';
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            const db = client.db('Finance-app');
            const symbolUpper = symbol.toUpperCase();

            // Validate stock symbol exists
            const price = await stockService.getCurrentPrice(symbolUpper);
            if (!price) {
                error = 'Invalid stock symbol';
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            // Check if already in watchlist
            const existing = await db.collection('Watchlists').findOne({
                userId: parseInt(userId),
                symbol: symbolUpper
            });

            if (existing) {
                error = 'Stock already in watchlist';
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            // Get stock name from popular stocks or use symbol as fallback
            let stockName = symbolUpper;
            try {
                const popularStocksService = require('./services/popularStocksService');
                const stocks = await popularStocksService.getPopularStocks();
                const stockInfo = stocks.find(s => s.symbol === symbolUpper);
                if (stockInfo) {
                    stockName = stockInfo.name;
                }
            } catch (e) {
                console.log('Could not fetch stock name, using symbol');
            }

            const watchlistItem = {
                userId: parseInt(userId),
                symbol: symbolUpper,
                name: stockName,
                addedDate: new Date(),
                currentPrice: price,
                createdAt: new Date()
            };

            await db.collection('Watchlists').insertOne(watchlistItem);
            console.log(`Added ${symbolUpper} to watchlist for user ${userId}`);

            var ret = {
                success: true,
                error: error,
                message: `Added ${symbolUpper} to watchlist`
            };
            res.status(200).json(ret);

        } catch (e) {
            error = e.toString();
            console.error('Add to watchlist error:', e);
            var ret = { success: false, error: error };
            res.status(200).json(ret);
        }
    });

    // DELETE FROM WATCHLIST
    router.post('/watchlist/delete', async (req, res, next) => {
        // incoming: userId, symbol
        // outgoing: success, error, message
        var error = '';
        const { userId, symbol } = req.body;

        try {
            if (!userId || !symbol) {
                error = 'User ID and stock symbol are required';
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            const db = client.db('Finance-app');
            const result = await db.collection('Watchlists').deleteOne({
                userId: parseInt(userId),
                symbol: symbol.toUpperCase()
            });

            if (result.deletedCount === 0) {
                error = 'Stock not found in watchlist';
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            console.log(`Removed ${symbol} from watchlist for user ${userId}`);

            var ret = {
                success: true,
                error: error,
                message: `Removed ${symbol} from watchlist`
            };
            res.status(200).json(ret);

        } catch (e) {
            error = e.toString();
            console.error('Remove from watchlist error:', e);
            var ret = { success: false, error: error };
            res.status(200).json(ret);
        }
    });

    // DISPLAY WATCHLIST
    router.post('/watchlist', async (req, res, next) => {
        // incoming: userId
        // outgoing: watchlist[], error
        var error = '';
        const { userId } = req.body;

        try {
            if (!userId) {
                error = 'User ID is required';
                var ret = { watchlist: [], error: error };
                res.status(200).json(ret);
                return;
            }

            const db = client.db('Finance-app');
            const watchlistItems = await db.collection('Watchlists')
                .find({ userId: parseInt(userId) })
                .sort({ addedDate: -1 })
                .toArray();

            if (watchlistItems.length === 0) {
                var ret = { watchlist: [], error: error };
                res.status(200).json(ret);
                return;
            }

            // Get current prices for all watchlist items
            const symbols = watchlistItems.map(item => item.symbol);
            const currentPrices = await stockService.getMultiplePrices(symbols);

            // Update watchlist with current prices and calculate changes
            const updatedWatchlist = watchlistItems.map(item => {
                const currentPrice = currentPrices[item.symbol] || item.currentPrice;
                const change = currentPrice - item.currentPrice;
                const changePercent = item.currentPrice > 0 ? (change / item.currentPrice) * 100 : 0;

                return {
                    id: item._id,
                    symbol: item.symbol,
                    name: item.name,
                    addedPrice: item.currentPrice,
                    currentPrice: currentPrice,
                    change: change,
                    changePercent: changePercent,
                    addedDate: item.addedDate,
                    isPositive: change >= 0
                };
            });

            var ret = {
                watchlist: updatedWatchlist,
                error: error
            };
            res.status(200).json(ret);

        } catch (e) {
            error = e.toString();
            console.error('Get watchlist error:', e);
            var ret = { watchlist: [], error: error };
            res.status(200).json(ret);
        }
    });

    // CHECK IF IN WATCHLIST
    router.post('/watchlist/check', async (req, res, next) => {
        // incoming: userId, symbol
        // outgoing: isInWatchlist, error
        var error = '';
        const { userId, symbol } = req.body;

        try {
            if (!userId || !symbol) {
                error = 'User ID and stock symbol are required';
                var ret = { isInWatchlist: false, error: error };
                res.status(200).json(ret);
                return;
            }

            const db = client.db('Finance-app');
            const item = await db.collection('Watchlists').findOne({
                userId: parseInt(userId),
                symbol: symbol.toUpperCase()
            });

            var ret = {
                isInWatchlist: !!item,
                error: error
            };
            res.status(200).json(ret);

        } catch (e) {
            error = e.toString();
            var ret = { isInWatchlist: false, error: error };
            res.status(200).json(ret);
        }
    });
    // Financial News endpoint
    router.get('/news', async (req, res) => {
        try {
            const bust = req.query.bustCache === '1' || req.query.bustCache === 'true';
            const articles = await newsService.getMarketNews({ bustCache: bust });
            res.status(200).json({ articles });
        } catch (e) {
            console.error('GET /api/news error:', e);
            res.status(200).json({ articles: [], error: 'unavailable' });
        }
    });

    // GET TOP MOVERS (Gainers and Losers)
    router.get('/top-movers', async (req, res) => {
        // outgoing: gainers[], losers[], error
        var error = '';

        try {
            const result = await topMoversService.getTopMovers();
            res.status(200).json({
                gainers: result.gainers,
                losers: result.losers,
                error: ''
            });
        } catch (e) {
            error = e.toString();
            console.error('GET /api/top-movers error:', e);
            res.status(200).json({
                gainers: [],
                losers: [],
                error: error
            });
        }
    });

    // SEARCH STOCKS
    router.get('/search', async (req, res) => {
        // incoming: query (query parameter)
        // outgoing: results[], error
        var error = '';

        try {
            const query = req.query.q || req.query.query;

            if (!query || query.trim() === '') {
                res.status(200).json({
                    results: [],
                    error: 'Search query is required'
                });
                return;
            }

            const result = await searchService.searchStocks(query.trim());
            res.status(200).json({
                results: result.results,
                error: ''
            });
        } catch (e) {
            error = e.toString();
            console.error('GET /api/search error:', e);
            res.status(200).json({
                results: [],
                error: error
            });
        }
    });

    // GET USER INFO BY ID
    router.post('/user/profile', async (req, res, next) => {
        // incoming: userId
        // outgoing: id, firstName, lastName, email, login, error
        var error = '';
        const { userId } = req.body;

        try {
            if (!userId) {
                error = 'User ID is required';
                var ret = { error: error };
                res.status(200).json(ret);
                return;
            }

            const db = client.db('Finance-app');
            const user = await db.collection('Users').findOne({
                UserID: parseInt(userId)
            });

            if (!user) {
                error = 'User not found';
                var ret = { error: error };
                res.status(200).json(ret);
                return;
            }

            var ret = {
                id: user.UserID,
                firstName: user.FirstName,
                lastName: user.LastName,
                email: user.Email,
                login: user.Login,
                error: error
            };
            res.status(200).json(ret);
        } catch (e) {
            res.status(200).json({ error: e.toString() });
        }
    });

    // UPDATE USER PROFILE
    router.patch('/user/update', async (req, res, next) => {
        // incoming: userId, firstName, lastName, email, login (optional)
        // outgoing: success, error, message
        var error = '';
        const { userId, firstName, lastName, email, login } = req.body;

        try {
            if (!userId) {
                error = 'User ID is required';
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            const db = client.db('Finance-app');

            // Check if user exists
            const user = await db.collection('Users').findOne({
                UserID: parseInt(userId)
            });

            if (!user) {
                error = 'User not found';
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            // Check if new login/email already exists (if being changed)
            if (login && login !== user.Login) {
                const existingLogin = await db.collection('Users').findOne({
                    Login: login
                });
                if (existingLogin) {
                    error = 'Username already exists';
                    var ret = { success: false, error: error };
                    res.status(200).json(ret);
                    return;
                }
            }

            if (email && email !== user.Email) {
                const existingEmail = await db.collection('Users').findOne({
                    Email: email
                });
                if (existingEmail) {
                    error = 'Email already exists';
                    var ret = { success: false, error: error };
                    res.status(200).json(ret);
                    return;
                }
            }

            // Build update object - handle both camelCase and PascalCase field names
            const updateObj = {};
            if (firstName) updateObj.FirstName = firstName;
            if (lastName) updateObj.LastName = lastName;
            if (email) updateObj.Email = email;
            if (login) updateObj.Login = login;

            // If no fields to update, return error
            if (Object.keys(updateObj).length === 0) {
                error = 'No fields to update';
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            // Update user
            const result = await db.collection('Users').updateOne(
                { UserID: parseInt(userId) },
                { $set: updateObj }
            );

            if (result.modifiedCount === 0) {
                error = 'Failed to update user';
                var ret = { success: false, error: error };
                res.status(200).json(ret);
                return;
            }

            console.log(`User ${userId} updated successfully`);

            var ret = {
                success: true,
                error: error,
                message: 'Profile updated successfully'
            };
            res.status(200).json(ret);

        } catch (e) {
            error = e.toString();
            console.error('Update user error:', e);
            var ret = { success: false, error: error };
            res.status(200).json(ret);
        }
    });

    return router;
}
