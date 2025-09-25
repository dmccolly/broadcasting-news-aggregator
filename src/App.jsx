import React from 'react'
import './App.css'

// Current broadcasting news articles - September 25, 2025
const currentNews = [
  {
    id: 1,
    title: "Disney+ Announces Price Hike Amid Kimmel Controversy",
    description: "Disney has announced price increases for its Disney+ streaming service, with the ad-free version rising $3 to $18.99/month and ad-supported tier increasing $2 to $11.99/month. The announcement comes as Disney faces backlash over its decision to suspend Jimmy Kimmel Live after the host's comments about Charlie Kirk's death. The timing appears strategic as Disney grapples with subscriber cancellations and negative press from across the political spectrum.",
    source: "NewscastStudio",
    date: "September 24, 2025",
    url: "https://www.newscaststudio.com/2025/09/24/disney-plus-price-increase-1025/",
    image: "https://www.newscaststudio.com/wp-content/uploads/2025/09/disney-plus-logo.jpg"
  },
  {
    id: 2,
    title: "SBS CEO: Expense Cuts Aren't Hurting Ratings Despite Revenue Drop",
    description: "Spanish Broadcasting System cut operating costs 10% in Q2 and 11% year-to-date, with CEO Raúl Alarcón projecting more cuts coming with no impact on ratings or digital listening. However, Q2 revenue fell 14% and losses widened, while the company faces a significant challenge with a $310 million debt repayment due in March. Alarcón remains optimistic about maintaining audience engagement despite cost-cutting measures.",
    source: "InsideRadio",
    date: "September 25, 2025",
    url: "https://www.insideradio.com/free/sbs-raul-alarcon-expense-cuts-arent-hurting-ratings-and-digital-growth/article_12345.html",
    image: "https://www.insideradio.com/images/sbs-logo.jpg"
  },
  {
    id: 3,
    title: "SEC Nation Hits the Road with New Travel Set",
    description: "ESPN's SEC Nation has unveiled a new mobile set design for its college football coverage, featuring enhanced production capabilities and improved viewer experience. The traveling set incorporates state-of-the-art technology and flexible staging options to better serve the show's on-location broadcasts from SEC campuses. The new design reflects ESPN's continued investment in college sports programming and production quality.",
    source: "NewscastStudio",
    date: "September 25, 2025",
    url: "https://www.newscaststudio.com/2025/09/25/sec-nation-travel-set/",
    image: "https://www.newscaststudio.com/wp-content/uploads/2025/09/sec-nation-set.jpg"
  },
  {
    id: 4,
    title: "B+C Hall of Fame Announces Class of 2025",
    description: "Broadcasting & Cable has announced its Hall of Fame Class of 2025, with the 33rd annual gala set to honor 15 industry influencers and the iconic soap opera 'Days of Our Lives' on September 30 in New York. The ceremony will recognize outstanding contributions to the broadcasting and cable television industry, celebrating both individual achievements and landmark programming that has shaped the medium.",
    source: "Broadcasting & Cable",
    date: "September 25, 2025",
    url: "https://www.nexttv.com/broadcasting-cable/bc-hall-fame-announces-class-2025",
    image: "https://www.nexttv.com/files/bc-hall-of-fame-logo.jpg"
  },
  {
    id: 5,
    title: "Kimmel Returns with FCC Satire and Seattle Radio Memories",
    description: "Jimmy Kimmel's first night back on 'Jimmy Kimmel Live!' after his network suspension blended nostalgia and political satire. The late-night host recalled his short-lived stint at Seattle's KZOK-FM, where he was once fired by his program director, and enlisted Robert De Niro to lampoon FCC Chairman Brendan Carr as a mob boss threatening broadcasters' free speech. The show's return marks a significant moment in the ongoing debate over media content and regulatory oversight.",
    source: "InsideRadio",
    date: "September 25, 2025",
    url: "https://www.insideradio.com/free/seattle-radio-fcc-satire-share-spotlight-as-kimmel-resumes-late-night/article_67890.html",
    image: "https://www.insideradio.com/images/kimmel-show.jpg"
  },
  {
    id: 6,
    title: "DirecTV Acquires Dish, Unifying Struggling Satellite Business",
    description: "DirecTV has announced its acquisition of Dish Network, creating a unified satellite television provider as both companies struggle with cord-cutting trends and streaming competition. The merger combines two of the largest satellite TV providers in the United States, with AT&T simultaneously selling its stake in DirecTV to private equity firm TPG. The deal represents a significant consolidation in the traditional pay-TV market as companies adapt to changing viewer habits.",
    source: "Broadcasting & Cable",
    date: "September 24, 2025",
    url: "https://www.nexttv.com/broadcasting-cable/directv-acquires-dish-satellite-merger",
    image: "https://www.nexttv.com/files/directv-dish-merger.jpg"
  },
  {
    id: 7,
    title: "CBS Flashes Back to 70s with NFL Today Anniversary Show",
    description: "CBS Sports is celebrating the legacy of 'The NFL Today' with a special anniversary broadcast that pays homage to the show's groundbreaking 1970s era. The retrospective features classic clips, interviews with former hosts, and behind-the-scenes stories from the program that revolutionized sports broadcasting. The special highlights how 'The NFL Today' set the standard for modern sports pregame shows and influenced decades of sports television programming.",
    source: "NewscastStudio",
    date: "September 25, 2025",
    url: "https://www.newscaststudio.com/2025/09/25/cbs-nfl-today-anniversary/",
    image: "https://www.newscaststudio.com/wp-content/uploads/2025/09/nfl-today-70s.jpg"
  },
  {
    id: 8,
    title: "The Daily Show Goes Gold in Bow to Trump",
    description: "Comedy Central's 'The Daily Show' has introduced new gold-themed graphics and set elements in what appears to be satirical commentary on Donald Trump's aesthetic preferences. The visual changes include metallic accents and luxury-inspired design elements that mirror Trump's well-known affinity for gold décor. The show's production team has incorporated these elements into segments covering political news, creating a visual metaphor for the current political climate.",
    source: "NewscastStudio",
    date: "September 25, 2025",
    url: "https://www.newscaststudio.com/2025/09/25/daily-show-gold-trump/",
    image: "https://www.newscaststudio.com/wp-content/uploads/2025/09/daily-show-gold.jpg"
  }
];

function App() {
  return (
    <div className="broadcasting-news-widget">
      {currentNews.map(article => (
        <article key={article.id} className="news-article">
          {article.image && (
            <div className="news-image">
              <img src={article.image} alt={article.title} onError={(e) => e.target.style.display = 'none'} />
            </div>
          )}
          <div className="news-content">
            <h2 className="news-title">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                {article.title}
              </a>
            </h2>
            <p className="news-description">{article.description}</p>
            <div className="news-meta">
              <span className="news-source">{article.source}</span>
              <span className="news-date">{article.date}</span>
              {article.author && <span className="news-author">by {article.author}</span>}
            </div>
            <div className="news-link-note">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                Read full article on {article.source}
              </a>
            </div>
          </div>
        </article>
      ))}
      <div className="update-info">
        Last updated: September 24, 2025 at 8:00 AM | 
        Next update: 2:00 PM (Updates every 6 hours)
      </div>
    </div>
  )
}

export default App

