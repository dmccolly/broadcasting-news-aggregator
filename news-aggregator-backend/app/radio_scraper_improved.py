import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
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
                'subpages': ['/contests/', '/shows-schedule/', '/category/music/', '/events/', '/category/local-news/'],
                'logo': 'https://boisebull.com/wp-content/uploads/2021/01/bull-logo.png',
            },
            'my1027': {
                'name': 'My 102.7',
                'homepage': 'https://my1027.com',
                'subpages': ['/contests/', '/events/', '/shows/', '/category/music/', '/category/entertainment/'],
                'logo': 'https://my1027.com/wp-content/uploads/2021/01/my1027-logo.png',
            },
            'bobfm': {
                'name': '96.1 Bob FM',
                'homepage': 'https://961bobfm.com',
                'subpages': ['/contests/', '/view-playlist/', '/bob/', '/events/', '/category/entertainment/'],
                'logo': 'https://961bobfm.com/wp-content/uploads/2021/01/bobfm-logo.png',
            },
            'eagle969': {
                'name': '96.9 The Eagle',
                'homepage': 'https://www.kkgl.com',
                'subpages': ['/shows/', '/events/', '/blog/', '/contests/'],
                'logo': 'https://www.kkgl.com/wp-content/uploads/2021/01/eagle-logo.png',
            },
            'xrock': {
                'name': '100.3 The X',
                'homepage': 'https://www.xrock.com',
                'subpages': ['/category/contests/', '/events/', '/podcast/', '/category/blogs/', '/on-air/', '/be-our-guest/'],
                'logo': 'https://www.xrock.com/wp-content/uploads/2021/01/xrock-logo.png',
            },
            'wowcountry': {
                'name': 'Wow Country 104.3',
                'homepage': 'https://wowcountry1043.com',
                'subpages': ['/contests/', '/events/', '/shows/', '/category/music/', '/category/local/'],
                'logo': 'https://wowcountry1043.com/wp-content/uploads/2021/01/wow-logo.png',
            },
            'kboi': {
                'name': 'KBOI 93.1FM & 670AM',
                'homepage': 'https://kboi.com',
                'subpages': ['/blog/', '/events/', '/contests/', '/shows/', '/category/entertainment/'],
                'logo': 'https://kboi.com/wp-content/uploads/2021/01/kboi-logo.png',
            },
            'kido': {
                'name': 'KIDO Talk Radio',
                'homepage': 'https://kidotalkradio.com',
                'subpages': ['/blog/', '/shows/'],  # Reduced - less news focus
                'logo': 'https://kidotalkradio.com/wp-content/uploads/2021/01/kido-logo.png',
            },
            'wild101': {
                'name': 'Wild 101',
                'homepage': 'https://wild101.com',
                'subpages': ['/contests/', '/events/', '/shows/', '/category/music/', '/category/entertainment/'],
                'logo': 'https://wild101.com/wp-content/uploads/2021/01/wild-logo.png',
            },
            'kissfm': {
                'name': '103.5 Kiss FM',
                'homepage': 'https://1035kissfm.com',
                'subpages': ['/contests/', '/events/', '/shows/', '/category/music/', '/category/entertainment/'],
                'logo': 'https://1035kissfm.com/wp-content/uploads/2021/01/kiss-logo.png',
            },
            'riverboise': {
                'name': '94.9 The River',
                'homepage': 'https://www.riverboise.com',
                'subpages': ['/contests/', '/events/', '/podcast/', '/blogs/', '/on-air/', '/be-our-guest/'],
                'logo': 'https://www.riverboise.com/wp-content/uploads/2021/01/river-logo.png',
            },
            'q927': {
                'name': 'Q92.7 KQFC',
                'homepage': 'https://q927.com',
                'subpages': ['/blog/', '/events/', '/contests/', '/shows/'],
                'logo': 'https://q927.com/logo.png',
            },
            'hankfm': {
                'name': 'Hank FM',
                'homepage': 'https://hankfm.com',
                'subpages': ['/contests/', '/events/', '/category/music/', '/shows/'],
                'logo': 'https://hankfm.com/logo.png',
            },
            'ktik': {
                'name': '93.1 KTIK',
                'homepage': 'https://931ktik.com',
                'subpages': ['/blog/', '/sports/', '/shows/', '/events/'],
                'logo': 'https://931ktik.com/logo.png',
            },
            'kfxd': {
                'name': '630 KFXD',
                'homepage': 'https://630kfxd.com',
                'subpages': ['/blog/', '/shows/', '/events/'],
                'logo': 'https://630kfxd.com/logo.png',
            }
        }
        
        # 5 fallback graphics for variety
        self.fallback_images = [
            'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',  # Radio microphone
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',  # Music concert
            'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',  # DJ equipment
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',  # Headphones
            'https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=800',  # Radio tower
        ]
        
        self.chrome_options = Options()
        self.chrome_options.add_argument('--headless')
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.chrome_options.add_argument('--disable-gpu')
        self.chrome_options.add_argument('--window-size=1920,1080')
        self.chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        # Track scraped content to avoid duplicates
        self.scraped_hashes = set()

    def get_driver(self):
        return webdriver.Chrome(options=self.chrome_options)

    def get_dynamic_page_selection(self, station_config: Dict) -> List[str]:
        """
        Randomly select 2-3 pages from each station for variety.
        All stations get equal treatment.
        """
        subpages = station_config.get('subpages', [])
        
        # Randomly select 2-3 subpages plus homepage
        num_pages = min(random.randint(2, 3), len(subpages))
        selected_subpages = random.sample(subpages, num_pages) if len(subpages) >= num_pages else subpages
        
        return [station_config['homepage']] + [station_config['homepage'] + page for page in selected_subpages]

    def is_political_content(self, title: str, description: str) -> bool:
        """Filter out political news that's not contest-related"""
        text = (title + ' ' + description).lower()
        
        # Political keywords
        political_keywords = [
            'trump', 'biden', 'election', 'vote', 'campaign', 'congress', 
            'senate', 'republican', 'democrat', 'political', 'governor',
            'legislation', 'bill signed', 'white house', 'president elect'
        ]
        
        # Contest keywords that might appear with political terms
        contest_keywords = ['win', 'giveaway', 'contest', 'enter to', 'prize']
        
        # If it has political keywords
        has_political = any(keyword in text for keyword in political_keywords)
        
        # If it has contest keywords, it's probably a contest, not news
        has_contest = any(keyword in text for keyword in contest_keywords)
        
        # Filter out if political AND not a contest
        return has_political and not has_contest

    def get_content_hash(self, article: Dict) -> str:
        """Generate unique hash for article to detect duplicates"""
        content = f"{article.get('title', '')}{article.get('link', '')}"
        return hashlib.md5(content.encode()).hexdigest()

    def scrape_with_requests(self, url: str, station_name: str) -> List[Dict]:
        try:
            logger.info(f"Scraping {station_name} from {url}")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            # Enhanced article selectors
            article_selectors = [
                'article',
                '.post',
                '.entry',
                '.blog-post',
                '.news-item',
                '.event-item',
                '.contest-item',
                '.podcast-item',
                '.show-item',
                '[class*="post"]',
                '[class*="article"]',
                '[class*="contest"]',
                '[class*="event"]',
                '[class*="podcast"]'
            ]
            
            found_articles = []
            for selector in article_selectors:
                found_articles.extend(soup.select(selector))
            
            # Remove duplicates
            seen = set()
            unique_articles = []
            for article in found_articles:
                article_id = id(article)
                if article_id not in seen:
                    seen.add(article_id)
                    unique_articles.append(article)
            
            cutoff_date = datetime.now() - timedelta(days=7)  # Last 7 days only
            
            for article_elem in unique_articles[:20]:  # Limit to 20 per page
                try:
                    article = self.extract_article_data(article_elem, station_name, url)
                    if article and article.get('title'):
                        # Check for duplicates
                        article_hash = self.get_content_hash(article)
                        if article_hash in self.scraped_hashes:
                            continue
                        
                        # Filter political content
                        if self.is_political_content(article.get('title', ''), article.get('description', '')):
                            logger.info(f"Filtered political content: {article.get('title', '')}")
                            continue
                        
                        pub_date = date_parser.parse(article['published']) if article.get('published') else datetime.now()
                        if pub_date >= cutoff_date:
                            self.scraped_hashes.add(article_hash)
                            articles.append(article)
                except Exception as e:
                    logger.debug(f"Error extracting article: {e}")
                    continue
            
            logger.info(f"Found {len(articles)} articles from {station_name}")
            return articles
            
        except Exception as e:
            logger.error(f"Error scraping {station_name}: {e}")
            return []

    def extract_article_data(self, article_elem, station_name: str, source_url: str) -> Optional[Dict]:
        try:
            # Title extraction
            title_elem = (
                article_elem.find('h1') or
                article_elem.find('h2') or
                article_elem.find('h3') or
                article_elem.find(class_=re.compile(r'title|headline', re.I)) or
                article_elem.find('a')
            )
            title = self.clean_text(title_elem.get_text()) if title_elem else None
            
            if not title or len(title) < 10:
                return None
            
            # Link extraction
            link_elem = article_elem.find('a', href=True)
            link = link_elem['href'] if link_elem else source_url
            if link and not link.startswith('http'):
                from urllib.parse import urljoin
                link = urljoin(source_url, link)
            
            # Description extraction
            desc_elem = (
                article_elem.find(class_=re.compile(r'excerpt|summary|description|content', re.I)) or
                article_elem.find('p')
            )
            description = self.clean_text(desc_elem.get_text()) if desc_elem else title
            
            # Image extraction
            img_elem = article_elem.find('img', src=True)
            image = img_elem['src'] if img_elem else None
            if image and not image.startswith('http'):
                from urllib.parse import urljoin
                image = urljoin(source_url, image)
            
            # If no image, use random fallback
            if not image:
                image = random.choice(self.fallback_images)
            
            # Date extraction
            date_elem = (
                article_elem.find('time') or
                article_elem.find(class_=re.compile(r'date|time|published', re.I))
            )
            
            if date_elem:
                date_str = date_elem.get('datetime') or date_elem.get_text()
                try:
                    published = date_parser.parse(date_str).isoformat()
                except:
                    published = datetime.now().isoformat()
            else:
                published = datetime.now().isoformat()
            
            # Determine content type
            content_type = self.determine_content_type(title, description)
            
            return {
                'title': title,
                'link': link,
                'description': description[:300],  # Limit description length
                'image': image,
                'source': station_name,
                'published': published,
                'content_type': content_type
            }
            
        except Exception as e:
            logger.error(f"Error extracting article data: {e}")
            return None

    def determine_content_type(self, title: str, description: str) -> str:
        text = (title + ' ' + description).lower()
        
        if any(word in text for word in ['contest', 'win', 'giveaway', 'enter to win', 'grand prize', 'tickets']):
            return 'contest'
        elif any(word in text for word in ['event', 'concert', 'show', 'festival', 'live music', 'performance']):
            return 'event'
        elif any(word in text for word in ['podcast', 'episode', 'listen now', 'new episode']):
            return 'podcast'
        elif any(word in text for word in ['interview', 'conversation', 'talk with', 'sits down with']):
            return 'interview'
        elif any(word in text for word in ['staff', 'team', 'host', 'dj', 'on-air', 'morning show']):
            return 'staff'
        elif any(word in text for word in ['promotion', 'promo', 'special offer']):
            return 'promotion'
        else:
            return 'entertainment'
    
    def is_station_specific_content(self, content_type: str) -> bool:
        """Filter to only include content ABOUT the station"""
        station_specific_types = ['contest', 'event', 'podcast', 'interview', 'staff', 'promotion']
        return content_type in station_specific_types

    def clean_text(self, text: str) -> str:
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
        This creates variety throughout the feed.
        """
        if len(articles) <= window_size:
            return articles
        
        diverse_articles = []
        
        for article in articles:
            # Check the last window_size articles
            window_start = max(0, len(diverse_articles) - window_size)
            recent_articles = diverse_articles[window_start:]
            
            # Count how many times this station appears in the window
            station_count = sum(1 for a in recent_articles if a['source'] == article['source'])
            
            # Only add if under the limit
            if station_count < max_per_station:
                diverse_articles.append(article)
        
        logger.info(f"Diversity filter: {len(articles)} -> {len(diverse_articles)} articles")
        return diverse_articles

    async def scrape_all_stations(self, station_specific_only: bool = False) -> List[Dict]:
        all_content = []
        
        # Shuffle stations to vary scraping order
        station_items = list(self.stations.items())
        random.shuffle(station_items)
        
        for station_id, station_config in station_items:
            try:
                # Get 2-3 random pages from each station
                urls_to_scrape = self.get_dynamic_page_selection(station_config)
                
                logger.info(f"Scraping {station_config['name']} - {len(urls_to_scrape)} pages")
                
                for url in urls_to_scrape:
                    try:
                        articles = self.scrape_with_requests(url, station_config['name'])
                        
                        # Add station logo as fallback if no image
                        for article in articles:
                            if not article.get('image') or 'unsplash' not in article.get('image', ''):
                                # Use station logo sometimes, fallback images other times
                                if random.random() < 0.3:  # 30% chance to use station logo
                                    article['image'] = station_config.get('logo')
                        
                        if station_specific_only:
                            articles = [a for a in articles if self.is_station_specific_content(a.get('content_type', ''))]
                        
                        all_content.extend(articles)
                        
                        # Random delay
                        time.sleep(random.uniform(1.0, 2.0))
                        
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
        
        logger.info(f"Total articles after diversity filter: {len(diverse_content)}")
        return diverse_content
