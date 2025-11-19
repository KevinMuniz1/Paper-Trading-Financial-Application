const axios = require('axios');
const NodeCache = require('node-cache');

// Cache top movers for 5 minutes
const moversCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Alpha Vantage API Key - you'll need to add this to your .env file
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

class TopMoversService {
    async getTopMovers() {
        try {
            // Check cache first
            const cached = moversCache.get('topMovers');
            if (cached) {
                console.log('[CACHE] Returning cached top movers');
                return cached;
            }

            console.log('[API] Fetching top movers from Alpha Vantage...');

            // Alpha Vantage TOP_GAINERS_LOSERS endpoint
            const url = `https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS&apikey=${ALPHA_VANTAGE_API_KEY}`;

            const response = await axios.get(url);
            const data = response.data;

            // Check for API errors
            if (data['Error Message'] || data['Note']) {
                const errorMsg = data['Error Message'] || data['Note'];
                console.error('Alpha Vantage API error:', errorMsg);
                console.error('Full response:', JSON.stringify(data, null, 2));
                return this.getFallbackMovers();
            }
            
            // Check if response is empty or missing expected data
            if (!data.top_gainers || !data.top_losers) {
                console.warn('Alpha Vantage response missing data:', {
                  hasGainers: !!data.top_gainers,
                  hasLosers: !!data.top_losers,
                  dataKeys: Object.keys(data)
                });
                return this.getFallbackMovers();
            }

            // Alpha Vantage returns top_gainers, top_losers, and most_actively_traded arrays
            const gainersData = data.top_gainers || [];
            const losersData = data.top_losers || [];

            // Map Alpha Vantage format to our format
            const gainers = gainersData.slice(0, 15).map(stock => ({
                symbol: stock.ticker,
                name: stock.ticker, // Alpha Vantage doesn't provide full names in this endpoint
                price: parseFloat(stock.price),
                change: parseFloat(stock.change_amount),
                changePercent: parseFloat(stock.change_percentage.replace('%', '')),
                volume: parseInt(stock.volume),
                marketCap: 0 // Not provided by this endpoint
            }));

            const losers = losersData.slice(0, 15).map(stock => ({
                symbol: stock.ticker,
                name: stock.ticker,
                price: parseFloat(stock.price),
                change: parseFloat(stock.change_amount),
                changePercent: parseFloat(stock.change_percentage.replace('%', '')),
                volume: parseInt(stock.volume),
                marketCap: 0
            }));

            const result = { gainers, losers };

            // Cache the results
            moversCache.set('topMovers', result);

            console.log(`[API] Fetched ${gainers.length} gainers and ${losers.length} losers`);
            if (gainers.length > 0) {
                console.log(`Top gainer: ${gainers[0]?.symbol} (+${gainers[0]?.changePercent.toFixed(2)}%)`);
            }
            if (losers.length > 0) {
                console.log(`Top loser: ${losers[0]?.symbol} (${losers[0]?.changePercent.toFixed(2)}%)`);
            }

            return result;

        } catch (error) {
            console.error('Error fetching top movers:', error.message);
            console.error('Error stack:', error.stack);

            // Return fallback data
            return this.getFallbackMovers();
        }
    }

    getFallbackMovers() {
        console.log('Using fallback top movers data');
        return {
            gainers: [
                { symbol: 'AAPL', name: 'Apple Inc.', price: 150.00, change: 3.50, changePercent: 2.39, volume: 50000000, marketCap: 2400000000000 },
                { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 450.00, change: 8.00, changePercent: 1.81, volume: 45000000, marketCap: 1100000000000 },
                { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 120.00, change: 2.00, changePercent: 1.69, volume: 55000000, marketCap: 1240000000000 }
            ],
            losers: [
                { symbol: 'TSLA', name: 'Tesla, Inc.', price: 200.00, change: -5.00, changePercent: -2.44, volume: 80000000, marketCap: 630000000000 },
                { symbol: 'META', name: 'Meta Platforms, Inc.', price: 320.00, change: -6.50, changePercent: -1.99, volume: 20000000, marketCap: 820000000000 }
            ]
        };
    }
}

module.exports = new TopMoversService();