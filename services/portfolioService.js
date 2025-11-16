const stockService = require('./stockService');

// Update portfolio totals
async function updatePortfolioTotals(userId, db) {
    try {
        // Get all user trades
        const trades = await db.collection('Trades')
            .find({ userId: parseInt(userId) })
            .toArray();

        if (trades.length === 0) {
            // No trades, reset portfolio
            await db.collection('Portfolio').updateOne(
                { userId: parseInt(userId) },
                {
                    $set: {
                        totalPortfolioValue: 0.00,
                        totalInvested: 0.00,
                        totalGain: 0.00,
                        totalGainPercent: 0.00,
                        lastUpdated: new Date()
                    }
                }
            );
            return;
        }

        // Get current prices for all symbols
        const symbols = [...new Set(trades.map(trade => trade.tickerSymbol))];
        const currentPrices = await stockService.getMultiplePrices(symbols);

        let totalInvested = 0;
        let totalPortfolioValue = 0;

        // Update each trade and calculate totals
        for (const trade of trades) {
            const currentPrice = currentPrices[trade.tickerSymbol] || trade.purchasePrice;
            const currentValue = currentPrice * trade.shares;
            const gain = currentValue - trade.totalCost;
            const gainPercent = trade.totalCost > 0 ? (gain / trade.totalCost) * 100 : 0;

            totalInvested += trade.totalCost;
            totalPortfolioValue += currentValue;

            // Update trade with current data
            await db.collection('Trades').updateOne(
                { _id: trade._id },
                {
                    $set: {
                        currentPrice: currentPrice,
                        currentValue: currentValue,
                        gain: gain,
                        gainPercent: gainPercent
                    }
                }
            );
        }

        const totalGain = totalPortfolioValue - totalInvested;
        const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

        // Update portfolio summary
        await db.collection('Portfolio').updateOne(
            { userId: parseInt(userId) },
            {
                $set: {
                    totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100,
                    totalInvested: Math.round(totalInvested * 100) / 100,
                    totalGain: Math.round(totalGain * 100) / 100,
                    totalGainPercent: Math.round(totalGainPercent * 100) / 100,
                    lastUpdated: new Date()
                }
            }
        );

        console.log(`Portfolio updated for user ${userId}: $${totalPortfolioValue.toFixed(2)}`);
    } catch (error) {
        console.error('Error updating portfolio totals:', error.message);
    }
}

// Get complete portfolio data
async function getPortfolioData(userId, db) {
    try {
        const portfolio = await db.collection('Portfolio').findOne({ userId: parseInt(userId) });
        const trades = await db.collection('Trades')
            .find({ userId: parseInt(userId) })
            .sort({ purchaseDate: -1 })
            .toArray();

        return {
            portfolio: portfolio,
            holdings: trades
        };
    } catch (error) {
        console.error('Error getting portfolio data:', error.message);
        throw error;
    }
}

module.exports = {
    updatePortfolioTotals,
    getPortfolioData
};