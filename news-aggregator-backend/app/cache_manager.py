from datetime import datetime, timedelta
from typing import Dict, Optional
import asyncio
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CacheManager:
    def __init__(self):
        self.cache = {
            'national_articles': [],
            'local_articles': [],
            'merged_results': None,
            'last_updated': None
        }
        self.lock = asyncio.Lock()
        self.update_interval_hours = 6
        self.is_updating = False
    
    async def get_cached_results(self) -> Optional[Dict]:
        async with self.lock:
            if self.cache['merged_results'] and self.cache['last_updated']:
                time_since_update = datetime.now() - self.cache['last_updated']
                if time_since_update < timedelta(hours=self.update_interval_hours):
                    logger.info(f"Returning cached results (age: {time_since_update})")
                    return self.cache['merged_results']
        return None
    
    async def set_cached_results(
        self,
        national_articles: list,
        local_articles: list,
        merged_results: Dict
    ):
        async with self.lock:
            self.cache['national_articles'] = national_articles
            self.cache['local_articles'] = local_articles
            self.cache['merged_results'] = merged_results
            self.cache['last_updated'] = datetime.now()
            logger.info(f"Cache updated with {len(national_articles)} national and {len(local_articles)} local articles")
    
    def should_update(self) -> bool:
        if not self.cache['last_updated']:
            return True
        
        time_since_update = datetime.now() - self.cache['last_updated']
        return time_since_update >= timedelta(hours=self.update_interval_hours)
    
    def get_cache_info(self) -> Dict:
        return {
            'last_updated': self.cache['last_updated'].isoformat() if self.cache['last_updated'] else None,
            'national_count': len(self.cache['national_articles']),
            'local_count': len(self.cache['local_articles']),
            'is_updating': self.is_updating
        }

cache_manager = CacheManager()
