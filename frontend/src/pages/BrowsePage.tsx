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

const BrowsePage = () => {
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

            {/* Additional sections can be added here */}
            <div className="other-sections">
                {/* Placeholder for future content */}
                <h2 className="subsection-title">Stock Search</h2>
                <p style={{ color: '#fff', padding: '2rem' }}>Search functionality coming soon...</p>
            </div>
        </div>
    );
};

export default BrowsePage;
