// News fetching service integrating with NewsAPI
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
  this.MAX_PAGES_EVERYTHING = 3; // paginate to include older items within window
  this.MAX_PAGES_HEADLINES = 2;
    this.KEYWORDS = [
      // Indexes & market terms
      'stock market', 'stocks', 'equities', 'Wall Street', 'Dow Jones', 'S&P 500', 'Nasdaq',
      'earnings', 'earnings call', 'guidance', 'outlook', 'buyback', 'dividend', 'IPO',
      'Federal Reserve', 'Fed', 'interest rates', 'inflation', 'CPI', 'PPI', 'jobs report', 'GDP', 'recession', 'soft landing',

      // AI & innovation
      'AI', 'artificial intelligence', 'machine learning', 'deep learning', 'generative AI', 'ChatGPT', 'OpenAI',
      'Copilot', 'robotics', 'humanoid robots', 'quantum computing', 'semiconductor', 'chip stocks', 'data center',
      'cloud computing', 'SaaS', 'cybersecurity', '5G', '6G', 'EV', 'electric vehicles', 'autonomous driving', 'self-driving',
      'AR', 'VR', 'XR', 'spatial computing',

      // Mega-cap and big tech
      'Apple', 'Microsoft', 'Alphabet', 'Google', 'Nvidia', 'Meta', 'Facebook', 'Amazon', 'Netflix', 'Tesla',

      // Chips & hardware
      'AMD', 'Intel', 'TSMC', 'Taiwan Semiconductor', 'Broadcom', 'Qualcomm', 'ASML', 'ARM', 'Micron',

      // Enterprise software & cloud
      'IBM', 'Oracle', 'SAP', 'Salesforce', 'Adobe', 'Snowflake', 'ServiceNow', 'MongoDB', 'Elastic', 'Atlassian',

      // Security & infra
      'CrowdStrike', 'Palo Alto Networks', 'Zscaler', 'Okta', 'Fortinet', 'Cloudflare', 'Datadog',

      // Consumer/internet/platforms
      'Uber', 'Lyft', 'Airbnb', 'DoorDash', 'Shopify', 'PayPal', 'Block', 'Square', 'Coinbase', 'Robinhood',

      // Notable leaders & investors
      'Elon Musk', 'Tim Cook', 'Satya Nadella', 'Sundar Pichai', 'Mark Zuckerberg', 'Jensen Huang', 'Lisa Su', 'Pat Gelsinger',
      'Jeff Bezos', 'Warren Buffett', 'Cathie Wood', 'Sam Altman',

      // Apple eco / devices
      'iPhone', 'iPad', 'Mac', 'MacBook', 'Apple Vision Pro'
    ];

    // Finance-focused sources allowlist (matched against source name and URL domain)
    this.FINANCE_SOURCES = [
      'yahoo finance', 'reuters', 'bloomberg', 'cnbc', 'marketwatch', 'the motley fool',
      'investing.com', 'investing', 'barron\'s', 'the wall street journal', 'wsj', 'seeking alpha',
      'thestreet', 'morningstar', 'financial times', 'ft', 'forbes', 'business insider', 'fortune',
      'benzinga', 'nasdaq', 'zacks', "investor's business daily", 'tipranks', 'marketbeat'
    ];
    this.FINANCE_DOMAINS = [
      'finance.yahoo.com', 'reuters.com', 'bloomberg.com', 'cnbc.com', 'marketwatch.com', 'fool.com',
      'investing.com', 'barrons.com', 'wsj.com', 'seekingalpha.com', 'thestreet.com', 'morningstar.com',
      'ft.com', 'forbes.com', 'businessinsider.com', 'fortune.com', 'financialpost.com', 'investopedia.com',
      'benzinga.com', 'nasdaq.com', 'zacks.com', 'investors.com', 'tipranks.com', 'marketbeat.com',
      'thefly.com'
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

  _domainFromUrl(url) {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      return '';
    }
  }

  _isEnglishTitle(title) {
    if (!title || typeof title !== 'string') return false;
    // Reject obvious non-Latin scripts (Cyrillic, CJK, Japanese, Korean)
    if (/[\u0400-\u04FF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(title)) return false;
    const latin = (title.match(/[A-Za-z]/g) || []).length;
    return latin >= Math.max(1, Math.floor(title.length * 0.1));
  }

  _isFinanceSource(article) {
    const name = (article.source || '').toLowerCase();
    const domain = this._domainFromUrl(article.url);
    const nameOk = this.FINANCE_SOURCES.some(s => name.includes(s));
    const domainOk = this.FINANCE_DOMAINS.some(d => domain.endsWith(d));
    return nameOk || domainOk;
  }

  async _fetchEverything() {
    const q = this.KEYWORDS.map(k => `"${k}"`).join(' OR ');
    // Fetch within the past 20 days to include older items in this window
    const fromDate = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = new Date().toISOString().split('T')[0];
    const pageSize = 100;
    const headers = { 'X-Api-Key': this.API_KEY };
    const all = [];
    for (let page = 1; page <= this.MAX_PAGES_EVERYTHING; page++) {
      const params = { q: `(${q})`, language: 'en', from: fromDate, to: toDate, sortBy: 'publishedAt', pageSize, page };
      try {
        const r = await axios.get(this.EVERYTHING_URL, { params, headers });
        const items = r.data?.articles || [];
        all.push(...items.map(a => this._norm(a)));
        // Stop early if fewer than a full page returned
        if (items.length < pageSize) break;
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        const status = err.response?.data?.status || err.response?.status;
        console.error('NewsAPI everything error (page', page, '):', status, msg);
        break;
      }
    }
    return all;
  }

  async _fetchHeadlinesFallback() {
    const headers = { 'X-Api-Key': this.API_KEY };
    const pageSize = 50;
    const all = [];
    console.log('[NEWS] _fetchHeadlinesFallback: Using API key:', this.API_KEY.substring(0, 5) + '...');
    for (let page = 1; page <= this.MAX_PAGES_HEADLINES; page++) {
      const params = { category: 'business', country: 'us', pageSize, page };
      try {
        const r = await axios.get(this.TOP_HEADLINES_URL, { params, headers });
        const items = r.data?.articles || [];
        all.push(...items.map(a => this._norm(a)));
        console.log('[NEWS] _fetchHeadlinesFallback page', page, ':', items.length, 'articles');
        if (items.length < pageSize) break;
      } catch (err) {
        const msg = err.response?.data?.message || err.message;
        const status = err.response?.data?.status || err.response?.status;
        console.error('[NEWS] _fetchHeadlinesFallback error (page', page, '):', status, msg);
        break;
      }
    }
    console.log('[NEWS] _fetchHeadlinesFallback total:', all.length, 'articles');
    return all;
  }

  async getMarketNews(options = {}) {
    const { bustCache = false } = options;
    if (!this.db) throw new Error('DB not initialized');
    if (!bustCache && this._memoryFresh()) {
      const filteredMem = (this.cached || []).filter(a => this._isEnglishTitle(a.title) && this._isFinanceSource(a));
      if (filteredMem.length !== (this.cached || []).length) this.cached = filteredMem;
      return filteredMem;
    }

    const collection = this.db.collection('MarketNewsCache');
    const now = Date.now();
    const doc = await collection.findOne({ key: 'latest' });
    if (!bustCache && doc && doc.lastUpdated && (now - doc.lastUpdated) < this.DB_TTL) {
      const filteredDb = (doc.articles || []).filter(a => this._isEnglishTitle(a.title) && this._isFinanceSource(a));
      this.cached = filteredDb; this.cachedAt = now; return filteredDb;
    }

    let articles = await this._fetchEverything();
    if (articles.length === 0) {
      console.warn('Everything endpoint empty, using fallback');
      articles = await this._fetchHeadlinesFallback();
    }

    // Language and source filtering
    articles = articles.filter(a => this._isEnglishTitle(a.title) && this._isFinanceSource(a));

    // Dedupe & sort
    const seen = new Set();
    articles = articles.filter(a => { if (!a.url || seen.has(a.url)) return false; seen.add(a.url); return true; });
    articles.sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt));
    const topN = articles.slice(0, 25);

    // Avoid caching empty results to prevent stale empties
    if (topN.length > 0) {
      await collection.updateOne(
        { key: 'latest' },
        { $set: { key: 'latest', articles: topN, lastUpdated: now } },
        { upsert: true }
      );
      this.cached = topN; this.cachedAt = now;
    } else {
      console.warn('NewsService: No articles fetched; skipping cache write');
    }
    return topN;
  }
}

module.exports = new NewsService();
