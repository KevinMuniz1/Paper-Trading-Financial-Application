/**
 * seed.js — Inserts a demo user + realistic fake portfolio into MongoDB.
 * Run once:  node seed.js
 *
 * Demo credentials:
 *   Username : demo
 *   Password : demo123
 */

const { MongoClient } = require('mongodb');
const { MONGODB_URL } = require('./config');

const DEMO_USER_ID = 9999;

const TRADES = [
  { tickerSymbol: 'AAPL',  cardName: 'Apple Inc.',              quantity: 25,  purchasePrice: 172.50, purchaseDate: new Date('2024-09-12') },
  { tickerSymbol: 'MSFT',  cardName: 'Microsoft Corporation',   quantity: 12,  purchasePrice: 378.20, purchaseDate: new Date('2024-08-03') },
  { tickerSymbol: 'NVDA',  cardName: 'NVIDIA Corporation',      quantity: 8,   purchasePrice: 820.00, purchaseDate: new Date('2024-10-01') },
  { tickerSymbol: 'GOOGL', cardName: 'Alphabet Inc.',           quantity: 15,  purchasePrice: 168.40, purchaseDate: new Date('2024-07-22') },
  { tickerSymbol: 'AMZN',  cardName: 'Amazon.com Inc.',         quantity: 20,  purchasePrice: 188.75, purchaseDate: new Date('2024-11-05') },
  { tickerSymbol: 'META',  cardName: 'Meta Platforms Inc.',     quantity: 10,  purchasePrice: 505.30, purchaseDate: new Date('2024-06-18') },
  { tickerSymbol: 'TSLA',  cardName: 'Tesla Inc.',              quantity: 18,  purchasePrice: 215.00, purchaseDate: new Date('2024-12-02') },
  { tickerSymbol: 'JPM',   cardName: 'JPMorgan Chase & Co.',    quantity: 22,  purchasePrice: 195.60, purchaseDate: new Date('2024-05-14') },
  { tickerSymbol: 'V',     cardName: 'Visa Inc.',               quantity: 30,  purchasePrice: 265.40, purchaseDate: new Date('2024-04-09') },
  { tickerSymbol: 'NFLX',  cardName: 'Netflix Inc.',            quantity: 7,   purchasePrice: 680.00, purchaseDate: new Date('2024-03-27') },
];

async function seed() {
  const client = new MongoClient(MONGODB_URL);

  try {
    await client.connect();
    const db = client.db('Finance-app');
    console.log('Connected to MongoDB');

    // ── Remove any previous demo data ──────────────────────
    await db.collection('Users').deleteOne({ UserID: DEMO_USER_ID });
    await db.collection('Portfolio').deleteOne({ userId: DEMO_USER_ID });
    await db.collection('Trades').deleteMany({ userId: DEMO_USER_ID });
    console.log('Cleared previous demo data');

    // ── Insert demo user ────────────────────────────────────
    await db.collection('Users').insertOne({
      UserID: DEMO_USER_ID,
      FirstName: 'Demo',
      LastName: 'User',
      Email: 'demo@simpltrade.com',
      Login: 'demo',
      Password: 'demo123',
      isEmailVerified: true,
      createdAt: new Date(),
    });
    console.log('Created demo user  (login: demo / password: demo123)');

    // ── Build trade documents ───────────────────────────────
    const tradeDocs = TRADES.map(t => {
      const totalCost = t.quantity * t.purchasePrice;
      return {
        userId: DEMO_USER_ID,
        tickerSymbol: t.tickerSymbol,
        cardName: t.cardName,
        quantity: t.quantity,
        purchasePrice: t.purchasePrice,
        currentPrice: t.purchasePrice,   // backend enriches this on read
        totalCost,
        currentValue: totalCost,
        gain: 0,
        gainPercent: 0,
        purchaseDate: t.purchaseDate,
        createdAt: new Date(),
      };
    });

    await db.collection('Trades').insertMany(tradeDocs);
    console.log(`Inserted ${tradeDocs.length} positions`);

    // ── Compute portfolio totals ────────────────────────────
    const totalInvested = tradeDocs.reduce((s, t) => s + t.totalCost, 0);
    const buyingPower   = 24_580.75;   // leftover cash
    const totalPortfolioValue = totalInvested + buyingPower;

    await db.collection('Portfolio').insertOne({
      userId: DEMO_USER_ID,
      buyingPower,
      totalPortfolioValue,
      totalInvested,
      totalGain: 0,
      totalGainPercent: 0,
      lastUpdated: new Date(),
      createdAt: new Date(),
    });
    console.log(`Portfolio seeded  (invested: $${totalInvested.toFixed(2)}, cash: $${buyingPower.toFixed(2)})`);

    // ── Seed a small watchlist ──────────────────────────────
    const watchlistItems = ['SPY', 'QQQ', 'AMD', 'CRM', 'PLTR'].map(sym => ({
      userId: DEMO_USER_ID,
      symbol: sym,
      addedAt: new Date(),
    }));

    // Only insert if collection exists + no dupes
    for (const item of watchlistItems) {
      await db.collection('Watchlist').updateOne(
        { userId: DEMO_USER_ID, symbol: item.symbol },
        { $setOnInsert: item },
        { upsert: true }
      );
    }
    console.log(`Watchlist seeded  (${watchlistItems.length} symbols)`);

    console.log('\nDone! Log in with:');
    console.log('  Username : demo');
    console.log('  Password : demo123');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seed();
