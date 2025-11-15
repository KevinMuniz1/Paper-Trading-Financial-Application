const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const { PORT, MONGODB_URL } = require('./config');
const { generateEmailVerificationToken } = require('./services/tokenService');
const { sendVerificationEmail } = require('./services/emailService');
const { updatePortfolioTotals, getPortfolioData } = require('./services/portfolioService');
const StockService = require('./services/stockService.js');

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

const apiRoutes = require('./api.js');
apiRoutes.setApp(app, client);

// Mount the API routes on the /api path
app.use('/api', apiRoutes);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'frontend/dist')));


// The "catchall" handler: for any request that doesn't match one above,
// send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
});

// Only serve static files in production
/*if (process.env.NODE_ENV === 'production') {
  app.use(express.static('/var/www/frontend/dist'));

  app.get('*', (req, res) => {
    res.sendFile('/var/www/frontend/dist/index.html');
  });
} else {
  app.get('/', (req, res) => {
    res.send('Server is alive!');
  });
}*/

app.listen(PORT, () => console.log("Server running on port " + PORT));