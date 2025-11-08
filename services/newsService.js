//Currently Disabled News Fetch due to bugs
const axios = require('axios');
require('dotenv').config();
const { NEWS_API_KEY } = require('../config');

class NewsService {
  constructor() {
    this.API_KEY = process.env.NEWS_API_KEY || NEWS_API_KEY;
    this.EVERYTHING_URL = 'https://newsapi.org/v2/everything';
    this.TOP_HEADLINES_URL = 'https://newsapi.org/v2/top-headlines';
    this.MEMORY_TTL = 60 * 60 * 1000; // 1 hour
    this.DB_TTL = 2 * 60 * 60 * 1000; // 2 hours
    this.cached = null;
    this.cachedAt = 0;
    this.db = null;
    this.KEYWORDS = [
      'Apple', 'Microsoft', 'Alphabet', 'Google', 'Nvidia', 'Meta', 'Amazon', 'Netflix', 'Tesla',
      'stock market', 'equities', 'Wall Street'
    ];
  }

  setDb(db) { this.db = db; }

  _memoryFresh() { return this.cached && (Date.now() - this.cachedAt) < this.MEMORY_TTL; }

  _norm(a) {
    const d = a.publishedAt ? new Date(a.publishedAt) : new Date();
    return {
      title: a.title || '',
      url: a.url || '',
      summary: a.description || a.content || '',
      source: a.source?.name || '',
      publishedAt: isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString()
    };
  }

  async _fetchEverything() {
    const q = this.KEYWORDS.map(k => `"${k}"`).join(' OR ');
    const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const params = { q: `(${q})`, language: 'en', from: fromDate, sortBy: 'publishedAt', pageSize: 100 };
    try {
      const r = await axios.get(this.EVERYTHING_URL, { params, headers: { 'X-Api-Key': this.API_KEY } });
      if (!r.data?.articles) return [];
      return r.data.articles.map(a => this._norm(a));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      const status = err.response?.data?.status || err.response?.status;
      console.error('NewsAPI everything error:', status, msg);
      return [];
    }
  }

  async _fetchHeadlinesFallback() {
    const params = { category: 'business', country: 'us', pageSize: 60 };
    try {
      const r = await axios.get(this.TOP_HEADLINES_URL, { params, headers: { 'X-Api-Key': this.API_KEY } });
      if (!r.data?.articles) return [];
      return r.data.articles.map(a => this._norm(a));
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      const status = err.response?.data?.status || err.response?.status;
      console.error('NewsAPI headlines error:', status, msg);
      return [];
    }
  }

  async getMarketNews() {
    if (!this.db) throw new Error('DB not initialized');
    if (this._memoryFresh()) return this.cached;

    const collection = this.db.collection('MarketNewsCache');
    const now = Date.now();
    const doc = await collection.findOne({ key: 'latest' });
    if (doc && doc.lastUpdated && (now - doc.lastUpdated) < this.DB_TTL) {
      this.cached = doc.articles; this.cachedAt = now; return doc.articles;
    }

    let articles = await this._fetchEverything();
    if (articles.length === 0) {
      console.warn('Everything endpoint empty, using fallback');
      articles = await this._fetchHeadlinesFallback();
    }

    // Dedupe & sort
    const seen = new Set();
    articles = articles.filter(a => { if (!a.url || seen.has(a.url)) return false; seen.add(a.url); return true; });
    articles.sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    const top10 = articles.slice(0, 10);

    await collection.updateOne({ key: 'latest' }, { $set: { key: 'latest', articles: top10, lastUpdated: now } }, { upsert: true });
    this.cached = top10; this.cachedAt = now;
    return top10;
  }
}

module.exports = new NewsService();
