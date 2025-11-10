import { useState, useEffect } from 'react';
import { buildPath } from './Path';
import './News.css';

interface Article {
    title: string;
    description: string;
    url: string;
    urlToImage: string;
    publishedAt: string;
    source: string;
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
                                <div className="article-source">{article.source}</div>
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
