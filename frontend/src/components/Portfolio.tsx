import { useState, useEffect } from 'react';
import './Portfolio.css';

function Portfolio() {
    const [stocks, setStocks] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getUserPortfolio();
    }, []);

    async function getUserPortfolio() {
        try {
            setLoading(true);
            setError('');

            // Get userId from localStorage
            const userId = localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data') || '{}').id : null;
            
            if (!userId) {
                setError('User ID not found. Please log in again.');
                setLoading(false);
                return;
            }

            // Call the API to get all user's stocks (empty search gets all)
            const response = await fetch('/api/searchcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: parseInt(userId),
                    search: '' // Empty search returns all cards
                })
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
                setStocks([]);
            } else {
                // The API returns formatted strings like "cardName (TICKER)"
                setStocks(data.results || []);
            }
        } catch (err) {
            setError('Failed to load portfolio. Please try again.');
            console.error('Portfolio fetch error:', err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="portfolio-container">
                <div className="loading-spinner">Loading your portfolio...</div>
            </div>
        );
    }

    return (
        <div className="portfolio-container">
            <h2>Your Portfolio</h2>
            
            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {stocks.length === 0 ? (
                <div className="empty-portfolio">
                    <p>You haven't added any stocks yet.</p>
                    <p>Start by searching for and adding stocks to your portfolio!</p>
                </div>
            ) : (
                <div className="stocks-grid">
                    {stocks.map((stock, index) => (
                        <div key={index} className="stock-card">
                            <div className="stock-header">
                                <h3>{stock}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Portfolio;
