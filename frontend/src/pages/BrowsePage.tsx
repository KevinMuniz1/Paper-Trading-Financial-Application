import { useState, useEffect } from 'react';
import { buildPath } from "../../Path";
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import './BrowsePage.css';

interface Article {
  title: string; description: string; url: string; urlToImage: string;
  publishedAt: string; source: string; ticker: string | null;
}

interface Stock {
  symbol: string; name: string; price: number;
  change: number; changePercent: number; volume: number; marketCap: number;
}

interface SearchResult { symbol: string; name: string; }

const BrowsePage = () => {
  const [articles, setArticles]         = useState<Article[]>([]);
  const [gainers, setGainers]           = useState<Stock[]>([]);
  const [losers, setLosers]             = useState<Stock[]>([]);
  const [loading, setLoading]           = useState(true);
  const [moversLoading, setMoversLoading] = useState(true);
  const [error, setError]               = useState('');
  const [moversError, setMoversError]   = useState('');
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching]       = useState(false);
  const [showResults, setShowResults]   = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchNews(); fetchTopMovers(); }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.search-wrapper')) setShowResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { if (!searchQuery.trim()) setShowResults(false); }, [searchQuery]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch(buildPath('news'));
      const data = await res.json();
      if (data.error) setError(data.error); else setArticles(data.articles);
    } catch { setError('Failed to fetch news.'); } finally { setLoading(false); }
  };

  const fetchTopMovers = async () => {
    try {
      setMoversLoading(true);
      const res = await fetch(buildPath('top-movers'));
      const data = await res.json();
      if (data.error) setMoversError(data.error);
      else { setGainers(data.gainers || []); setLosers(data.losers || []); }
    } catch { setMoversError('Failed to fetch movers.'); } finally { setMoversLoading(false); }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return setShowResults(false);
    try {
      setSearching(true); setShowResults(true);
      const res = await fetch(buildPath(`search?q=${encodeURIComponent(searchQuery)}`));
      const data = await res.json();
      setSearchResults(data.error ? [] : data.results || []);
    } catch { setSearchResults([]); } finally { setSearching(false); }
  };

  const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="browse-shell">
      <NavBar />

      {/* Header */}
      <div className="browse-header">
        <h1 className="browse-title">Market</h1>
        <p className="browse-sub">Live quotes, news, and market movers</p>
      </div>

      {/* Search */}
      <div className="search-wrapper">
        <form className="search-container" onSubmit={handleSearch}>
          <input
            type="text"
            className="search-input"
            placeholder="Search stocks, ETFs, companies…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            Search
          </button>
        </form>
        {showResults && (
          <div className="search-results">
            {searching ? (
              <div className="search-result-item searching">Searching…</div>
            ) : searchResults.length > 0 ? (
              searchResults.map((r, i) => (
                <div key={i} className="search-result-item" onClick={() => { navigate(`/stock/${r.symbol}`); setShowResults(false); setSearchQuery(''); }}>
                  <span className="result-symbol">{r.symbol}</span>
                  <span className="result-name">{r.name}</span>
                </div>
              ))
            ) : (
              <div className="search-result-item no-results">No results found</div>
            )}
          </div>
        )}
      </div>

      {/* Market Movers */}
      <div>
        <p className="subsection-title">Market Movers</p>
        {moversLoading ? (
          <div className="loading-spinner">Loading market data…</div>
        ) : moversError ? (
          <div className="error-container">
            <span className="error-message">{moversError}</span>
            <button className="retry-button" onClick={fetchTopMovers}>Retry</button>
          </div>
        ) : (
          <div className="movers-row">
            {/* Gainers */}
            <div className="movers-panel">
              <p className="subsection-title">Top Gainers</p>
              <div className="movers-list">
                {gainers.map((s, i) => (
                  <div key={i} className="mover-row" onClick={() => navigate(`/stock/${s.symbol}`)}>
                    <div className="mover-left">
                      <span className="mover-symbol">{s.symbol}</span>
                      <span className="mover-name">{s.name}</span>
                    </div>
                    <div className="mover-right">
                      <span className="mover-price">${fmt(s.price)}</span>
                      <span className="mover-change up">+{s.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Losers */}
            <div className="movers-panel">
              <p className="subsection-title">Top Losers</p>
              <div className="movers-list">
                {losers.map((s, i) => (
                  <div key={i} className="mover-row" onClick={() => navigate(`/stock/${s.symbol}`)}>
                    <div className="mover-left">
                      <span className="mover-symbol">{s.symbol}</span>
                      <span className="mover-name">{s.name}</span>
                    </div>
                    <div className="mover-right">
                      <span className="mover-price">${fmt(s.price)}</span>
                      <span className="mover-change down">{s.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* News */}
      <div className="news-section">
        <p className="subsection-title">Financial News</p>
        {loading ? (
          <div className="loading-spinner">Loading news…</div>
        ) : error ? (
          <div className="error-container">
            <span className="error-message">{error}</span>
            <button className="retry-button" onClick={fetchNews}>Retry</button>
          </div>
        ) : (
          <div className="articles-grid">
            {articles.map((a, i) => (
              <a key={i} href={a.url} target="_blank" rel="noopener noreferrer" className="article-card">
                {a.urlToImage && <img src={a.urlToImage} alt={a.title} className="article-image" />}
                <div className="article-content">
                  <div className="article-header">
                    <span className="article-source">{a.source}</span>
                    {a.ticker && <span className="ticker-tag">{a.ticker}</span>}
                  </div>
                  <p className="article-title">{a.title}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowsePage;
