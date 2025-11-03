require('dotenv').config(); 
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URL:', process.env.MONGODB_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Read config
const { PORT, MONGODB_URL } = require('./config');
console.log('Config values:');
console.log('PORT from config:', PORT);
console.log('MONGODB_URL from config:', MONGODB_URL);