// config.js
const os = require('os');
require('dotenv').config();

let defaultPort = 5000;
if (os.platform() === 'darwin') {
  // macOS Control Center uses 5000, so default to 5050
  defaultPort = 5050;
}

const PORT = process.env.PORT || defaultPort;
// Fallback to provided MongoDB URL if env not set
const MONGODB_URL = process.env.MONGODB_URL || "mongodb+srv://admin:password123**@finance-app.ilbngw2.mongodb.net/?retryWrites=true&w=majority&appName=Finance-app";

// News API Key
const NEWS_API_KEY = process.env.NEWS_API_KEY || '8e62bb8c-c575-44ed-9c4c-69477d822e95';
module.exports = { PORT, MONGODB_URL, NEWS_API_KEY };
