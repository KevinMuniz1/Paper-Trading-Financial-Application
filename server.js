const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const { PORT, MONGODB_URL } = require('./config');
const { generateEmailVerificationToken } = require('./services/tokenService');
const { sendVerificationEmail } = require('./services/emailService');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://paper-trade-app.com', 'http://www.paper-trade-app.com'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Your existing CORS headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  next();
});

const url = MONGODB_URL || process.env.MONGODB_URL || 'mongodb://localhost:27017/Finance-app';
console.log('Connecting to MongoDB at:', url);
const client = new MongoClient(url);

async function connectDB() {
  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  }
}

connectDB();

var api = require('./api.js');
api.setApp(app, client);

// Only serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('/var/www/frontend/dist'));

  app.get('*', (req, res) => {
    res.sendFile('/var/www/frontend/dist/index.html');
  });
} else {
  app.get('/', (req, res) => {
    res.send('Server is alive!');
  });
}

app.listen(PORT, () => console.log("Server running on port " + PORT));