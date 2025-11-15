const axios = require('axios');
const NodeCache = require('node-cache');

// Cache search results for 10 minutes
const searchCache = new NodeCache({ stdTTL: 600, checkperiod: 120 });

// Alpha Vantage API Key
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';

class SearchService {
    async searchStocks(query) {
        try {
            // Check cache first
            const cacheKey = `search_${query.toLowerCase()}`;
            const cached = searchCache.get(cacheKey);
            if (cached) {
                console.log('[CACHE] Returning cached search results for:', query);
                return cached;
            }

            console.log('[API] Searching stocks for query:', query);

            // Alpha Vantage SYMBOL_SEARCH endpoint
            const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${ALPHA_VANTAGE_API_KEY}`;

            const response = await axios.get(url);
            const data = response.data;

            // Check for API errors
            if (data['Error Message'] || data['Note']) {
                console.error('Alpha Vantage API error:', data['Error Message'] || data['Note']);
                return this.getFallbackResults(query);
            }

            // Alpha Vantage returns bestMatches array
            const matches = data.bestMatches || [];

            // Map Alpha Vantage format to our format
            const results = matches.map(match => ({
                symbol: match['1. symbol'],
                name: match['2. name'],
                type: match['3. type'],
                region: match['4. region'],
                marketOpen: match['5. marketOpen'],
                marketClose: match['6. marketClose'],
                timezone: match['7. timezone'],
                currency: match['8. currency'],
                matchScore: parseFloat(match['9. matchScore'])
            }));

            // Filter to only show US stocks with high match scores
            const filteredResults = results.filter(result =>
                result.region === 'United States' &&
                result.matchScore > 0.3
            ).slice(0, 10); // Limit to top 10 results

            const result = { results: filteredResults };

            // Cache the results
            searchCache.set(cacheKey, result);

            console.log(`[API] Found ${filteredResults.length} results for "${query}"`);

            return result;

        } catch (error) {
            console.error('Error searching stocks:', error.message);
            console.error('Error stack:', error.stack);

            // Return fallback data
            return this.getFallbackResults(query);
        }
    }

    getFallbackResults(query) {
        console.log('Using fallback search results for:', query);
        return {
            results: [
                {
                    symbol: 'AAPL',
                    name: 'Apple Inc.',
                    type: 'Equity',
                    region: 'United States',
                    marketOpen: '09:30',
                    marketClose: '16:00',
                    timezone: 'UTC-04',
                    currency: 'USD',
                    matchScore: 0.8
                }
            ]
        };
    }
}

module.exports = new SearchService();