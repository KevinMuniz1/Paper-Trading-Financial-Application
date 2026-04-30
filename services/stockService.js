const YahooFinance = require('yahoo-finance2').default;
const NodeCache = require('node-cache');

// Debug what we're getting
console.log('=== YAHOO FINANCE DEBUG ===');
console.log('Default export type:', typeof YahooFinance);
console.log('Is function?', typeof YahooFinance === 'function');
console.log('===========================');

// Create an instance
const yahooFinance = new YahooFinance();

const priceCache = new NodeCache({ stdTTL: 60, checkperiod: 30 });

// Rate limiter: minimum 400ms between actual Yahoo Finance API calls
let lastApiCall = 0;
const MIN_SPACING_MS = 400;
function rateDelay() {
    const wait = MIN_SPACING_MS - (Date.now() - lastApiCall);
    if (wait <= 0) { lastApiCall = Date.now(); return Promise.resolve(); }
    return new Promise(r => setTimeout(() => { lastApiCall = Date.now(); r(); }, wait));
}

class StockService {
    async getCurrentPrice(symbol) {
        try {
            const cachedPrice = priceCache.get(symbol);
            if (cachedPrice !== undefined) {
                return cachedPrice;
            }

            await rateDelay();
            const quote = await yahooFinance.quote(symbol);
            const price = quote.regularMarketPrice;
            priceCache.set(symbol, price);
            console.log(`[API] ${symbol}: $${price}`);
            return price;
        } catch (error) {
            const isRateLimit = error.message.includes('429') || error.message.includes('Too Many');
            if (isRateLimit) {
                const stale = priceCache.get(symbol);
                if (stale !== undefined) return stale;
            }
            console.error(`Error fetching price for ${symbol}:`, error.message);
            const fb = await this.fallbackPrice(symbol);
            return fb;
        }
    }

    async getMultiplePrices(symbols) {
        try {
            const prices = {};
            const warnings = [];

            for (const symbol of symbols) {
                try {
                    const cached = priceCache.get(symbol);
                    if (cached !== undefined) {
                        prices[symbol] = cached;
                        continue;
                    }
                    const price = await this.getCurrentPrice(symbol);
                    prices[symbol] = price;
                } catch (innerErr) {
                    console.error(`Error fetching ${symbol}:`, innerErr.message);
                    const fb = await this.fallbackPrice(symbol);
                    prices[symbol] = fb;
                    warnings.push(`${symbol}: using fallback price (${innerErr.message})`);
                }
            }

            return { prices, warnings };
        } catch (error) {
            console.error('Error fetching multiple prices:', error.message);
            return { prices: {}, warnings: [error.message] };
        }
    }
    
    async fallbackPrice(symbol) {
        // Temporary fallback for testing
        console.log(`Using fallback price for ${symbol}`);
        const fallbackPrices = {
            'AAPL': 150.00,
            'TSLA': 200.00,
            'GOOGL': 130.00,
            'MSFT': 300.00,
            'AMZN': 120.00
        };
        return fallbackPrices[symbol] || 100.00;
    }
}

module.exports = new StockService();