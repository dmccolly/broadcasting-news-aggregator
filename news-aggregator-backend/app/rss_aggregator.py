import feedparser
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from dateutil import parser as date_parser
from typing import List, Dict, Optional
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class RSSAggregator:
    def __init__(self):
        self.sources = {
            'newscaststudio': {
                'name': 'NewscastStudio',
                'rss_url': 'https://www.newscaststudio.com/feed/',
                'type': 'trade_publication',
                'priority': 1
            },
            'tvnewscheck': {
                'name': 'TV Newscheck',
                'rss_url': 'https://tvnewscheck.com/feed/',
                'type': 'trade_publication',
                'priority': 1
            },
            'radioink': {
                'name': 'Radio Ink',
                'rss_url': 'https://radioink.com/feed/',
                'type': 'trade_publication',
                'priority': 1
            },
            'radioworld': {
                'name': 'Radio World',
                'rss_url': 'https://www.radioworld.com/rss',
                'type': 'trade_publication',
                'priority': 1
            },
            'insideradio': {
                'name': 'Inside Radio',
                'rss_url': 'https://www.insideradio.com/rss.xml',
                'type': 'trade_publication',
                'priority': 1
            },
            'tvtechnology': {
                'name': 'TV Technology',
                'rss_url': 'https://www.tvtechnology.com/rss',
                'type': 'trade_publication',
                'priority': 1
            },
            'broadcastingcable': {
                'name': 'Broadcasting & Cable',
                'rss_url': 'https://www.nexttv.com/broadcasting-cable/feed',
                'type': 'trade_publication',
                'priority': 1
            },
            'rbrtvbr': {
                'name': 'RBR-TVBR',
                'rss_url': 'https://rbr.com/feed/',
                'type': 'trade_publication',
                'priority': 1
            },
            'insideaudiomarketing': {
                'name': 'Inside Audio Marketing',
                'rss_url': 'https://www.insideaudiomarketing.com/feed',
                'type': 'trade_publication',
                'priority': 1
            },
        }

    def fetch_rss_feed(self, url: str, source_name: str) -> List[Dict]:
        try:
            logger.info(f"Fetching RSS feed from {source_name}: {url}")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            feed = feedparser.parse(response.content)
            
            if not feed.entries:
                logger.warning(f"No entries found in feed from {source_name}")
                return []
            
            articles = []
            cutoff_date = datetime.now() - timedelta(hours=48)
            
            for entry in feed.entries:
                try:
                    pub_date = self.parse_date(entry)
                    
                    if pub_date and pub_date < cutoff_date:
                        continue
                    
                    article = {
                        'title': self.clean_text(entry.get('title', 'No title')),
                        'description': self.extract_description(entry),
                        'url': entry.get('link', ''),
                        'published': pub_date.isoformat() if pub_date else datetime.now().isoformat(),
                        'source': source_name,
                        'image': self.extract_image(entry),
                        'content_type': 'news'
                    }
                    
                    if article['title'] and len(article['title']) > 10:
                        articles.append(article)
                        
                except Exception as e:
                    logger.error(f"Error processing entry from {source_name}: {e}")
                    continue
            
            logger.info(f"Successfully fetched {len(articles)} articles from {source_name}")
            return articles
            
        except Exception as e:
            logger.error(f"Error fetching RSS from {source_name}: {e}")
            return []

    def parse_date(self, entry: Dict) -> Optional[datetime]:
        date_fields = ['published_parsed', 'updated_parsed', 'created_parsed']
        
        for field in date_fields:
            if hasattr(entry, field):
                date_tuple = getattr(entry, field)
                if date_tuple:
                    try:
                        return datetime(*date_tuple[:6])
                    except:
                        pass
        
        date_strings = ['published', 'updated', 'created', 'pubDate']
        for field in date_strings:
            if field in entry:
                try:
                    return date_parser.parse(entry[field])
                except:
                    pass
        
        return datetime.now()

    def extract_description(self, entry: Dict) -> str:
        description = ''
        
        if 'summary' in entry:
            description = entry.summary
        elif 'description' in entry:
            description = entry.description
        elif 'content' in entry and entry.content:
            description = entry.content[0].get('value', '')
        
        description = self.clean_html(description)
        description = self.clean_text(description)
        
        words = description.split()
        if len(words) > 100:
            description = ' '.join(words[:100]) + '...'
        
        return description or "No description available."

    def extract_image(self, entry: Dict) -> Optional[str]:
        if hasattr(entry, 'media_content') and entry.media_content:
            for media in entry.media_content:
                if 'url' in media:
                    return media['url']
        
        if hasattr(entry, 'media_thumbnail') and entry.media_thumbnail:
            return entry.media_thumbnail[0].get('url')
        
        if 'enclosures' in entry:
            for enclosure in entry.enclosures:
                if enclosure.get('type', '').startswith('image/'):
                    return enclosure.get('href') or enclosure.get('url')
        
        content = entry.get('summary', '') or entry.get('description', '')
        if 'content' in entry and entry.content:
            content = entry.content[0].get('value', '')
        
        img_match = re.search(r'<img[^>]+src=["\'](https?://[^"\']+)["\']', content, re.IGNORECASE)
        if img_match:
            return img_match.group(1)
        
        return None

    def clean_html(self, text: str) -> str:
        if not text:
            return ""
        
        soup = BeautifulSoup(text, 'html.parser')
        return soup.get_text()

    def clean_text(self, text: str) -> str:
        if not text:
            return ""
        
        text = re.sub(r'\s+', ' ', text)
        text = text.replace('\u201c', '"').replace('\u201d', '"')
        text = text.replace('\u2018', "'").replace('\u2019', "'")
        text = text.replace('\u2013', '-').replace('\u2014', '-')
        
        return text.strip()

    async def aggregate_all(self) -> List[Dict]:
        all_articles = []
        
        for source_id, source_config in self.sources.items():
            try:
                articles = self.fetch_rss_feed(
                    source_config['rss_url'],
                    source_config['name']
                )
                all_articles.extend(articles)
            except Exception as e:
                logger.error(f"Error processing source {source_id}: {e}")
                continue
        
        all_articles.sort(key=lambda x: x['published'], reverse=True)
        
        return all_articles
