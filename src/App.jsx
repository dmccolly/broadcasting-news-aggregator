import React, { useState, useEffect } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=250&fit=crop&auto=format'

const ALL_NEWS_FALLBACK = [
  {
    id: 1,
    title: 'Disney+ Announces Price Hike Amid Kimmel Controversy',
    description:
      "Disney has announced price increases for its Disney+ streaming service, with the ad‑free version rising $3 to $18.99/month and ad‑supported tier increasing $2 to $11.99/month. The announcement comes as Disney faces backlash over its decision to suspend Jimmy Kimmel Live after the host's comments about Charlie Kirk's death.",
    source: 'NewscastStudio',
    date: 'September 24, 2025',
    url:
      'https://www.newscaststudio.com/2025/09/24/disney-plus-price-increase-1025/',
    image:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=250&fit=crop&auto=format'
  },
  {
    id: 2,
    title: "SBS CEO: Expense Cuts Aren't Hurting Ratings Despite Revenue Drop",
    description:
      'Spanish Broadcasting System cut operating costs 10% in Q2 and 11% year‑to‑date, with CEO Raúl Alarcón projecting more cuts coming with no impact on ratings or digital listening. However, Q2 revenue fell 14% and losses widened, while the company faces a significant challenge with a $310 million debt repayment due in March.',
    source: 'InsideRadio',
    date: 'September 25, 2025',
    url:
      'https://www.insideradio.com/free/sbs-raul-alarcon-expense-cuts-arent-hurting-ratings-and-digital-growth/article_12345.html',
    image:
      'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=250&fit=crop&auto=format'
  },
  {
    id: 3,
    title: 'SEC Nation Hits the Road with New Travel Set',
    description:
      "ESPN's SEC Nation has unveiled a new mobile set design for its college football coverage, featuring enhanced production capabilities and improved viewer experience. The traveling set incorporates state‑of‑the‑art technology and flexible staging options to better serve the show's on‑location broadcasts from SEC campuses.",
    source: 'NewscastStudio',
    date: 'September 25, 2025',
    url: 'https://www.newscaststudio.com/2025/09/25/sec-nation-travel-set/',
    image:
      'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=250&fit=crop&auto=format'
  },
  {
    id: 4,
    title: 'B+C Hall of Fame Announces Class of 2025',
    description:
      "Broadcasting & Cable has announced its Hall of Fame Class of 2025, with the 33rd annual gala set to honor 15 industry influencers and the iconic soap opera 'Days of Our Lives' on September 30 in New York. The ceremony will recognize outstanding contributions to the broadcasting and cable television industry.",
    source: 'Broadcasting & Cable',
    date: 'September 25, 2025',
    url:
      'https://www.nexttv.com/broadcasting-cable/bc-hall-fame-announces-class-2025',
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop&auto=format'
  },
  {
    id: 5,
    title: 'Kimmel Returns with FCC Satire and Seattle Radio Memories',
    description:
      "Jimmy Kimmel's first night back on 'Jimmy Kimmel Live!' after his network suspension blended nostalgia and political satire. The late‑night host recalled his short‑lived stint at Seattle's KZOK‑FM, where he was once fired by his program director, and enlisted Robert De Niro to lampoon FCC Chairman Brendan Carr.",
    source: 'InsideRadio',
    date: 'September 25, 2025',
    url:
      'https://www.insideradio.com/free/seattle-radio-fcc-satire-share-spotlight-as-kimmel-resumes-late-night/article_67890.html',
    image:
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=250&fit=crop&auto=format'
  },
  {
    id: 6,
    title: 'DirecTV Acquires Dish, Unifying Struggling Satellite Business',
    description:
      'DirecTV has announced its acquisition of Dish Network, creating a unified satellite television provider as both companies struggle with cord‑cutting trends and streaming competition. The merger combines two of the largest satellite TV providers in the United States, with AT&T simultaneously selling its stake in DirecTV to private equity firm TPG.',
    source: 'Broadcasting & Cable',
    date: 'September 24, 2025',
    url:
      'https://www.nexttv.com/broadcasting-cable/directv-acquires-dish-satellite-merger',
    image:
      'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=250&fit=crop&auto=format'
  },
  {
    id: 7,
    title: 'CBS Flashes Back to 70s with NFL Today Anniversary Show',
    description:
      "CBS Sports is celebrating the legacy of 'The NFL Today' with a special anniversary broadcast that pays homage to the show's groundbreaking 1970s era. The retrospective features classic clips, interviews with former hosts, and behind‑the‑scenes stories from the program that revolutionized sports broadcasting.",
    source: 'NewscastStudio',
    date: 'September 25, 2025',
    url: 'https://www.newscaststudio.com/2025/09/25/cbs-nfl-today-anniversary/',
    image:
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=250&fit=crop&auto=format'
  },
  {
    id: 8,
    title: 'The Daily Show Goes Gold in Bow to Trump',
    description:
      "Comedy Central's 'The Daily Show' has introduced new gold‑themed graphics and set elements in what appears to be satirical commentary on Donald Trump's aesthetic preferences. The visual changes include metallic accents and luxury‑inspired design elements that mirror Trump's well‑known affinity for gold décor.",
    source: 'NewscastStudio',
    date: 'September 25, 2025',
    url: 'https://www.newscaststudio.com/2025/09/25/daily-show-gold-trump/',
    image:
      'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=250&fit=crop&auto=format'
  },
  {
    id: 9,
    title: 'FCC Proposes New Streaming Regulations',
    description:
      'The Federal Communications Commission is considering new regulations on streaming services to ensure equal access for smaller broadcasters.',
    source: 'Radio World',
    date: 'October 2, 2025',
    url: 'https://www.radioworld.com/news-and-business/business-and-law/fcc-streaming-regulations',
    image:
      'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=400&h=250&fit=crop&auto=format'
  },
  {
    id: 10,
    title: 'Local Broadcasters Launch Mental Health Initiative',
    description:
      'A group of local broadcasters in Idaho have launched a mental‑health awareness campaign aimed at supporting on‑air talent and listeners.',
    source: 'Radio Ink',
    date: 'October 1, 2025',
    url: 'https://radioink.com/2025/10/01/broadcasters-mental-health-initiative/',
    image:
      'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&h=250&fit=crop&auto=format'
  }
]

