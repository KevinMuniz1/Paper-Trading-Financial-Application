// config.js
const os = require('os');
require('dotenv').config();

let defaultPort = 5000;
if (os.platform() === 'darwin') {
  // macOS Control Center uses 5000, so default to 5050
  defaultPort = 5050;
}

const PORT = process.env.PORT || defaultPort;
const MONGODB_URL = process.env.MONGODB_URL;

module.exports = { PORT, MONGODB_URL };
