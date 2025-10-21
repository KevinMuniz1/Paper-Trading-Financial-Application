
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb'); 

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

require('dotenv').config();
const url = process.env.MONGODB_URL;
const client = new MongoClient(url);

async function connectDB() {
  try {
    await client.connect();
    console.log(" Connected to MongoDB Atlas");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

connectDB();

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

app.post('/api/addcard', async (req, res, next) =>
{
// incoming: userId, color
// outgoing: error
const { userId, user } = req.body;
const newUser = {User:user,UserId:userId};
var error = '';
try
{
const db = client.db('Finance-app');
const result = db.collection('Users').insertOne(newUser);
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

app.get('/', (req, res) => {
  res.send('Server is alive!');
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, '0.0.0.0', () =>
  console.log(`Server running on port ${PORT}`)
);

