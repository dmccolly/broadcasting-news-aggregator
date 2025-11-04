import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from dateutil import parser as date_parser
from typing import List, Dict, Optional
import re
import logging
import time
import random
import hashlib

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BoiseRadioScraper:
    def __init__(self):
        # Top 15 Boise radio stations - ALL GET EQUAL TREATMENT
        self.stations = {
            'thebull': {
                'name': '101.9 The Bull',
                'homepage': 'https://boisebull.com',
                'subpages': ['/contests/', '/shows-schedule/', '/events/'],
                'logo': 'https://boisebull.com/wp-content/uploads/2021/01/bull-logo.png',
            },
            'my1027': {
                'name': 'My 102.7',
                'homepage': 'https://my1027.com',
                'subpages': ['/contests/', '/events/', '/category/entertainment/'],
                'logo': 'https://my1027.com/wp-content/uploads/2021/01/my1027-logo.png',
            },
            'bobfm': {
                'name': '96.1 Bob FM',
                'homepage': 'https://961bobfm.com',
                'subpages': ['/contests/', '/events/'],
                'logo': 'https://961bobfm.com/wp-content/uploads/2021/01/bobfm-logo.png',
            },
            'eagle969': {
                'name': '96.9 The Eagle',
                'homepage': 'https://www.kkgl.com',
                'subpages': ['/shows/', '/events/'],
                'logo': 'https://www.kkgl.com/wp-content/uploads/2021/01/eagle-logo.png',
            },
            'xrock': {
                'name': '100.3 The X',
                'homepage': 'https://www.xrock.com',
                'subpages': ['/category/contests/', '/events/', '/podcast/'],
                'logo': 'https://www.xrock.com/wp-content/uploads/2021/01/xrock-logo.png',
            },
            'wowcountry': {
                'name': 'Wow Country 104.3',
                'homepage': 'https://wowcountry1043.com',
                'subpages': ['/contests/', '/events/'],
                'logo': 'https://wowcountry1043.com/wp-content/uploads/2021/01/wow-logo.png',
            },
            'kboi': {
                'name': 'KBOI 93.1FM & 670AM',
                'homepage': 'https://kboi.com',
                'subpages': ['/blog/', '/events/'],
                'logo': 'https://kboi.com/wp-content/uploads/2021/01/kboi-logo.png',
            },
            'kido': {
                'name': 'KIDO Talk Radio',
                'homepage': 'https://kidotalkradio.com',
                'subpages': ['/blog/'],  # Only 1 page
                'logo': 'https://kidotalkradio.com/wp-content/uploads/2021/01/kido-logo.png',
            },
            'wild101': {
                'name': 'Wild 101',
                'homepage': 'https://wild101.com',
                'subpages': ['/contests/', '/events/'],
                'logo': 'https://wild101.com/wp-content/uploads/2021/01/wild-logo.png',
            },
            'kissfm': {
                'name': '103.5 Kiss FM',
                'homepage': 'https://1035kissfm.com',
                'subpages': ['/contests/', '/events/'],
                'logo': 'https://1035kissfm.com/wp-content/uploads/2021/01/kissfm-logo.png',
            },
            'river': {
                'name': '94.9 The River',
                'homepage': 'https://riverboise.com',
                'subpages': ['/category/contests/', '/events/', '/podcast/'],
                'logo': 'https://riverboise.com/wp-content/uploads/2021/01/river-logo.png',
            },
            'q927': {
                'name': 'Q92.7 KQFC',
                'homepage': 'https://www.q927.com',
                'subpages': ['/shows/', '/events/'],
                'logo': 'https://www.q927.com/wp-content/uploads/2021/01/q927-logo.png',
            },
            'hankfm': {
                'name': 'Hank FM',
                'homepage': 'https://hankfm.com',
                'subpages': ['/contests/', '/events/'],
                'logo': 'https://hankfm.com/wp-content/uploads/2021/01/hank-logo.png',
            },
            'ktik': {
                'name': '93.1 KTIK',
                'homepage': 'https://931ktik.com',
                'subpages': ['/shows/', '/blog/'],
                'logo': 'https://931ktik.com/wp-content/uploads/2021/01/ktik-logo.png',
            },
            'kfxd': {
                'name': '630 KFXD',
                'homepage': 'https://kfxd.com',
                'subpages': ['/shows/', '/blog/'],
                'logo': 'https://kfxd.com/wp-content/uploads/2021/01/kfxd-logo.png',
            },
        }
        
        # 5 different fallback images for variety
        self.fallback_images = [
            'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',  # Radio microphone
            'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800',  # Music concert
            'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800',  # DJ equipment
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',  # Headphones
            'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800',  # Radio tower
        ]
        
        # Political keywords to filter out
        self.political_keywords = [
            'trump', 'biden', 'election', 'vote', 'campaign', 'republican', 'democrat',
            'congress', 'senate', 'governor', 'mayor', 'political', 'politics'
        ]
        
        # Contest keywords to identify legitimate contests
        self.contest_keywords = ['win', 'giveaway', 'contest', 'enter to', 'prize', 'tickets']
        
        # Track seen articles by hash to avoid duplicates
        self.seen_hashes = set()

    def get_article_hash(self, article: Dict) -> str:
        """Generate a hash for an article to detect duplicates"""
        content = f"{article.get('title', '')}{article.get('url', '')}{article.get('source', '')}"
        return hashlib.md5(content.encode()).hexdigest()

    def is_political_content(self, text: str) -> bool:
        """Check if content is political"""
        text_lower = text.lower()
        has_political = any(keyword in text_lower for keyword in self.political_keywords)
        has_contest = any(keyword in text_lower for keyword in self.contest_keywords)
        # Filter out if political AND not a contest
        return has_political and not has_contest

    def get_fallback_image(self, station_logo: str) -> str:
        """Get a random fallback image (70% varied, 30% station logo)"""
        if random.random() < 0.3:
            return station_logo
        return random.choice(self.fallback_images)

    def scrape_with_requests(self, url: str, station_name: str, timeout: int = 10) -> List[Dict]:
        """Scrape using requests library only - fast and lightweight"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            # Find article elements
            article_elements = soup.find_all(['article', 'div'], class_=re.compile(r'post|article|entry|item|card'))
            
            for element in article_elements[:10]:  # Limit to 10 per page
                try:
                    # Extract title
                    title_elem = element.find(['h1', 'h2', 'h3', 'h4', 'a'], class_=re.compile(r'title|headline|entry-title'))
                    if not title_elem:
                        continue
                    
                    title = self.clean_text(title_elem.get_text())
                    if len(title) < 10:
                        continue
                    
                    # Filter political content
                    if self.is_political_content(title):
                        logger.info(f"Filtered political content: {title}")
                        continue
                    
                    # Extract link
                    link_elem = element.find('a', href=True)
                    link = link_elem['href'] if link_elem else url
                    if not link.startswith('http'):
                        from urllib.parse import urljoin
                        link = urljoin(url, link)
                    
                    # Extract description
                    desc_elem = element.find(['p', 'div'], class_=re.compile(r'excerpt|summary|description'))
                    description = self.clean_text(desc_elem.get_text()) if desc_elem else title
                    
                    # Extract image
                    img_elem = element.find('img', src=True)
                    image = img_elem['src'] if img_elem else None
                    if image and not image.startswith('http'):
                        from urllib.parse import urljoin
                        image = urljoin(url, image)
                    
                    # Extract date
                    date_elem = element.find(['time', 'span'], class_=re.compile(r'date|time|published'))
                    published = datetime.now()
                    if date_elem:
                        try:
                            date_str = date_elem.get('datetime') or date_elem.get_text()
                            published = date_parser.parse(date_str)
                        except:
                            pass
                    
                    # Only include recent content (last 7 days)
                    if (datetime.now() - published).days > 7:
                        continue
                    
                    # Determine content type
                    content_type = self.classify_content_type(title + ' ' + description)
                    
                    article = {
                        'title': title,
                        'url': link,  # Changed from 'link' to 'url' to match frontend expectations
                        'description': description[:200],
                        'image': image,
                        'source': station_name,
                        'published': published.isoformat(),
                        'content_type': content_type
                    }
                    
                    # Check for duplicates
                    article_hash = self.get_article_hash(article)
                    if article_hash not in self.seen_hashes:
                        self.seen_hashes.add(article_hash)
                        articles.append(article)
                
                except Exception as e:
                    logger.debug(f"Error parsing article element: {e}")
                    continue
            
            logger.info(f"Found {len(articles)} articles from {url}")
            return articles
            
        except Exception as e:
            logger.error(f"Error scraping {url}: {e}")
            return []

    def classify_content_type(self, text: str) -> str:
        """Classify the type of content"""
        text = text.lower()
        if any(word in text for word in ['contest', 'giveaway', 'win', 'enter to win', 'prize']):
            return 'contest'
        elif any(word in text for word in ['event', 'concert', 'show', 'festival', 'performance', 'live music']):
            return 'event'
        elif any(word in text for word in ['podcast', 'episode', 'listen', 'audio']):
            return 'podcast'
        elif any(word in text for word in ['interview', 'conversation', 'talk with']):
            return 'interview'
        elif any(word in text for word in ['staff', 'team', 'host', 'dj', 'on-air']):
            return 'staff'
        elif any(word in text for word in ['promotion', 'promo', 'special offer']):
            return 'promotion'
        else:
            return 'entertainment'

    def is_station_specific_content(self, content_type: str) -> bool:
        """Filter to only include content ABOUT the station, not general news they cover"""
        station_specific_types = ['contest', 'event', 'podcast', 'interview', 'staff', 'promotion', 'station_info']
        return content_type in station_specific_types

    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        if not text:
            return ""
        text = re.sub(r'\s+', ' ', text)
        text = text.replace('\u201c', '"').replace('\u201d', '"')
        text = text.replace('\u2018', "'").replace('\u2019', "'")
        text = text.replace('\u2013', '-').replace('\u2014', '-')
        return text.strip()

    def apply_diversity_filter(self, articles: List[Dict], window_size: int = 10, max_per_station: int = 2) -> List[Dict]:
        """
        Ensure no station appears more than max_per_station times in any window_size consecutive articles.
        This creates a balanced, varied feed throughout.
        """
        if len(articles) <= window_size:
            return articles
        
        filtered = []
        
        for article in articles:
            # Check the last window_size articles
            window_start = max(0, len(filtered) - window_size)
            recent_articles = filtered[window_start:]
            
            # Count how many times this station appears in the window
            station = article['source']
            count_in_window = sum(1 for a in recent_articles if a['source'] == station)
            
            # Only add if under the limit
            if count_in_window < max_per_station:
                filtered.append(article)
        
        logger.info(f"Diversity filter: {len(articles)} -> {len(filtered)} articles")
        return filtered

    async def scrape_all_stations(self, station_specific_only: bool = False) -> List[Dict]:
        """Scrape all stations with equal treatment and diversity filtering"""
        all_content = []
        self.seen_hashes.clear()
        
        # Shuffle stations for variety
        station_items = list(self.stations.items())
        random.shuffle(station_items)
        
        for station_id, station_config in station_items:
            try:
                station_name = station_config['name']
                logger.info(f"Scraping {station_name}...")
                
                # Randomly select 1-2 subpages per station
                subpages = station_config.get('subpages', [])
                num_pages = min(random.randint(1, 2), len(subpages))
                selected_pages = random.sample(subpages, num_pages) if subpages else []
                
                # Add homepage
                urls_to_scrape = [station_config['homepage']] + [
                    station_config['homepage'].rstrip('/') + page for page in selected_pages
                ]
                
                for url in urls_to_scrape:
                    try:
                        articles = self.scrape_with_requests(url, station_name, timeout=8)
                        
                        # Add fallback images
                        for article in articles:
                            if not article.get('image'):
                                article['image'] = self.get_fallback_image(station_config['logo'])
                        
                        all_content.extend(articles)
                        time.sleep(random.uniform(0.5, 1.5))  # Short delay
                        
                    except Exception as e:
                        logger.error(f"Error scraping {url}: {e}")
                        continue
                        
            except Exception as e:
                logger.error(f"Error processing station {station_id}: {e}")
                continue
        
        # Sort by published date (newest first)
        all_content.sort(key=lambda x: x['published'], reverse=True)
        
        # Apply diversity filter: max 2 per station in any 10-article window
        diverse_content = self.apply_diversity_filter(all_content, window_size=10, max_per_station=2)
        
        logger.info(f"Total articles collected: {len(diverse_content)}")
        return diverse_content
