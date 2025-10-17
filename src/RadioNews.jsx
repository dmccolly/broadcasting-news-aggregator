import React, { useState, useEffect } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=400&h=250&fit=crop&auto=format'

const getSourceColor = (source) => {
  const colours = {
    'KBOI 93.1FM & 670AM': '#f97316',
    'KIDO Talk Radio': '#8b5cf6',
    'Power 88.9': '#ec4899',
    '630 KFXD': '#06b6d4',
    'Q92.7 KQFC': '#84cc16',
    '93.1 KTIK': '#eab308'
  }
  return colours[source] || '#1f2937'
}

const getContentTypeBadge = (contentType) => {
  const badges = {
    'contest': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🎁 Contest' },
    'event': { bg: 'bg-blue-100', text: 'text-blue-800', label: '🎵 Event' },
    'podcast': { bg: 'bg-purple-100', text: 'text-purple-800', label: '🎙️ Podcast' },
    'interview': { bg: 'bg-green-100', text: 'text-green-800', label: '💬 Interview' },
    'staff': { bg: 'bg-pink-100', text: 'text-pink-800', label: '👤 Staff' },
    'station_info': { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'ℹ️ Station Info' }
  }
  return badges[contentType] || { bg: 'bg-gray-100', text: 'text-gray-800', label: contentType }
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

function RadioNews() {
  const [newsList, setNewsList] = useState([])
  const [lastUpdated, setLastUpdated] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/api/news/radio`)
      
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
        
        setNewsList(articlesWithIds)
        setLastUpdated(data.last_updated ? new Date(data.last_updated) : new Date())
      } else {
        throw new Error('Failed to fetch news from API')
      }
    } catch (err) {
      console.error('Error fetching radio news:', err)
      setError(err.message)
      setNewsList([])
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
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Boise Radio Hub</h1>
        <p className="text-gray-600">Events, contests, podcasts, and station updates from Boise/Idaho radio stations</p>
      </div>
      
      {loading && newsList.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-600 mt-4">Loading station content...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
        </div>
      )}
      
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {newsList.map((item) => {
          const badge = getContentTypeBadge(item.content_type)
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300"
            >
              <img
                className="w-full h-32 object-cover"
                src={item.image}
                alt={item.title}
                onError={(e) => {
                  e.target.src = FALLBACK_IMAGE
                }}
              />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
                <h2
                  className="font-bold text-xl mb-3 leading-tight hover:underline"
                  style={{ color: getSourceColor(item.source) }}
                >
                  {item.title}
                </h2>
                <p className="text-gray-700 text-sm mb-4 line-clamp-3">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs font-medium text-gray-700">
                    {item.source}
                  </span>
                  <span className="inline-block bg-gray-100 rounded-full px-3 py-1 text-xs text-gray-600">
                    {item.date}
                  </span>
                </div>
              </div>
            </a>
          )
        })}
      </div>
      
      {newsList.length > 0 && (
        <footer className="border-t pt-6 mt-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
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
              Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Unknown'} | Updates every 6 hours
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Boise Radio Hub • Station content from KBOI, KIDO Talk Radio, Power 88.9, KFXD, Q92.7, and KTIK
          </p>
        </footer>
      )}
    </div>
  )
}

export default RadioNews
