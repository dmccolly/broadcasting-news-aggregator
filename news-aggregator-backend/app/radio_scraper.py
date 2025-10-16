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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class BoiseRadioScraper:
    def __init__(self):
        self.stations = {
            'kboi': {
                'name': 'KBOI 93.1FM & 670AM',
                'homepage': 'https://kboi.com',
                'subpages': ['/blog', '/events', '/contests', '/shows'],
                'logo': 'https://kboi.com/wp-content/uploads/2021/01/kboi-logo.png'
            },
            'kido': {
                'name': 'KIDO Talk Radio',
                'homepage': 'https://kidotalkradio.com',
                'subpages': ['/blog', '/news', '/events', '/shows'],
                'logo': 'https://kidotalkradio.com/wp-content/uploads/2021/01/kido-logo.png'
            },
            'power889': {
                'name': 'Power 88.9',
                'homepage': 'https://power889.com',
                'subpages': ['/blog', '/events', '/contests'],
                'logo': 'https://power889.com/logo.png'
            },
            'kfxd': {
                'name': '630 KFXD',
                'homepage': 'https://630kfxd.com',
                'subpages': ['/blog', '/news', '/shows'],
                'logo': 'https://630kfxd.com/logo.png'
            },
            'kqfc': {
                'name': 'Q92.7 KQFC',
                'homepage': 'https://q927.com',
                'subpages': ['/blog', '/events', '/contests'],
                'logo': 'https://q927.com/logo.png'
            },
            'ktik': {
                'name': '93.1 KTIK',
                'homepage': 'https://931ktik.com',
                'subpages': ['/blog', '/sports', '/shows'],
                'logo': 'https://931ktik.com/logo.png'
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
            
            article_selectors = [
                'article',
                '.post',
                '.entry',
                '.blog-post',
                '.news-item',
                '.event-item',
                '.contest-item',
                '[class*="post"]',
                '[class*="article"]'
            ]
            
            found_articles = []
            for selector in article_selectors:
                found_articles.extend(soup.select(selector))
            
            cutoff_date = datetime.now() - timedelta(days=7)
            
            for article_elem in found_articles[:20]:
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
                '.contest-item'
            ]
            
            found_articles = []
            for selector in article_selectors:
                found_articles.extend(soup.select(selector))
            
            cutoff_date = datetime.now() - timedelta(days=7)
            
            for article_elem in found_articles[:20]:
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
        
        if any(word in text for word in ['contest', 'giveaway', 'win', 'prize']):
            return 'contest'
        elif any(word in text for word in ['event', 'concert', 'show', 'performance']):
            return 'event'
        elif any(word in text for word in ['podcast', 'episode', 'listen']):
            return 'podcast'
        elif any(word in text for word in ['interview', 'conversation', 'talk with']):
            return 'interview'
        else:
            return 'news'

    def clean_text(self, text: str) -> str:
        if not text:
            return ""
        
        text = re.sub(r'\s+', ' ', text)
        text = text.replace('\u201c', '"').replace('\u201d', '"')
        text = text.replace('\u2018', "'").replace('\u2019', "'")
        text = text.replace('\u2013', '-').replace('\u2014', '-')
        
        return text.strip()

    async def scrape_all_stations(self) -> List[Dict]:
        all_content = []
        
        for station_id, station_config in self.stations.items():
            try:
                urls_to_scrape = [station_config['homepage']] + [
                    station_config['homepage'] + subpage 
                    for subpage in station_config.get('subpages', [])
                ]
                
                for url in urls_to_scrape[:3]:
                    try:
                        articles = self.scrape_with_requests(url, station_config['name'])
                        
                        # if not articles:
                        #     articles = self.scrape_with_selenium(url, station_config['name'])
                        
                        for article in articles:
                            if not article.get('image'):
                                article['image'] = station_config.get('logo')
                        
                        all_content.extend(articles)
                        
                        time.sleep(2)
                        
                    except Exception as e:
                        logger.error(f"Error scraping {url}: {e}")
                        continue
                        
            except Exception as e:
                logger.error(f"Error processing station {station_id}: {e}")
                continue
        
        all_content.sort(key=lambda x: x['published'], reverse=True)
        
        return all_content
