import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink, AlertCircle } from 'lucide-react';
import BroadcastingNewsAggregator from '../services/newsAggregator';

const NewsWidget = ({ 
  maxArticles = 15, 
  showImages = true, 
  showUpdateInfo = true,
  className = "" 
}) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const newsAggregator = new BroadcastingNewsAggregator();

  useEffect(() => {
    loadNews();
    
    // Set up auto-refresh every 6 hours (21600000 ms)
    const interval = setInterval(loadNews, 21600000);
    
    return () => clearInterval(interval);
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch live news, fallback to mock data if needed
      let newsArticles;
      try {
        newsArticles = await newsAggregator.aggregateNews();
        if (!newsArticles || newsArticles.length === 0) {
          throw new Error('No articles returned');
        }
      } catch (liveError) {
        console.warn('Live news fetch failed, using mock data:', liveError);
        newsArticles = newsAggregator.getMockData();
      }
      
      setArticles(newsArticles.slice(0, maxArticles));
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('Error loading news:', err);
      setError('Failed to load news content');
      // Use mock data as fallback
      setArticles(newsAggregator.getMockData().slice(0, maxArticles));
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Recent';
    }
  };

  const getNextUpdateTime = () => {
    if (!lastUpdate) return 'Soon';
    
    const nextUpdate = new Date(lastUpdate.getTime() + 6 * 60 * 60 * 1000); // 6 hours
    return nextUpdate.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className={`broadcasting-news-feed ${className}`}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading broadcasting news...</span>
        </div>
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className={`broadcasting-news-feed ${className}`}>
        <div className="flex items-center justify-center py-8 text-red-600">
          <AlertCircle className="h-6 w-6 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`broadcasting-news-feed ${className}`}>
      {articles.map((article, index) => (
        <article key={index} className="news-article">
          <h2 className="news-title">
            {article.link_available && article.link ? (
              <a 
                href={article.link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 hover:underline transition-colors duration-200"
              >
                {article.title}
                <ExternalLink className="inline-block ml-1 h-4 w-4" />
              </a>
            ) : (
              <span>{article.title}</span>
            )}
          </h2>
          
          {showImages && article.image_url && (
            <img 
              src={article.image_url} 
              alt={article.title} 
              className="news-image"
              onError={(e) => { e.target.style.display = 'none'; }}
              loading="lazy"
            />
          )}
          
          <p className="news-description">{article.description}</p>
          
          <div className="news-meta">
            <span className="news-source">{article.source}</span>
            <span className="news-date">
              <Clock className="inline-block h-3 w-3 mr-1" />
              {formatDate(article.published)}
            </span>
          </div>
          
          {article.link_note && (
            <div className="news-link-note">{article.link_note}</div>
          )}
        </article>
      ))}
      
      {showUpdateInfo && (
        <div className="update-info">
          Last updated: {lastUpdate ? lastUpdate.toLocaleString() : 'Unknown'} | 
          Next update: {getNextUpdateTime()} (Updates every 6 hours)
        </div>
      )}
    </div>
  );
};

export default NewsWidget;

