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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BoiseRadioScraper:
    def __init__(self):
        # Top 15 Boise radio stations by Nielsen ratings (Spring 2025)
        # Weighted by share to ensure proper representation
        self.stations = {
            'thebull': {
                'name': '101.9 The Bull',
                'homepage': 'https://boisebull.com',
                'subpages': ['/contests/', '/shows-schedule/', '/category/music/', '/events/'],
                'logo': 'https://boisebull.com/wp-content/uploads/2021/01/bull-logo.png',
                'weight': 6.6,  # Nielsen share
                'priority': 'high'
            },
            'my1027': {
                'name': 'My 102.7',
                'homepage': 'https://my1027.com',
                'subpages': ['/contests/', '/events/', '/shows/', '/category/music/'],
                'logo': 'https://my1027.com/wp-content/uploads/2021/01/my1027-logo.png',
                'weight': 5.8,
                'priority': 'high'
            },
            'bobfm': {
                'name': '96.1 Bob FM',
                'homepage': 'https://961bobfm.com',
                'subpages': ['/contests/', '/view-playlist/', '/bob/', '/events/'],
                'logo': 'https://961bobfm.com/wp-content/uploads/2021/01/bobfm-logo.png',
                'weight': 5.5,
                'priority': 'high'
            },
            'eagle969': {
                'name': '96.9 The Eagle',
                'homepage': 'https://www.kkgl.com',
                'subpages': ['/shows/', '/events/', '/blog/'],
                'logo': 'https://www.kkgl.com/wp-content/uploads/2021/01/eagle-logo.png',
                'weight': 4.3,
                'priority': 'medium'
            },
            'xrock': {
                'name': '100.3 The X',
                'homepage': 'https://www.xrock.com',
                'subpages': ['/category/contests/', '/events/', '/podcast/', '/category/blogs/', '/on-air/', '/be-our-guest/'],
                'logo': 'https://www.xrock.com/wp-content/uploads/2021/01/xrock-logo.png',
                'weight': 3.7,
                'priority': 'high'  # Deep scraping priority
            },
            'wowcountry': {
                'name': 'Wow Country 104.3',
                'homepage': 'https://wowcountry1043.com',
                'subpages': ['/contests/', '/events/', '/shows/', '/category/music/'],
                'logo': 'https://wowcountry1043.com/wp-content/uploads/2021/01/wow-logo.png',
                'weight': 3.3,
                'priority': 'medium'
            },
            'kboi': {
                'name': 'KBOI 93.1FM & 670AM',
                'homepage': 'https://kboi.com',
                'subpages': ['/blog/', '/events/', '/contests/', '/shows/'],
                'logo': 'https://kboi.com/wp-content/uploads/2021/01/kboi-logo.png',
                'weight': 3.3,
                'priority': 'medium'
            },
            'kido': {
                'name': 'KIDO Talk Radio',
                'homepage': 'https://kidotalkradio.com',
                'subpages': ['/blog/', '/news/'],  # Reduced subpages
                'logo': 'https://kidotalkradio.com/wp-content/uploads/2021/01/kido-logo.png',
                'weight': 2.9,
                'priority': 'low'  # Reduced priority
            },
            'wild101': {
                'name': 'Wild 101',
                'homepage': 'https://wild101.com',
                'subpages': ['/contests/', '/events/', '/shows/', '/category/music/'],
                'logo': 'https://wild101.com/wp-content/uploads/2021/01/wild-logo.png',
                'weight': 2.9,
                'priority': 'medium'
            },
            'kissfm': {
                'name': '103.5 Kiss FM',
                'homepage': 'https://1035kissfm.com',
                'subpages': ['/contests/', '/events/', '/shows/', '/category/music/'],
                'logo': 'https://1035kissfm.com/wp-content/uploads/2021/01/kiss-logo.png',
                'weight': 2.5,
                'priority': 'medium'
            },
            'riverboise': {
                'name': '94.9 The River',
                'homepage': 'https://www.riverboise.com',
                'subpages': ['/contests/', '/events/', '/podcast/', '/blogs/', '/on-air/', '/be-our-guest/'],
                'logo': 'https://www.riverboise.com/wp-content/uploads/2021/01/river-logo.png',
                'weight': 2.3,
                'priority': 'high'  # Deep scraping priority
            },
            'q927': {
                'name': 'Q92.7 KQFC',
                'homepage': 'https://q927.com',
                'subpages': ['/blog/', '/events/', '/contests/'],
                'logo': 'https://q927.com/logo.png',
                'weight': 1.2,
                'priority': 'low'
            },
            'hankfm': {
                'name': 'Hank FM',
                'homepage': 'https://hankfm.com',
                'subpages': ['/contests/', '/events/', '/category/music/'],
                'logo': 'https://hankfm.com/logo.png',
                'weight': 1.2,
                'priority': 'low'
            },
            'ktik': {
                'name': '93.1 KTIK',
                'homepage': 'https://931ktik.com',
                'subpages': ['/blog/', '/sports/', '/shows/'],
                'logo': 'https://931ktik.com/logo.png',
                'weight': 1.2,
                'priority': 'low'
            },
            'kfxd': {
                'name': '630 KFXD',
                'homepage': 'https://630kfxd.com',
                'subpages': ['/blog/', '/news/', '/shows/'],
                'logo': 'https://630kfxd.com/logo.png',
                'weight': 0.4,
                'priority': 'low'
            }
        }
        
        self.chrome_options = Options()
        self.chrome_options.add_argument('--headless')
        self.chrome_options.add_argument('--no-sandbox')
        self.chrome_options.add_argument('--disable-dev-shm-usage')
        self.chrome_options.add_argument('--disable-gpu')
        self.chrome_options.add_argument('--window-size=1920,1080')
        self.chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')

    def get_driver(self):
        return webdriver.Chrome(options=self.chrome_options)

    def get_dynamic_page_selection(self, station_config: Dict) -> List[str]:
        """
        Dynamically vary which pages are scraped each time to ensure fresh, varied content.
        High priority stations get more pages, low priority get fewer.
        """
        priority = station_config.get('priority', 'medium')
        subpages = station_config.get('subpages', [])
        
        if priority == 'high':
            # Deep scraping: use all pages plus homepage
            num_pages = min(len(subpages) + 1, 6)  # Up to 6 pages
            selected_subpages = subpages[:num_pages-1] if len(subpages) >= num_pages-1 else subpages
        elif priority == 'medium':
            # Moderate scraping: randomly select 2-3 pages plus homepage
            num_pages = min(random.randint(2, 3), len(subpages))
            selected_subpages = random.sample(subpages, num_pages) if len(subpages) >= num_pages else subpages
        else:  # low priority
            # Light scraping: randomly select 1-2 pages, sometimes skip homepage
            num_pages = min(random.randint(1, 2), len(subpages))
            selected_subpages = random.sample(subpages, num_pages) if len(subpages) >= num_pages else subpages
            # 50% chance to skip homepage for low priority
            if random.random() < 0.5:
                return [station_config['homepage'] + page for page in selected_subpages]
        
        return [station_config['homepage']] + [station_config['homepage'] + page for page in selected_subpages]

    def scrape_with_requests(self, url: str, station_name: str) -> List[Dict]:
        try:
            logger.info(f"Scraping {station_name} from {url} with requests")
            
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            articles = []
            
            # Enhanced article selectors for better content discovery
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
            
            # Remove duplicates while preserving order
            seen = set()
            unique_articles = []
            for article in found_articles:
                article_id = id(article)
                if article_id not in seen:
                    seen.add(article_id)
                    unique_articles.append(article)
            
            cutoff_date = datetime.now() - timedelta(days=14)  # Extended to 14 days for more content
            
            # Process more articles for high-priority stations
            max_articles = 30
            
            for article_elem in unique_articles[:max_articles]:
                try:
                    article = self.extract_article_data(article_elem, station_name, url)
                    if article and article.get('title'):
                        pub_date = date_parser.parse(article['published']) if article.get('published') else datetime.now()
                        if pub_date >= cutoff_date:
                            articles.append(article)
                except Exception as e:
                    logger.debug(f"Error extracting article: {e}")
                    continue
            
            logger.info(f"Found {len(articles)} articles from {station_name}")
            return articles
            
        except Exception as e:
            logger.error(f"Error scraping {station_name} with requests: {e}")
            return []

    def scrape_with_selenium(self, url: str, station_name: str) -> List[Dict]:
        driver = None
        try:
            logger.info(f"Scraping {station_name} from {url} with Selenium")
            
            driver = self.get_driver()
            driver.get(url)
            
            time.sleep(3)
            
            # Scroll to load dynamic content
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
            time.sleep(1)
            
            page_source = driver.page_source
            soup = BeautifulSoup(page_source, 'html.parser')
            
            articles = []
            article_selectors = [
                'article',
                '.post',
                '.entry',
                '.blog-post',
                '.news-item',
                '.event-item',
                '.contest-item',
                '.podcast-item',
                '.show-item'
            ]
            
            found_articles = []
            for selector in article_selectors:
                found_articles.extend(soup.select(selector))
            
            cutoff_date = datetime.now() - timedelta(days=14)
            
            for article_elem in found_articles[:30]:
                try:
                    article = self.extract_article_data(article_elem, station_name, url)
                    if article and article.get('title'):
                        pub_date = date_parser.parse(article['published']) if article.get('published') else datetime.now()
                        if pub_date >= cutoff_date:
                            articles.append(article)
                except Exception as e:
                    logger.debug(f"Error extracting article: {e}")
                    continue
            
            logger.info(f"Found {len(articles)} articles from {station_name} with Selenium")
            return articles
            
        except Exception as e:
            logger.error(f"Error scraping {station_name} with Selenium: {e}")
            return []
        finally:
            if driver:
                driver.quit()

    def extract_article_data(self, article_elem, station_name: str, base_url: str) -> Optional[Dict]:
        title_selectors = ['h1', 'h2', 'h3', '.title', '.entry-title', '.post-title', '[class*="title"]']
        title = None
        for selector in title_selectors:
            title_elem = article_elem.select_one(selector)
            if title_elem:
                title = title_elem.get_text(strip=True)
                break
        
        if not title or len(title) < 10:
            return None
        
        desc_selectors = ['.excerpt', '.summary', '.description', 'p', '.entry-content']
        description = ""
        for selector in desc_selectors:
            desc_elem = article_elem.select_one(selector)
            if desc_elem:
                description = desc_elem.get_text(strip=True)
                if len(description) > 50:
                    break
        
        if len(description.split()) > 100:
            description = ' '.join(description.split()[:100]) + '...'
        
        link_elem = article_elem.select_one('a[href]')
        article_url = base_url
        if link_elem:
            href = link_elem.get('href', '')
            if href.startswith('http'):
                article_url = href
            elif href.startswith('/'):
                base_domain = '/'.join(base_url.split('/')[:3])
                article_url = base_domain + href
        
        image = self.extract_image_from_element(article_elem)
        
        date_selectors = ['.date', '.published', '.post-date', 'time', '[class*="date"]']
        published = None
        for selector in date_selectors:
            date_elem = article_elem.select_one(selector)
            if date_elem:
                date_text = date_elem.get('datetime') or date_elem.get_text(strip=True)
                try:
                    published = date_parser.parse(date_text)
                    break
                except:
                    pass
        
        if not published:
            published = datetime.now()
        
        content_type = self.determine_content_type(title, description, article_url)
        
        return {
            'title': self.clean_text(title),
            'description': self.clean_text(description) or "No description available.",
            'url': article_url,
            'published': published.isoformat(),
            'source': station_name,
            'image': image,
            'content_type': content_type
        }

    def extract_image_from_element(self, element) -> Optional[str]:
        img_elem = element.select_one('img[src]')
        if img_elem:
            src = img_elem.get('src', '')
            if src and not src.startswith('data:'):
                if src.startswith('//'):
                    return 'https:' + src
                elif src.startswith('http'):
                    return src
                elif src.startswith('/'):
                    return src
        
        style = element.get('style', '')
        bg_match = re.search(r'background-image:\s*url\(["\']?(https?://[^"\']+)["\']?\)', style)
        if bg_match:
            return bg_match.group(1)
        
        return None

    def determine_content_type(self, title: str, description: str, url: str) -> str:
        text = f"{title} {description} {url}".lower()
        
        if any(word in text for word in ['contest', 'giveaway', 'win', 'prize', 'enter to win', 'sweepstakes']):
            return 'contest'
        elif any(word in text for word in ['event', 'concert', 'show', 'performance', 'festival', 'live music']):
            return 'event'
        elif any(word in text for word in ['podcast', 'episode', 'listen now', 'new episode']):
            return 'podcast'
        elif any(word in text for word in ['interview', 'conversation', 'talk with', 'sits down with', 'exclusive interview']):
            return 'interview'
        elif any(word in text for word in ['staff', 'team', 'host', 'dj', 'on-air', 'announcer', 'morning show', 'afternoon drive']):
            return 'staff'
        elif any(word in text for word in ['promotion', 'promo', 'special offer', 'limited time']):
            return 'promotion'
        elif any(word in text for word in ['about us', 'station', 'history', 'announcement', 'new format']):
            return 'station_info'
        else:
            return 'entertainment'
    
    def is_station_specific_content(self, content_type: str) -> bool:
        """Filter to only include content ABOUT the station, not general news they cover"""
        station_specific_types = ['contest', 'event', 'podcast', 'interview', 'staff', 'promotion', 'station_info']
        return content_type in station_specific_types

    def clean_text(self, text: str) -> str:
        if not text:
            return ""
        
        text = re.sub(r'\s+', ' ', text)
        text = text.replace('\u201c', '"').replace('\u201d', '"')
        text = text.replace('\u2018', "'").replace('\u2019', "'")
        text = text.replace('\u2013', '-').replace('\u2014', '-')
        
        return text.strip()

    async def scrape_all_stations(self, station_specific_only: bool = False) -> List[Dict]:
        all_content = []
        
        # Shuffle stations to vary scraping order each time
        station_items = list(self.stations.items())
        random.shuffle(station_items)
        
        for station_id, station_config in station_items:
            try:
                # Get dynamic page selection based on priority
                urls_to_scrape = self.get_dynamic_page_selection(station_config)
                
                logger.info(f"Scraping {station_config['name']} ({station_config['priority']} priority) - {len(urls_to_scrape)} pages")
                
                for url in urls_to_scrape:
                    try:
                        articles = self.scrape_with_requests(url, station_config['name'])
                        
                        # Selenium disabled for performance
                        # if not articles:
                        #     articles = self.scrape_with_selenium(url, station_config['name'])
                        
                        for article in articles:
                            if not article.get('image'):
                                article['image'] = station_config.get('logo')
                        
                        if station_specific_only:
                            articles = [a for a in articles if self.is_station_specific_content(a.get('content_type', ''))]
                        
                        all_content.extend(articles)
                        
                        # Vary delay time randomly
                        time.sleep(random.uniform(1.5, 3.0))
                        
                    except Exception as e:
                        logger.error(f"Error scraping {url}: {e}")
                        continue
                        
            except Exception as e:
                logger.error(f"Error processing station {station_id}: {e}")
                continue
        
        # Sort by published date
        all_content.sort(key=lambda x: x['published'], reverse=True)
        
        # Apply weighted sampling to ensure proper representation
        # High-rated stations should appear more frequently
        weighted_content = self.apply_weighted_distribution(all_content)
        
        logger.info(f"Total articles collected: {len(weighted_content)}")
        return weighted_content
    
    def apply_weighted_distribution(self, articles: List[Dict]) -> List[Dict]:
        """
        Ensure content distribution reflects Nielsen ratings.
        Higher-rated stations get more representation.
        """
        # Group articles by station
        station_articles = {}
        for article in articles:
            source = article['source']
            if source not in station_articles:
                station_articles[source] = []
            station_articles[source].append(article)
        
        # Calculate target counts based on weights
        total_weight = sum(config['weight'] for config in self.stations.values())
        target_total = min(len(articles), 100)  # Cap at 100 articles
        
        weighted_articles = []
        for station_id, station_config in self.stations.items():
            station_name = station_config['name']
            if station_name in station_articles:
                weight = station_config['weight']
                target_count = int((weight / total_weight) * target_total)
                station_items = station_articles[station_name][:target_count]
                weighted_articles.extend(station_items)
        
        # Sort by date again
        weighted_articles.sort(key=lambda x: x['published'], reverse=True)
        
        return weighted_articles
