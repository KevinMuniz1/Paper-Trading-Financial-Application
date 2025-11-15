import { useState, useEffect } from 'react';
import { buildPath } from "../../Path";
import './BrowsePage.css';

interface Article {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: string;
    ticker: string | null;
}

interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
    marketCap: number;
}

const BrowsePage = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [gainers, setGainers] = useState<Stock[]>([]);
    const [losers, setLosers] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [moversLoading, setMoversLoading] = useState(true);
    const [error, setError] = useState('');
    const [moversError, setMoversError] = useState('');

    useEffect(() => {
        fetchNews();
        fetchTopMovers();
    }, []);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await fetch(buildPath('news'), {
                method: 'GET',
            });

            const data = await response.json();

            if (data.error) {
                setError(data.error);
            } else {
                setArticles(data.articles);
            }
        } catch (err: any) {
            setError('Failed to fetch news. Please check your connection.');
            console.error('Error fetching news:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopMovers = async () => {
        try {
            setMoversLoading(true);
            const response = await fetch(buildPath('top-movers'), {
                method: 'GET',
            });

            const data = await response.json();

            if (data.error) {
                setMoversError(data.error);
            } else {
                setGainers(data.gainers || []);
                setLosers(data.losers || []);
            }
        } catch (err: any) {
            setMoversError('Failed to fetch top movers. Please check your connection.');
            console.error('Error fetching top movers:', err);
        } finally {
            setMoversLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTickerColor = (ticker: string): string => {
        const colorMap: { [key: string]: string } = {
            'AAPL': '#000000',
            'MSFT': '#00A4EF',
            'GOOGL': '#4285F4',
            'AMZN': '#FF9900',
            'NVDA': '#76B900',
            'META': '#0866FF',
            'TSLA': '#E82127',
            'JPM': '#117ACA',
            'V': '#1A1F71',
            'MA': '#EB001B',
            'NFLX': '#E50914',
            'DIS': '#113CCF',
            'SBUX': '#00704A',
            'NKE': '#000000',
            'MCD': '#FFC72C',
            'KO': '#F40009',
            'PEP': '#004B93',
            'AMD': '#ED1C24',
            'INTC': '#0071C5',
            'PYPL': '#003087',
            'UBER': '#000000',
            'ABNB': '#FF5A5F',
            'COIN': '#0052FF',
            'WMT': '#0071CE',
            'COST': '#0D6EFD',
        };

        return colorMap[ticker] || '#1a7221';
    };

    return (
        <div className="browse-page">
            <h1 className="page-title">Browse</h1>

            {/* News Section */}
            <div className="news-section">
                <h2 className="subsection-title">News</h2>
                {loading ? (
                    <div className="loading-spinner">Loading latest financial news...</div>
                ) : error ? (
                    <div className="error-container">
                        <div className="error-message">{error}</div>
                        <button onClick={fetchNews} className="retry-button">
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="articles-scroll">
                        {articles.map((article, index) => (
                            <a
                                key={index}
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="article-card"
                            >
                                <div className="article-content">
                                    <div className="article-header">
                                        <div className="article-source">{article.source}</div>
                                        {article.ticker && (
                                            <span
                                                className="ticker-tag"
                                                style={{ backgroundColor: getTickerColor(article.ticker) }}
                                            >
                                                ${article.ticker}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="article-title">{article.title}</h3>
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Biggest Gainers Section */}
            <div className="movers-section">
                <h2 className="subsection-title">Biggest Gainers</h2>
                {moversLoading ? (
                    <div className="loading-spinner">Loading top gainers...</div>
                ) : moversError ? (
                    <div className="error-container">
                        <div className="error-message">{moversError}</div>
                        <button onClick={fetchTopMovers} className="retry-button">
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="movers-scroll">
                        {gainers.map((stock, index) => (
                            <div key={index} className="stock-card gainer">
                                <div className="stock-content">
                                    <div className="stock-header">
                                        <div className="stock-symbol">{stock.symbol}</div>
                                        <div className="stock-change positive">
                                            +{stock.changePercent.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div className="stock-name">{stock.name}</div>
                                    <div className="stock-price">${stock.price.toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Biggest Losers Section */}
            <div className="movers-section">
                <h2 className="subsection-title">Biggest Losers</h2>
                {moversLoading ? (
                    <div className="loading-spinner">Loading top losers...</div>
                ) : moversError ? (
                    <div className="error-container">
                        <div className="error-message">{moversError}</div>
                        <button onClick={fetchTopMovers} className="retry-button">
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="movers-scroll">
                        {losers.map((stock, index) => (
                            <div key={index} className="stock-card loser">
                                <div className="stock-content">
                                    <div className="stock-header">
                                        <div className="stock-symbol">{stock.symbol}</div>
                                        <div className="stock-change negative">
                                            {stock.changePercent.toFixed(2)}%
                                        </div>
                                    </div>
                                    <div className="stock-name">{stock.name}</div>
                                    <div className="stock-price">${stock.price.toFixed(2)}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BrowsePage;
