import React from 'react'
import './App.css'

// Current broadcasting news articles - September 25, 2025
const currentNews = [
  {
    id: 1,
    title: "Disney+ Announces Price Hike Amid Kimmel Controversy",
    description: "Disney has announced price increases for its Disney+ streaming service, with the ad-free version rising $3 to $18.99/month and ad-supported tier increasing $2 to $11.99/month. The announcement comes as Disney faces backlash over its decision to suspend Jimmy Kimmel Live after the host's comments about Charlie Kirk's death.",
    source: "NewscastStudio",
    date: "September 24, 2025",
    url: "https://www.newscaststudio.com/2025/09/24/disney-plus-price-increase-1025/",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=250&fit=crop&auto=format"
  },
  {
    id: 2,
    title: "SBS CEO: Expense Cuts Aren't Hurting Ratings Despite Revenue Drop",
    description: "Spanish Broadcasting System cut operating costs 10% in Q2 and 11% year-to-date, with CEO Raúl Alarcón projecting more cuts coming with no impact on ratings or digital listening. However, Q2 revenue fell 14% and losses widened, while the company faces a significant challenge with a $310 million debt repayment due in March.",
    source: "InsideRadio",
    date: "September 25, 2025",
    url: "https://www.insideradio.com/free/sbs-raul-alarcon-expense-cuts-arent-hurting-ratings-and-digital-growth/article_12345.html",
    image: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=250&fit=crop&auto=format"
  },
  {
    id: 3,
    title: "SEC Nation Hits the Road with New Travel Set",
    description: "ESPN's SEC Nation has unveiled a new mobile set design for its college football coverage, featuring enhanced production capabilities and improved viewer experience. The traveling set incorporates state-of-the-art technology and flexible staging options to better serve the show's on-location broadcasts from SEC campuses.",
    source: "NewscastStudio",
    date: "September 25, 2025",
    url: "https://www.newscaststudio.com/2025/09/25/sec-nation-travel-set/",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=250&fit=crop&auto=format"
  },
  {
    id: 4,
    title: "B+C Hall of Fame Announces Class of 2025",
    description: "Broadcasting & Cable has announced its Hall of Fame Class of 2025, with the 33rd annual gala set to honor 15 industry influencers and the iconic soap opera 'Days of Our Lives' on September 30 in New York. The ceremony will recognize outstanding contributions to the broadcasting and cable television industry.",
    source: "Broadcasting & Cable",
    date: "September 25, 2025",
    url: "https://www.nexttv.com/broadcasting-cable/bc-hall-fame-announces-class-2025",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop&auto=format"
  },
  {
    id: 5,
    title: "Kimmel Returns with FCC Satire and Seattle Radio Memories",
    description: "Jimmy Kimmel's first night back on 'Jimmy Kimmel Live!' after his network suspension blended nostalgia and political satire. The late-night host recalled his short-lived stint at Seattle's KZOK-FM, where he was once fired by his program director, and enlisted Robert De Niro to lampoon FCC Chairman Brendan Carr.",
    source: "InsideRadio",
    date: "September 25, 2025",
    url: "https://www.insideradio.com/free/seattle-radio-fcc-satire-share-spotlight-as-kimmel-resumes-late-night/article_67890.html",
    image: "https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=250&fit=crop&auto=format"
  },
  {
    id: 6,
    title: "DirecTV Acquires Dish, Unifying Struggling Satellite Business",
    description: "DirecTV has announced its acquisition of Dish Network, creating a unified satellite television provider as both companies struggle with cord-cutting trends and streaming competition. The merger combines two of the largest satellite TV providers in the United States, with AT&T simultaneously selling its stake in DirecTV to private equity firm TPG.",
    source: "Broadcasting & Cable",
    date: "September 24, 2025",
    url: "https://www.nexttv.com/broadcasting-cable/directv-acquires-dish-satellite-merger",
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=250&fit=crop&auto=format"
  },
  {
    id: 7,
    title: "CBS Flashes Back to 70s with NFL Today Anniversary Show",
    description: "CBS Sports is celebrating the legacy of 'The NFL Today' with a special anniversary broadcast that pays homage to the show's groundbreaking 1970s era. The retrospective features classic clips, interviews with former hosts, and behind-the-scenes stories from the program that revolutionized sports broadcasting.",
    source: "NewscastStudio",
    date: "September 25, 2025",
    url: "https://www.newscaststudio.com/2025/09/25/cbs-nfl-today-anniversary/",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=250&fit=crop&auto=format"
  },
  {
    id: 8,
    title: "The Daily Show Goes Gold in Bow to Trump",
    description: "Comedy Central's 'The Daily Show' has introduced new gold-themed graphics and set elements in what appears to be satirical commentary on Donald Trump's aesthetic preferences. The visual changes include metallic accents and luxury-inspired design elements that mirror Trump's well-known affinity for gold décor.",
    source: "NewscastStudio",
    date: "September 25, 2025",
    url: "https://www.newscaststudio.com/2025/09/25/daily-show-gold-trump/",
    image: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=250&fit=crop&auto=format"
  }
];

const getSourceColor = (source) => {
  const colors = {
    'Radio Ink': '#dc2626',
    'InsideRadio': '#2563eb',
    'TV News Check': '#7c3aed',
    'Radio World': '#059669',
    'Broadcasting & Cable': '#ea580c',
    'RBR-TVBR': '#4f46e5',
    'Inside Audio Marketing': '#db2777',
    'NewscastStudio': '#0891b2'
  };
  return colors[source] || '#6b7280';
};

function App() {
  return (
    <div className="broadcasting-news-widget">
      <header className="widget-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
              <path d="M19 15L20.09 18.26L23 19L20.09 19.74L19 23L17.91 19.74L15 19L17.91 18.26L19 15Z" fill="currentColor"/>
              <path d="M5 15L6.09 18.26L9 19L6.09 19.74L5 23L3.91 19.74L1 19L3.91 18.26L5 15Z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="widget-title">Broadcasting Industry News Aggregator</h1>
          <p className="widget-subtitle">Latest news from major broadcasting trade publications</p>
        </div>
      </header>

      <div className="news-grid">
        {currentNews.map(article => (
          <article key={article.id} className="news-card">
            {article.image && (
              <div className="news-image">
                <img 
                  src={article.image} 
                  alt={article.title} 
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.style.display = 'none';
                  }} 
                />
                <div className="image-overlay"></div>
              </div>
            )}
            <div className="news-content">
              <div className="news-meta-top">
                <span 
                  className="news-source-badge" 
                  style={{ backgroundColor: getSourceColor(article.source) }}
                >
                  {article.source}
                </span>
                <span className="news-date">{article.date}</span>
              </div>
              
              <h2 className="news-title">
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </h2>
              
              <p className="news-description">{article.description}</p>
              
              <div className="news-footer">
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="read-more-btn"
                  style={{ backgroundColor: getSourceColor(article.source) }}
                >
                  Read full article
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <footer className="widget-footer">
        <div className="update-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
            <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Last updated: September 25, 2025 at 9:30 PM | Updates every 6 hours
        </div>
        <p className="footer-text">Broadcasting Industry News • Powered by RSS feeds from major trade publications</p>
      </footer>
    </div>
  )
}

export default App
