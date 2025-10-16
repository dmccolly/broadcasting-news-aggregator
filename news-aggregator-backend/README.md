# Broadcasting News Aggregator - Backend API

FastAPI-based news aggregation service that collects and serves broadcasting industry news from national trade publications and local Idaho radio stations.

## Features

- **Automated RSS Feed Aggregation**: Fetches news from 9 major broadcasting industry publications
- **Web Scraping**: Collects content from 6 Boise/Idaho area radio station websites
- **Smart Deduplication**: Removes duplicate articles based on title similarity
- **Image Extraction**: Automatically extracts featured images from articles
- **Scheduled Updates**: Refreshes content every 6 hours automatically
- **In-Memory Caching**: Fast response times with cached results
- **RESTful API**: Clean JSON endpoints for easy integration

## Quick Start

### Prerequisites

- Python 3.12+
- Poetry (Python package manager)
- Chrome/Chromium (for web scraping)

### Installation

```bash
# Install dependencies
poetry install

# Start development server
poetry run fastapi dev app/main.py
```

The API will be available at `http://localhost:8000`

### API Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Main News Feed

```
GET /api/news
```

Returns aggregated and deduplicated news from all sources.

**Response:**
```json
{
  "success": true,
  "total_count": 50,
  "national_count": 30,
  "local_count": 20,
  "articles": [
    {
      "title": "Article Title",
      "description": "Article description...",
      "url": "https://example.com/article",
      "published": "2025-10-16T12:00:00Z",
      "source": "NewscastStudio",
      "image": "https://example.com/image.jpg",
      "content_type": "news"
    }
  ],
  "last_updated": "2025-10-16T22:00:00Z"
}
```

### National News Only

```
GET /api/news/national
```

Returns only articles from national broadcasting trade publications.

### Local News Only

```
GET /api/news/local
```

Returns only articles from Boise/Idaho radio stations.

### Manual Refresh

```
POST /api/news/refresh
```

Triggers an immediate refresh of news content in the background.

### Cache Status

```
GET /api/cache/status
```

Returns information about the current cache state.

**Response:**
```json
{
  "last_updated": "2025-10-16T22:00:00Z",
  "national_count": 112,
  "local_count": 40,
  "is_updating": false
}
```

### Health Check

```
GET /healthz
```

Returns API health status.

## Architecture

### Components

1. **RSS Aggregator** (`app/rss_aggregator.py`)
   - Fetches and parses RSS feeds from trade publications
   - Extracts article metadata and images
   - Filters articles by date (last 48 hours)

2. **Radio Scraper** (`app/radio_scraper.py`)
   - Scrapes content from local radio station websites
   - Uses both requests and Selenium for JavaScript-heavy sites
   - Extracts article data, images, and content types
   - Filters articles by date (last 7 days)

3. **Aggregator Service** (`app/aggregator_service.py`)
   - Deduplicates articles based on title similarity
   - Sorts articles by publication date
   - Merges national and local content

4. **Cache Manager** (`app/cache_manager.py`)
   - Manages in-memory article cache
   - Handles cache refresh logic
   - Prevents concurrent updates

5. **Main API** (`app/main.py`)
   - FastAPI application setup
   - API endpoints
   - Background task scheduling
   - CORS configuration

### Update Schedule

The system automatically updates news content:
- **Frequency**: Every 6 hours
- **On Startup**: Immediate fetch on application start
- **Background Task**: Runs continuously, checking for updates every hour

### Data Flow

```
RSS Feeds ──┐
           ├──> RSS Aggregator ──┐
           │                      │
Radio      │                      ├──> Aggregator Service ──> Cache ──> API
Stations ──┘                      │
           └──> Radio Scraper ────┘
```

## Configuration

### News Sources

News sources are configured in:
- RSS feeds: `app/rss_aggregator.py` (lines 6-90)
- Radio stations: `app/radio_scraper.py` (lines 20-76)

See [NEWS_SOURCES.md](NEWS_SOURCES.md) for detailed source information.

### Update Interval

The update interval can be modified in `app/cache_manager.py`:

```python
self.update_interval_hours = 6  # Change to desired hours
```

### Deduplication Threshold

Title similarity threshold for deduplication in `app/aggregator_service.py`:

```python
@staticmethod
def titles_are_similar(title1: str, title2: str, threshold: float = 0.8):
    # Adjust threshold (0.0 to 1.0)
    # Higher = more strict (less likely to mark as duplicate)
    # Lower = more lenient (more likely to mark as duplicate)
```

## Development

### Project Structure

```
news-aggregator-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app and endpoints
│   ├── rss_aggregator.py       # RSS feed parser
│   ├── radio_scraper.py        # Web scraper for radio stations
│   ├── aggregator_service.py   # Deduplication and sorting
│   └── cache_manager.py        # In-memory cache management
├── pyproject.toml              # Poetry dependencies
├── README.md                   # This file
└── NEWS_SOURCES.md             # Source documentation
```

### Dependencies

Key dependencies (see `pyproject.toml` for full list):
- `fastapi`: Web framework
- `feedparser`: RSS feed parsing
- `beautifulsoup4`: HTML parsing
- `selenium`: Web scraping with browser automation
- `requests`: HTTP client
- `python-dateutil`: Date parsing

### Adding New Sources

#### Adding RSS Feed Source

Edit `app/rss_aggregator.py`:

```python
self.sources = {
    # ... existing sources ...
    'new_source': {
        'name': 'Source Name',
        'rss_url': 'https://example.com/feed/',
        'type': 'trade_publication',
        'priority': 1
    }
}
```

#### Adding Radio Station

Edit `app/radio_scraper.py`:

```python
self.stations = {
    # ... existing stations ...
    'new_station': {
        'name': 'Station Call Letters',
        'homepage': 'https://station.com',
        'subpages': ['/blog', '/news', '/events'],
        'logo': 'https://station.com/logo.png'
    }
}
```

## Deployment

### Production Environment

For production deployment:

```bash
# Run with production server
poetry run fastapi run app/main.py --host 0.0.0.0 --port 8000
```

### Environment Variables

The backend doesn't require environment variables for basic operation. All configuration is in the source files.

### CORS Configuration

CORS is configured to allow all origins in `app/main.py`. For production, update:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # Specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Monitoring

### Logs

The application uses Python's logging module. All aggregation activities, errors, and updates are logged to stdout.

Key log messages:
- `Starting news aggregation update...` - Update cycle started
- `Fetched N articles from [source]` - Source fetch completed
- `Deduplication: X -> Y articles` - Deduplication results
- `News cache updated successfully` - Cache update completed

### Error Handling

The system gracefully handles:
- RSS feed fetch failures (404, 403, timeouts)
- Website scraping errors (403, DNS failures)
- Rate limiting from sources
- Missing images (uses fallback)
- Date parsing failures

Failed sources are logged but don't prevent other sources from being processed.

## Limitations

- **In-Memory Storage**: Data is lost on restart (no persistence)
- **Rate Limits**: Some sources may rate-limit requests
- **Website Changes**: Web scraping may break if station websites change structure
- **Selenium Performance**: Web scraping with browser automation is slower than RSS parsing

## Troubleshooting

### Chrome/Chromium Not Found

If you get Selenium errors about Chrome:

```bash
# Install Chrome on Ubuntu/Debian
sudo apt-get install chromium-browser
```

### RSS Feed 429 Errors

Some sources rate-limit requests. The system will retry on the next update cycle.

### No Articles Returned

Check logs for:
1. Network connectivity issues
2. RSS feed URL changes
3. Website structure changes requiring scraper updates

## License

This project is part of the Broadcasting News Aggregator application.
