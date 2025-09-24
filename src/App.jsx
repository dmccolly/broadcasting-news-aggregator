import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NewsWidget from './components/NewsWidget';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          {/* Main news feed page */}
          <Route path="/" element={<MainNewsPage />} />
          
          {/* Embed widget page (clean, no headers/footers) */}
          <Route path="/embed" element={<EmbedWidget />} />
          
          {/* Compact embed widget */}
          <Route path="/embed/compact" element={<CompactEmbedWidget />} />
          
          {/* API endpoint simulation */}
          <Route path="/api/news" element={<APIResponse />} />
        </Routes>
      </div>
    </Router>
  );
}

// Main news page with header and branding
function MainNewsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Broadcasting Industry News
        </h1>
        <p className="text-lg text-gray-600">
          Live news aggregation from trade publications and local Idaho radio stations
        </p>
        <div className="mt-4 flex justify-center gap-4 text-sm text-gray-500">
          <span>📺 Trade Publications</span>
          <span>📻 Local Idaho Radio</span>
          <span>🔄 Updates every 6 hours</span>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto">
        <NewsWidget 
          maxArticles={15}
          showImages={true}
          showUpdateInfo={true}
          className="bg-white rounded-lg shadow-sm p-6"
        />
      </main>
      
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>
          Sources: NewscastStudio, TV Newscheck, Radio Ink, Radio World, TV Technology, 
          Broadcasting & Cable, KBOI, KIDO, and more
        </p>
        <div className="mt-4">
          <a 
            href="/embed" 
            className="text-blue-600 hover:underline mr-4"
            target="_blank"
          >
            Embed Widget
          </a>
          <a 
            href="/embed/compact" 
            className="text-blue-600 hover:underline mr-4"
            target="_blank"
          >
            Compact Widget
          </a>
          <a 
            href="/api/news" 
            className="text-blue-600 hover:underline"
            target="_blank"
          >
            JSON API
          </a>
        </div>
      </footer>
    </div>
  );
}

// Clean embed widget for iframe embedding
function EmbedWidget() {
  return (
    <div className="embed-widget">
      <NewsWidget 
        maxArticles={10}
        showImages={true}
        showUpdateInfo={true}
        className=""
      />
    </div>
  );
}

// Compact embed widget (fewer articles, no images)
function CompactEmbedWidget() {
  return (
    <div className="embed-widget">
      <NewsWidget 
        maxArticles={5}
        showImages={false}
        showUpdateInfo={false}
        className=""
      />
    </div>
  );
}

// API response component (for testing)
function APIResponse() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const newsAggregator = await import('./services/newsAggregator');
        const aggregator = new newsAggregator.default();
        
        let articles;
        try {
          articles = await aggregator.aggregateNews();
        } catch {
          articles = aggregator.getMockData();
        }
        
        setData({
          status: 'success',
          articles: articles.slice(0, 10),
          total: articles.length,
          last_updated: new Date().toISOString(),
          sources: [
            'NewscastStudio', 'TV Newscheck', 'Radio Ink', 'Radio World',
            'TV Technology', 'Broadcasting & Cable', 'KBOI 93.1FM & 670AM',
            'KIDO Talk Radio', 'Idaho Business Review', 'BoiseDev'
          ]
        });
      } catch (error) {
        setData({
          status: 'error',
          message: error.message,
          articles: []
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <pre className="bg-gray-100 p-4 rounded">
          {JSON.stringify({ status: 'loading', message: 'Fetching news data...' }, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Broadcasting News API</h2>
        <p className="text-gray-600">JSON endpoint for news data</p>
      </div>
      <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default App;