// Map news sources to accent colours used for the headline text
const getSourceColor = (source) => {
  const colours = {
    'Radio Ink': '#dc2626',
    'Inside Radio': '#2563eb',
    'InsideRadio': '#2563eb',
    'TV News Check': '#7c3aed',
    'TV Newscheck': '#7c3aed',
    'Radio World': '#059669',
    'Broadcasting & Cable': '#ea580c',
    'RBR-TVBR': '#4f46e5',
    'Inside Audio Marketing': '#db2777',
    'NewscastStudio': '#0891b2',
    'TV Technology': '#16a34a',
    'KBOI 93.1FM & 670AM': '#f97316',
    'KIDO Talk Radio': '#8b5cf6',
    'Power 88.9': '#ec4899',
    '630 KFXD': '#06b6d4',
    'Q92.7 KQFC': '#84cc16',
    '93.1 KTIK': '#eab308'
  }
  return colours[source] || '#1f2937'
}

// Shuffle the news array and return a subset.  This ensures
// that each refresh surfaces different stories.
function getRandomNews(count = 8) {
  const shuffled = [...ALL_NEWS_FALLBACK].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

function formatDate(dateString) {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  } catch (e) {
    return dateString
  }
}

function App() {
  const [newsList, setNewsList] = useState([])
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/api/news`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success && data.articles) {
        const articlesWithIds = data.articles.map((article, index) => ({
          ...article,
          id: index + 1,
          date: formatDate(article.published),
          image: article.image || FALLBACK_IMAGE
        }))
        
        setNewsList(articlesWithIds.slice(0, 50))
        setLastUpdated(new Date())
      } else {
        throw new Error('Failed to fetch news from API')
      }
    } catch (err) {
      console.error('Error fetching news:', err)
      setError(err.message)
      setNewsList(getRandomNews(8))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    
    const interval = setInterval(fetchNews, 6 * 60 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Broadcasting Industry News Aggregator</h1>
      
      {loading && newsList.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading news...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4">
          <p className="text-yellow-800">
            <strong>Note:</strong> Using fallback news. {error}
          </p>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6">
        {newsList.map((item) => (
          <div key={item.id} className="rounded overflow-hidden shadow-lg bg-white">
            <img
              className="w-full h-48 object-cover"
              src={item.image}
              alt={item.title}
            />
            <div className="px-6 py-4">
              <div
                className="font-bold text-xl mb-2"
                style={{ color: getSourceColor(item.source) }}
              >
                {item.title}
              </div>
              <p className="text-gray-700 text-base">{item.description}</p>
            </div>
            <div className="px-6 pt-4 pb-2">
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                {item.source}
              </span>
              <span className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                {item.date}
              </span>
            </div>
            <div className="px-6 pb-4">
              <a
                href={item.url}
                className="text-blue-500 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read full article
              </a>
            </div>
          </div>
        ))}
      </div>
      <footer className="widget-footer mt-8">
        <div className="update-info flex items-center gap-1 text-sm text-gray-600">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <polyline
              points="12,6 12,12 16,14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>
            Last updated: {lastUpdated.toLocaleString()} | Updates every 6 hours
          </span>
        </div>
        <p className="footer-text text-xs text-gray-500 mt-2">
          Broadcasting Industry News • Powered by RSS feeds from major trade publications
        </p>
      </footer>
    </div>
  )
}

export default App
