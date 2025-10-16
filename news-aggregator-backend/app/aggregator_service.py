from typing import List, Dict, Set
from datetime import datetime
import re
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AggregatorService:
    @staticmethod
    def remove_duplicates(articles: List[Dict]) -> List[Dict]:
        unique_articles = []
        seen_urls = set()
        seen_titles = set()
        
        for article in articles:
            url = article.get('url', '')
            title = article.get('title', '')
            
            if url and url in seen_urls:
                continue
            
            normalized_title = AggregatorService.normalize_title(title)
            
            is_duplicate = False
            for seen_title in seen_titles:
                if AggregatorService.titles_are_similar(normalized_title, seen_title):
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_articles.append(article)
                if url:
                    seen_urls.add(url)
                seen_titles.add(normalized_title)
        
        logger.info(f"Deduplication: {len(articles)} -> {len(unique_articles)} articles")
        return unique_articles
    
    @staticmethod
    def normalize_title(title: str) -> str:
        if not title:
            return ""
        
        normalized = title.lower()
        normalized = re.sub(r'[^\w\s]', '', normalized)
        normalized = re.sub(r'\s+', ' ', normalized)
        return normalized.strip()
    
    @staticmethod
    def titles_are_similar(title1: str, title2: str, threshold: float = 0.8) -> bool:
        if not title1 or not title2:
            return False
        
        words1 = set(title1.split())
        words2 = set(title2.split())
        
        if not words1 or not words2:
            return False
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        if not union:
            return False
        
        similarity = len(intersection) / len(union)
        return similarity >= threshold
    
    @staticmethod
    def sort_by_date(articles: List[Dict]) -> List[Dict]:
        return sorted(articles, key=lambda x: x.get('published', ''), reverse=True)
    
    @staticmethod
    def filter_by_recency(articles: List[Dict], hours: int = 48) -> List[Dict]:
        from datetime import timedelta
        from dateutil import parser as date_parser
        
        cutoff = datetime.now() - timedelta(hours=hours)
        filtered = []
        
        for article in articles:
            try:
                pub_date_str = article.get('published', '')
                if pub_date_str:
                    pub_date = date_parser.parse(pub_date_str)
                    if pub_date >= cutoff:
                        filtered.append(article)
            except:
                filtered.append(article)
        
        logger.info(f"Filtered {len(articles)} articles to {len(filtered)} within {hours} hours")
        return filtered
    
    @staticmethod
    def merge_and_process(
        national_articles: List[Dict],
        local_articles: List[Dict],
        max_results: int = 50
    ) -> Dict:
        all_articles = national_articles + local_articles
        
        all_articles = AggregatorService.sort_by_date(all_articles)
        
        unique_articles = AggregatorService.remove_duplicates(all_articles)
        
        limited_articles = unique_articles[:max_results]
        
        return {
            'success': True,
            'total_count': len(limited_articles),
            'national_count': len([a for a in limited_articles if a.get('source') in [
                'NewscastStudio', 'TV Newscheck', 'Radio Ink', 'Radio World',
                'Inside Radio', 'TV Technology', 'Broadcasting & Cable', 'RBR-TVBR',
                'Inside Audio Marketing'
            ]]),
            'local_count': len([a for a in limited_articles if a.get('source') not in [
                'NewscastStudio', 'TV Newscheck', 'Radio Ink', 'Radio World',
                'Inside Radio', 'TV Technology', 'Broadcasting & Cable', 'RBR-TVBR',
                'Inside Audio Marketing'
            ]]),
            'articles': limited_articles,
            'last_updated': datetime.now().isoformat()
        }
