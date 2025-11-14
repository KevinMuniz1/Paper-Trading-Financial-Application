const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb'); 
const { PORT, MONGODB_URL } = require('./config');
require('dotenv').config(); 

const app = express();

// CORS configuration: allow specific origins including localhost:5050
const allowedOrigins = [
  'http://localhost:5050',
  'http://localhost:5173',
  'http://paper-trade-app.com',
  'http://www.paper-trade-app.com',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl)
    if (!origin) return callback(null, true);

    // Allow any localhost or 127.0.0.1 origin (any port) during development
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (isLocalhost || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

const client = new MongoClient(MONGODB_URL);

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
  app.use(express.static('/var/www/html'));
  
  app.get('*', (req, res) => {
    res.sendFile('/var/www/html/index.html');
  });
} else {
  app.get('/', (req, res) => {
    res.send('Server is alive!');
  });
}

app.listen(PORT, () => console.log("Server running on port " + PORT));