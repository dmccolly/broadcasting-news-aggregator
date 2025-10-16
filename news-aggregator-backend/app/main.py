from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging

from app.rss_aggregator import RSSAggregator
from app.radio_scraper import BoiseRadioScraper
from app.aggregator_service import AggregatorService
from app.cache_manager import cache_manager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

rss_aggregator = RSSAggregator()
radio_scraper = BoiseRadioScraper()


async def update_news_cache():
    if cache_manager.is_updating:
        logger.info("Update already in progress, skipping")
        return
    
    try:
        cache_manager.is_updating = True
        logger.info("Starting news aggregation update...")
        
        national_articles = await rss_aggregator.aggregate_all()
        logger.info(f"Fetched {len(national_articles)} national articles")
        
        local_articles = await radio_scraper.scrape_all_stations()
        logger.info(f"Scraped {len(local_articles)} local radio articles")
        
        merged_results = AggregatorService.merge_and_process(
            national_articles,
            local_articles,
            max_results=50
        )
        
        await cache_manager.set_cached_results(
            national_articles,
            local_articles,
            merged_results
        )
        
        logger.info(f"News cache updated successfully. Total articles: {merged_results['total_count']}")
        
    except Exception as e:
        logger.error(f"Error updating news cache: {e}")
    finally:
        cache_manager.is_updating = False


async def periodic_update_task():
    await asyncio.sleep(5)
    
    while True:
        try:
            if cache_manager.should_update():
                logger.info("Starting scheduled news update...")
                await update_news_cache()
            else:
                logger.info("Cache is still fresh, skipping update")
            
            await asyncio.sleep(3600)
            
        except Exception as e:
            logger.error(f"Error in periodic update task: {e}")
            await asyncio.sleep(600)


background_tasks_started = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up application...")
    
    periodic_task = asyncio.create_task(periodic_update_task())
    
    yield
    
    logger.info("Shutting down application...")
    periodic_task.cancel()


app = FastAPI(lifespan=lifespan)

# Disable CORS. Do not remove this for full-stack development.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.get("/api/news")
async def get_news():
    cached_results = await cache_manager.get_cached_results()
    
    if cached_results:
        return cached_results
    
    logger.info("No cache available, fetching fresh data...")
    await update_news_cache()
    
    cached_results = await cache_manager.get_cached_results()
    
    if cached_results:
        return cached_results
    else:
        return {
            'success': False,
            'error': 'Failed to fetch news data',
            'articles': []
        }


@app.get("/api/news/national")
async def get_national_news():
    try:
        articles = await rss_aggregator.aggregate_all()
        
        return {
            'success': True,
            'count': len(articles),
            'articles': articles
        }
    except Exception as e:
        logger.error(f"Error fetching national news: {e}")
        return {
            'success': False,
            'error': str(e),
            'articles': []
        }


@app.get("/api/news/local")
async def get_local_news():
    try:
        articles = await radio_scraper.scrape_all_stations()
        
        return {
            'success': True,
            'count': len(articles),
            'articles': articles
        }
    except Exception as e:
        logger.error(f"Error fetching local news: {e}")
        return {
            'success': False,
            'error': str(e),
            'articles': []
        }


@app.post("/api/news/refresh")
async def refresh_news(background_tasks: BackgroundTasks):
    if cache_manager.is_updating:
        return {
            'success': False,
            'message': 'Update already in progress'
        }
    
    background_tasks.add_task(update_news_cache)
    
    return {
        'success': True,
        'message': 'News refresh initiated'
    }


@app.get("/api/cache/status")
async def cache_status():
    return cache_manager.get_cache_info()
