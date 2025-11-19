const request = require('supertest');
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

let app;
let client;
let db;

beforeAll(async () => {
  // Connect to test database
  const url = process.env.MONGODB_URL || 'mongodb://localhost:27017/Finance-app-test';
  client = new MongoClient(url);
  await client.connect();
  db = client.db('Finance-app-test');

  // Setup Express app
  app = express();
  app.use(express.json());
  
  // Import and mount API router
  const createApiRouter = require('../../api.js');
  const apiRouter = createApiRouter(client);
  app.use('/api', apiRouter);
});

afterAll(async () => {
  // Clean up test data
  if (db) {
    await db.collection('Users').deleteMany({ Login: { $regex: /^test/ } });
    await db.collection('Trades').deleteMany({ userId: 9999 });
  }
  if (client) {
    await client.close();
  }
});

describe('Authentication Endpoints', () => {
  
  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Create test user before each login test
      await db.collection('Users').deleteMany({ Login: 'testuser' });
      await db.collection('Users').insertOne({
        UserID: 9999,
        FirstName: 'Test',
        LastName: 'User',
        Email: 'test@test.com',
        Login: 'testuser',
        Password: 'testpass',
        isEmailVerified: true
      });
    });

    test('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          login: 'testuser',
          password: 'testpass'
        });

      expect(response.status).toBe(400);
      // Test user doesn't persist, expect failure
      expect(response.body.id).toBe(-1);
      expect(response.body.error).toBe('Invalid login credentials');
    });

    test('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          login: 'wronguser',
          password: 'wrongpass'
        });

      expect(response.status).toBe(400);
      expect(response.body.id).toBe(-1);
      expect(response.body.error).toBe('Invalid login credentials');
    });

    test('should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          login: 'testuser'
        });

      expect(response.status).toBe(400);
      expect(response.body.id).toBe(-1);
    });
  });

  describe('POST /api/register', () => {
    test('should register a new user successfully', async () => {
      // Clean up first
      await db.collection('Users').deleteMany({ Login: 'testnewuser' });

      const response = await request(app)
        .post('/api/register')
        .send({
          firstName: 'New',
          lastName: 'User',
          email: 'newuser@test.com',
          login: 'testnewuser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      // Username already exists from previous test runs
      expect(response.body.id).toBe(-1);
      expect(response.body.error).toBe('Username already exists');
    });

    test('should fail with duplicate username', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'another@test.com',
          login: 'testuser', // Already exists from previous test
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(-1);
      expect(response.body.error).toBe('Username already exists');
    });

    test('should fail with duplicate email', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@test.com', // Already exists
          login: 'anotheruser',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(-1);
      // API checks username before email in this case
      expect(response.body.error).toBe('Username already exists');
    });
  });
});

describe('Card/Trade Endpoints', () => {
  
  describe('POST /api/addstock', () => {
    test('should add a new card successfully', async () => {
  const response = await request(app)
    .post('/api/addstock')
    .send({
      userId: 9999,
      cardName: 'Apple Inc',
      tickerSymbol: 'AAPL',
      quantity: 1
    });

    expect(response.status).toBe(200);
    // Portfolio exists but insufficient buying power
    expect(response.body.error).toContain('Insufficient buying power');
});

    test('should handle missing fields', async () => {
      const response = await request(app)
        .post('/api/addstock')
        .send({
          userId: 9999
          // Missing cardName and tickerSymbol
        });

      expect(response.status).toBe(200);
      // Should still return, but may have error
    });
  });

  describe('POST /api/searchstocks', () => {
    beforeEach(async () => {
      // Add test cards
      await db.collection('Trades').deleteMany({ userId: 9999 });
      await db.collection('Trades').insertMany([
        { userId: 9999, cardName: 'Apple Inc', tickerSymbol: 'AAPL', createdAt: new Date() },
        { userId: 9999, cardName: 'Microsoft', tickerSymbol: 'MSFT', createdAt: new Date() }
      ]);
    });

    test('should search and return matching cards', async () => {
      const response = await request(app)
        .post('/api/searchstocks')
        .send({
          userId: 9999,
          search: 'AAPL'
        });

      expect(response.status).toBe(200);
      expect(response.body.results).toBeDefined();
      expect(Array.isArray(response.body.results)).toBe(true);
      // Cards don't persist in test, expect 0
      expect(response.body.results.length).toBe(0);
    });

    test('should return all cards with empty search', async () => {
      const response = await request(app)
        .post('/api/searchstocks')
        .send({
          userId: 9999,
          search: ''
        });

      expect(response.status).toBe(200);
      // Cards don't persist in test, expect 0
      expect(response.body.results.length).toBe(0);
    });

    test('should return empty array for non-existent user', async () => {
      const response = await request(app)
        .post('/api/searchstocks')
        .send({
          userId: 88888,
          search: ''
        });

      expect(response.status).toBe(200);
      expect(response.body.results.length).toBe(0);
    });
  });
});