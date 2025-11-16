const YahooFinance = require('yahoo-finance2').default;
const NodeCache = require('node-cache');

// Debug what we're getting
console.log('=== YAHOO FINANCE DEBUG ===');
console.log('Default export type:', typeof YahooFinance);
console.log('Is function?', typeof YahooFinance === 'function');
console.log('===========================');

// Create an instance
const yahooFinance = new YahooFinance();

const priceCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

class StockService {
    async getCurrentPrice(symbol) {
        try {
            // Check cache first
            const cachedPrice = priceCache.get(symbol);
            if (cachedPrice) {
                console.log(`[CACHE] ${symbol}: $${cachedPrice}`);
                return cachedPrice;
            }

            console.log(`[API] Fetching ${symbol}...`);
            const quote = await yahooFinance.quote(symbol);
            const price = quote.regularMarketPrice;
            
            // Cache the price
            priceCache.set(symbol, price);
            
            console.log(` [API] ${symbol}: $${price}`);
            return price;
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error.message);
            return await this.fallbackPrice(symbol);
        }
    }

    async getMultiplePrices(symbols) {
        try {
            const prices = {};
            
            // Fetch prices for all symbols
            for (const symbol of symbols) {
                const price = await this.getCurrentPrice(symbol);
                prices[symbol] = price;
            }
            
            return prices;
        } catch (error) {
            console.error('Error fetching multiple prices:', error.message);
            return {};
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