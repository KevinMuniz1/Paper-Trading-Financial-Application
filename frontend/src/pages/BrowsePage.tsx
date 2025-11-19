import { useState, useEffect } from 'react';
import { buildPath } from "../../Path";
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
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

interface SearchResult {
    symbol: string;
    name: string;
}

const BrowsePage = () => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [gainers, setGainers] = useState<Stock[]>([]);
    const [losers, setLosers] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [moversLoading, setMoversLoading] = useState(true);
    const [error, setError] = useState('');
    const [moversError, setMoversError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchNews();
        fetchTopMovers();
    }, []);

    // Close dropdown if clicking outside
    useEffect(() => {
        const handler = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.search-wrapper')) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (searchQuery.trim() === '') setShowResults(false);
    }, [searchQuery]);

    const fetchNews = async () => {
        try {
            setLoading(true);
            const response = await fetch(buildPath('news'));
            const data = await response.json();

            if (data.error) setError(data.error);
            else setArticles(data.articles);
        } catch {
            setError('Failed to fetch news.');
        } finally {
            setLoading(false);
        }
    };

    const fetchTopMovers = async () => {
        try {
            setMoversLoading(true);
            const response = await fetch(buildPath('top-movers'));
            const data = await response.json();

            if (data.error) setMoversError(data.error);
            else {
                setGainers(data.gainers || []);
                setLosers(data.losers || []);
            }
        } catch {
            setMoversError('Failed to fetch top movers.');
        } finally {
            setMoversLoading(false);
        }
    };

    const getTickerColor = (ticker: string) => {
        const colorMap: Record<string, string> = {
            AAPL: '#000000',
            MSFT: '#00A4EF',
            GOOGL: '#4285F4',
            AMZN: '#FF9900',
            NVDA: '#76B900',
            META: '#0866FF',
            TSLA: '#E82127',
            JPM: '#117ACA',
            V: '#1A1F71',
            MA: '#EB001B',
            NFLX: '#E50914',
            DIS: '#113CCF',
            SBUX: '#00704A',
            NKE: '#000000',
            MCD: '#FFC72C',
            KO: '#F40009',
            PEP: '#004B93',
            AMD: '#ED1C24',
            INTC: '#0071C5',
            PYPL: '#003087',
            UBER: '#000000',
            ABNB: '#FF5A5F',
            COIN: '#0052FF',
            WMT: '#0071CE',
            COST: '#0D6EFD',
        };
        return colorMap[ticker] || '#1a7221';
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return setShowResults(false);

        try {
            setSearching(true);
            setShowResults(true);

            const res = await fetch(buildPath(`search?q=${encodeURIComponent(searchQuery)}`));
            const data = await res.json();

            if (data.error) setSearchResults([]);
            else setSearchResults(data.results || []);
        } catch {
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const handleResultClick = (symbol: string) => {
        navigate(`/stock/${symbol}`);
        setShowResults(false);
        setSearchQuery('');
    };

    return (
        <div className="browse-page">
            <div className="logo-navigation-combo">
                <h1 className="page-title">Browse</h1>
                <NavBar />
            </div>

            {/* Search Bar */}
            <div className="search-wrapper">
                <form className="search-container" onSubmit={handleSearch}>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search for stocks, news, or companies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="search-button">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                             stroke="currentColor" strokeWidth="2"
                             strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>
                </form>

                {showResults && (
                    <div className="search-results">
                        {searching ? (
                            <div className="search-result-item searching">Searching...</div>
                        ) : searchResults.length > 0 ? (
                            searchResults.map((result, i) => (
                                <div key={i} className="search-result-item"
                                     onClick={() => handleResultClick(result.symbol)}>
                                    <div className="result-symbol">{result.symbol}</div>
                                    <div className="result-name">{result.name}</div>
                                </div>
                            ))
                        ) : (
                            <div className="search-result-item no-results">No results found</div>
                        )}
                    </div>
                )}
            </div>

            {/* News */}
            <div className="news-section">
                <h2 className="subsection-title">News</h2>

                {loading ? (
                    <div className="loading-spinner">Loading latest financial news...</div>
                ) : error ? (
                    <div className="error-container">
                        <div className="error-message">{error}</div>
                        <button onClick={fetchNews} className="retry-button">Retry</button>
                    </div>
                ) : (
                    <div className="articles-scroll">
                        {articles.map((article, index) => (
                            <a key={index} href={article.url} target="_blank"
                               rel="noopener noreferrer" className="article-card">

                                {/* IMAGE NOW INCLUDED */}
                                {article.urlToImage && (
                                    <img
                                        src={article.urlToImage}
                                        alt={article.title}
                                        className="article-image"
                                    />
                                )}

                                <div className="article-content">
                                    <div className="article-header">
                                        <div className="article-source">{article.source}</div>

                                        {article.ticker && (
                                            <span className="ticker-tag"
                                                  style={{ backgroundColor: getTickerColor(article.ticker) }}>
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

            {/* Gainers */}
            <div className="movers-section">
                <h2 className="subsection-title">Biggest Gainers</h2>

                {moversLoading ? (
                    <div className="loading-spinner">Loading top gainers...</div>
                ) : moversError ? (
                    <div className="error-container">
                        <button onClick={fetchTopMovers} className="retry-button">Retry</button>
                    </div>
                ) : (
                    <div className="movers-scroll">
                        {gainers.map((stock, i) => (
                            <div key={i} className="stock-card gainer"
                                 onClick={() => navigate(`/stock/${stock.symbol}`)}>
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

            {/* Losers */}
            <div className="movers-section">
                <h2 className="subsection-title">Biggest Losers</h2>

                {moversLoading ? (
                    <div className="loading-spinner">Loading top losers...</div>
                ) : moversError ? (
                    <div className="error-container">
                        <button onClick={fetchTopMovers} className="retry-button">Retry</button>
                    </div>
                ) : (
                    <div className="movers-scroll">
                        {losers.map((stock, i) => (
                            <div key={i} className="stock-card loser">
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
