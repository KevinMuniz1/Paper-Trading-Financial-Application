require('dotenv').config(); 
console.log('Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URL:', process.env.MONGODB_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('JWT Secret:', process.env.JWT_SECRET);
console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY);


// Read config
const { PORT, MONGODB_URL } = require('./config');
console.log('Config values:');
console.log('PORT from config:', PORT);
console.log('MONGODB_URL from config:', MONGODB_URL);