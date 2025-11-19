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
            const currentValue = currentPrice * trade.quantity;
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

        // Record a snapshot for historical tracking
        await recordPortfolioSnapshot(userId, db);

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

        // Format holdings to include proper field names for mobile compatibility
        const formattedHoldings = trades.map(trade => ({
            id: trade._id.toString(), // Convert ObjectId to string for consistency
            symbol: trade.tickerSymbol,
            name: trade.cardName, // Map cardName to name for mobile app
            quantity: trade.quantity,
            purchasePrice: trade.purchasePrice,
            currentPrice: trade.currentPrice,
            totalCost: trade.totalCost,
            currentValue: trade.currentValue,
            gain: trade.gain,
            gainPercent: trade.gainPercent,
            purchaseDate: trade.purchaseDate
        }));

        return {
            portfolio: portfolio,
            holdings: formattedHoldings
        };
    } catch (error) {
        console.error('Error getting portfolio data:', error.message);
        throw error;
    }
}

// Record portfolio value snapshot for history tracking
async function recordPortfolioSnapshot(userId, db) {
    try {
        const portfolio = await db.collection('Portfolio').findOne({ userId: parseInt(userId) });
        
        if (!portfolio) {
            console.log(`No portfolio found for user ${userId}`);
            return;
        }

        const snapshot = {
            userId: parseInt(userId),
            timestamp: new Date(),
            totalPortfolioValue: portfolio.totalPortfolioValue || 0,
            buyingPower: portfolio.buyingPower || 0,
            totalValue: (portfolio.totalPortfolioValue || 0) + (portfolio.buyingPower || 0),
            totalGain: portfolio.totalGain || 0,
            totalGainPercent: portfolio.totalGainPercent || 0
        };

        await db.collection('PortfolioHistory').insertOne(snapshot);
        
        // Keep only the last 100 snapshots per user to prevent database bloat
        const count = await db.collection('PortfolioHistory').countDocuments({ userId: parseInt(userId) });
        if (count > 100) {
            const oldSnapshots = await db.collection('PortfolioHistory')
                .find({ userId: parseInt(userId) })
                .sort({ timestamp: 1 })
                .limit(count - 100)
                .toArray();
            
            const idsToDelete = oldSnapshots.map(s => s._id);
            await db.collection('PortfolioHistory').deleteMany({ _id: { $in: idsToDelete } });
        }

        console.log(`Portfolio snapshot recorded for user ${userId}`);
    } catch (error) {
        console.error('Error recording portfolio snapshot:', error.message);
    }
}

// Get portfolio value history
async function getPortfolioHistory(userId, db, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const history = await db.collection('PortfolioHistory')
            .find({
                userId: parseInt(userId),
                timestamp: { $gte: startDate }
            })
            .sort({ timestamp: 1 })
            .toArray();

        return history.map(snapshot => ({
            timestamp: snapshot.timestamp,
            totalValue: snapshot.totalValue,
            totalPortfolioValue: snapshot.totalPortfolioValue,
            buyingPower: snapshot.buyingPower,
            totalGain: snapshot.totalGain,
            totalGainPercent: snapshot.totalGainPercent
        }));
    } catch (error) {
        console.error('Error getting portfolio history:', error.message);
        throw error;
    }
}

module.exports = {
    updatePortfolioTotals,
    getPortfolioData,
    recordPortfolioSnapshot,
    getPortfolioHistory
};