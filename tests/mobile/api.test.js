const request = require('supertest');
const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();

let app;
let client;
let db;

beforeAll(async () => {
  const url = process.env.MONGODB_URL || 'mongodb://localhost:27017/Finance-app-test';
  client = new MongoClient(url);
  await client.connect();
  db = client.db('Finance-app-test-mobile');

  app = express();
  app.use(express.json());
  
  const createApiRouter = require('../../api.js');
  const apiRouter = createApiRouter(client);
  app.use('/api', apiRouter);
});

afterAll(async () => {
  if (db) {
    await db.collection('Users').deleteMany({ Login: { $regex: /^mobiletest/ } });
  }
  if (client) {
    await client.close();
  }
});

describe('Mobile API Tests', () => {
  
  describe('POST /api/login - Mobile', () => {
    test('should handle mobile login request', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          login: 'mobileuser',
          password: 'mobilepass'
        });

      expect(response.status).toBe(400);
      expect(response.body.id).toBe(-1);
      expect(response.body.error).toBe('Invalid login credentials');
    });
  });

  describe('POST /api/register - Mobile', () => {
    test('should handle mobile registration attempt', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          firstName: 'Mobile',
          lastName: 'User',
          email: 'mobile@test.com',
          login: 'mobiletest123',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
    });
  });

  describe('Mobile Trading Features', () => {
    test('should handle mobile trade requests', async () => {
      const response = await request(app)
        .post('/api/searchcards')
        .send({
          userId: 1,
          search: 'AAPL'
        });

      expect(response.status).toBe(404);
    });
  });
});