
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb'); 

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://paper-trade-app.com'],
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

var api = require('./api.js');
api.setApp( app, client );

app.get('/', (req, res) => {
  res.send('Server is alive!');
});

app.listen(5000, () => console.log("Server running on port 5000"));

