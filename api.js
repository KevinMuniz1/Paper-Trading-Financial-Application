require('express');
require('mongodb');
require('dotenv').config(); 
const { PORT, MONGODB_URL } = require('./config');
const newsService = require('./services/newsService');

exports.setApp = function ( app, client )
{

// Initialize NewsService with DB instance
const db = client.db('Finance-app');
newsService.setDb(db);

app.post('/api/login', async (req, res, next) =>
{
// incoming: login, password
// outgoing: id, firstName, lastName, error
var error = '';
const { login, password } = req.body;
const db = client.db('Finance-app');
const results = await
db.collection('Users').find({Login:login,Password:password}).toArray();
var id = -1;
var fn = '';
var ln = '';
if( results.length > 0 )
{
id = results[0].UserID;
fn = results[0].FirstName;
ln = results[0].LastName;
}
var ret = { id:id, firstName:fn, lastName:ln, error:''};
res.status(200).json(ret);
});

app.post('/api/register', async (req, res, next) =>
{
// incoming: firstName, lastName, email, login, password
// outgoing: error
var error = '';
console.log('Registration request body:', req.body);
const { firstName, lastName, email, login, password } = req.body;
console.log('Extracted fields:', { firstName, lastName, email, login, password });

try
{
const db = client.db('Finance-app');

// Check if username already exists
const existingUser = await db.collection('Users').findOne({Login: login});
if (existingUser) {
error = 'Username already exists';
} else {
// Check if email already exists
const existingEmail = await db.collection('Users').findOne({Email: email});
if (existingEmail) {
error = 'Email already exists';
} else {
// Get the highest UserID to generate the next one
const lastUser = await db.collection('Users').findOne({}, {sort: {UserID: -1}});
const nextUserID = lastUser ? lastUser.UserID + 1 : 1;

// Create new user with all required fields
const newUser = {
UserID: nextUserID,
FirstName: firstName,
LastName: lastName,
Email: email,
Login: login,
Password: password,
IsEmailVerified: false,
emailVerificationToken: null,
verificationTokenExpires: null,
createdAt: new Date()
};

await db.collection('Users').insertOne(newUser);
}
}
}
catch(e)
{
error = e.toString();
}

var ret = { error: error };
res.status(200).json(ret);
});

app.post('/api/addcard', async (req, res, next) =>
{
// incoming: userId, color
// outgoing: error
const { userId, User } = req.body;
const newUser = {userId, User};
var error = '';
try
{
const db = client.db('Finance-app');
await db.collection('Users').insertOne(newUser);
}
catch(e)
{
error = e.toString();
}
var ret = { error: error };
res.status(200).json(ret);
});

app.post('/api/searchcards', async (req, res, next) =>
{
// incoming: userId, search
// outgoing: results[], error
var error = '';
const { userId, search } = req.body;
var _search = search.trim();
const db = client.db('Finance-app');
const results = await db.collection('Users').find({"User":{$regex:_search+'.*', $options:'i'}}).toArray();
var _ret = [];
for( var i=0; i<results.length; i++ )
{
_ret.push( results[i].User);
}
var ret = {results:_ret, error:error};
res.status(200).json(ret);
});

// Financial News endpoint 
app.get('/api/news', async (req, res) => {
  try {
    const articles = await newsService.getMarketNews();
    res.status(200).json({ articles });
  } catch (e) {
    console.error('GET /api/news error:', e);
    res.status(200).json({ articles: [], error: 'unavailable' });
  }
});
}