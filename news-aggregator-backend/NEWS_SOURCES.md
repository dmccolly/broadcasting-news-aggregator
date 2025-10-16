# Broadcasting News Aggregator - Content Sources

This document lists all news sources configured in the Broadcasting News Aggregator system.

## National Broadcasting Industry News (RSS Feeds)

### Trade Publications

1. **NewscastStudio**
   - RSS Feed: https://www.newscaststudio.com/feed/
   - Coverage: Broadcasting studio technology, set design, production news
   - Update Frequency: Daily

2. **TV Newscheck**
   - RSS Feed: https://tvnewscheck.com/feed/
   - Coverage: Television industry news, station management, regulations
   - Update Frequency: Daily

3. **Radio Ink**
   - RSS Feed: https://radioink.com/feed/
   - Coverage: Radio industry news, ratings, personalities, management
   - Update Frequency: Multiple daily

4. **Radio World**
   - RSS Feed: https://www.radioworld.com/rss
   - Coverage: Radio technology, engineering, equipment, transmission
   - Update Frequency: Daily

5. **Inside Radio**
   - RSS Feed: https://www.insideradio.com/rss.xml
   - Coverage: Radio business news, formats, programming, sales
   - Update Frequency: Multiple daily

6. **TV Technology**
   - RSS Feed: https://www.tvtechnology.com/rss
   - Coverage: Television technology, production equipment, engineering
   - Update Frequency: Daily

7. **Broadcasting & Cable (NextTV)**
   - RSS Feed: https://www.nexttv.com/broadcasting-cable/feed
   - Coverage: Broadcasting and cable industry news, mergers, acquisitions
   - Update Frequency: Daily

8. **RBR-TVBR**
   - RSS Feed: https://rbr.com/feed/
   - Coverage: Radio and TV business reports, valuations, transactions
   - Update Frequency: Daily

9. **Inside Audio Marketing**
   - RSS Feed: https://www.insideaudiomarketing.com/feed
   - Coverage: Audio advertising, marketing strategies, industry trends
   - Update Frequency: Weekly

## Boise/Idaho Local Radio Stations (Web Scraping)

### Major Boise Radio Stations

1. **KBOI 93.1FM & 670AM**
   - Homepage: https://kboi.com
   - Format: News/Talk
   - Subpages Monitored:
     - /blog - Station blog and community content
     - /events - Local events and station appearances
     - /contests - Listener contests and giveaways
     - /shows - Show information and on-air staff content

2. **KIDO Talk Radio**
   - Homepage: https://kidotalkradio.com
   - Format: News/Talk
   - Subpages Monitored:
     - /blog - Station commentary and opinion
     - /news - Local news coverage
     - /events - Community events
     - /shows - Program schedules and hosts

3. **Power 88.9**
   - Homepage: https://power889.com
   - Format: Contemporary Christian
   - Subpages Monitored:
     - /blog - Faith and community content
     - /events - Concerts and ministry events
     - /contests - Listener promotions

4. **630 KFXD**
   - Homepage: https://630kfxd.com
   - Format: Sports
   - Subpages Monitored:
     - /blog - Sports commentary
     - /news - Local sports news
     - /shows - Show schedules

5. **Q92.7 KQFC**
   - Homepage: https://q927.com
   - Format: Country
   - Subpages Monitored:
     - /blog - Music and entertainment news
     - /events - Concerts and appearances
     - /contests - Ticket giveaways

6. **93.1 KTIK**
   - Homepage: https://931ktik.com
   - Format: Sports Talk
   - Subpages Monitored:
     - /blog - Sports analysis
     - /sports - Idaho sports coverage
     - /shows - Program information

## Content Types Extracted

The aggregator extracts and categorizes the following content types:

- **news**: General news articles and industry updates
- **event**: Concerts, appearances, community events
- **contest**: Listener contests and giveaways
- **podcast**: Podcast episodes and audio content
- **interview**: Interviews with industry professionals or guests

## Data Extraction Details

### From RSS Feeds
- Article title
- Description/summary (first 100 words)
- Publication date
- Original article URL
- Featured image (from enclosure, media:content, or Open Graph tags)
- Source publication name

### From Web Scraping
- Article/post title
- Description/excerpt
- Publication date (when available)
- Direct link to content
- Featured image or station logo fallback
- Content type classification
- Source station name

## Update Schedule

- **Primary Update Frequency**: Every 6 hours (0:00, 6:00, 12:00, 18:00 UTC)
- **Retention Window**: Articles from the past 48 hours for RSS feeds, 7 days for local content
- **Deduplication**: Automatic removal of duplicate articles based on title similarity (>80% match)
- **Sorting**: All content sorted by publication date, newest first
- **Result Limit**: Top 50 articles returned in API response

## Notes

- Some RSS feeds may rate-limit requests; the system gracefully handles these errors
- Web scraping respects robots.txt and uses reasonable request intervals
- Fallback images are used when original images are unavailable
- The system uses headless Chrome for JavaScript-heavy sites that require browser rendering
