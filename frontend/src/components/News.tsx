import { useState, useEffect } from 'react';
import { buildPath } from '../../Path';
import './News.css';

interface Article {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: string;
    ticker: string | null;
}

const News = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchNews();
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

    // Get brand color for ticker
    const getTickerColor = (ticker: string): string => {
        const colorMap: { [key: string]: string } = {
            'AAPL': '#000000',     // Apple - Black
            'MSFT': '#00A4EF',     // Microsoft - Blue
            'GOOGL': '#4285F4',    // Google - Blue
            'AMZN': '#FF9900',     // Amazon - Orange
            'NVDA': '#76B900',     // Nvidia - Green
            'META': '#0866FF',     // Meta - Blue
            'TSLA': '#E82127',     // Tesla - Red
            'JPM': '#117ACA',      // JPMorgan - Blue
            'V': '#1A1F71',        // Visa - Navy
            'MA': '#EB001B',       // Mastercard - Red
            'NFLX': '#E50914',     // Netflix - Red
            'DIS': '#113CCF',      // Disney - Blue
            'SBUX': '#00704A',     // Starbucks - Green
            'NKE': '#000000',      // Nike - Black
            'MCD': '#FFC72C',      // McDonald's - Yellow
            'KO': '#F40009',       // Coca-Cola - Red
            'PEP': '#004B93',      // Pepsi - Blue
            'AMD': '#ED1C24',      // AMD - Red
            'INTC': '#0071C5',     // Intel - Blue
            'PYPL': '#003087',     // PayPal - Blue
            'UBER': '#000000',     // Uber - Black
            'ABNB': '#FF5A5F',     // Airbnb - Red/Pink
            'COIN': '#0052FF',     // Coinbase - Blue
            'WMT': '#0071CE',      // Walmart - Blue
            'COST': '#0D6EFD',     // Costco - Blue
        };

        return colorMap[ticker] || '#1a7221'; // Default green
    };

    if (loading) {
        return (
            <div className="news-container">
                <div className="loading-spinner">Loading latest financial news...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="news-container">
                <div className="error-message">{error}</div>
                <button onClick={fetchNews} className="retry-button">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="news-page">
            <h1 className="page-heading">News</h1>
            <div className="news-container">
                <div className="articles-grid">
                    {articles.map((article, index) => (
                        <a
                            key={index}
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="article-card"
                        >
                            {article.urlToImage && (
                                <div className="article-image-container">
                                    <img
                                        src={article.urlToImage}
                                        alt={article.title}
                                        className="article-image"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                </div>
                            )}
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
                                <p className="article-description">{article.description}</p>
                                <div className="article-date">{formatDate(article.publishedAt)}</div>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default News;
