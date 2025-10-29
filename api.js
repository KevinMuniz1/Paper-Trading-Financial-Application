require('express');
require('mongodb');
require('dotenv').config();
const { PORT, MONGODB_URL } = require('./config');

exports.setApp = function (app, client) {

    // LOGIN
    app.post('/api/login', async (req, res, next) => {
        // incoming: login, password
        // outgoing: id, firstName, lastName, error
        var error = '';
        const { login, password } = req.body;
        const db = client.db('Finance-app');
        try{
            const results = await
                db.collection('Users').find({ 
                    Login: login, 
                    Password: password
                }).toArray();

            var id = -1;
            var fn = '';
            var ln = '';

            if (results.length > 0) {
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
        // incoming: firstName, lastName, login, password 
        // outgoing: id, error
        var error = '';
        const { firstName, lastName, login, password } = req.body;
        
        try {
            const db = client.db('Finance-app');
            // Check if username already exists
            const existingUser = await db.collection('Users').find({ Login: login }).toArray();

            if (existingUser.length > 0) {
                error = 'Username already exists';
            } else {
                // Find the next available UserID
                const lastUser = await db.collection('Users').find().sort({ UserID: -1 }).limit(1).toArray();
                const nextId = lastUser.length > 0 ? lastUser[0].UserID + 1 : 1;
                
                // Create new user
                const newUser = {
                UserID: nextId,
                FirstName: firstName,
                LastName: lastName,
                Login: login,
                Password: password,
                createdAt: new Date()
                };
                
                await db.collection('Users').insertOne(newUser);
                id = nextId;
            }

        }
        catch (e) {
            error = e.toString();
        }
        var ret = { error: error };
        res.status(200).json(ret);
    });

    // ADD CARDS
    app.post('/api/addcard', async (req, res, next) => {
        // incoming: userId, tickerSymbol, cardName, createdAt
        // outgoing: error
        const { userId, cardName, tickerSymbol} = req.body;
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

        const query = {userId: parseInt(userId)};

        if(_search && _search !== ''){
            query.$or = [
                {"tickerSymbol": { $regex: _search + '.*', $options: 'i' } },
                {"cardName": { $regex: _search + '.*', $options: 'i' } },
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
}