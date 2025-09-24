// Broadcasting News Aggregator Service
// Fetches live news from broadcasting industry sources and local Idaho radio stations

class BroadcastingNewsAggregator {
  constructor() {
    this.sources = {
      // National Broadcasting Trade Publications
      newscaststudio: {
        name: 'NewscastStudio',
        rss_url: 'https://www.newscaststudio.com/feed/',
        type: 'trade_publication',
        priority: 1
      },
      tvnewscheck: {
        name: 'TV Newscheck',
        rss_url: 'https://tvnewscheck.com/feed/',
        type: 'trade_publication',
        priority: 1
      },
      radioink: {
        name: 'Radio Ink',
        rss_url: 'https://radioink.com/feed/',
        type: 'trade_publication',
        priority: 1
      },
      radioworld: {
        name: 'Radio World',
        rss_url: 'https://www.radioworld.com/rss',
        type: 'trade_publication',
        priority: 1
      },
      insideradio: {
        name: 'Inside Radio',
        rss_url: 'https://www.insideradio.com/rss.xml',
        type: 'trade_publication',
        priority: 1
      },
      tvtechnology: {
        name: 'TV Technology',
        rss_url: 'https://www.tvtechnology.com/rss',
        type: 'trade_publication',
        priority: 1
      },
      broadcastingcable: {
        name: 'Broadcasting & Cable',
        rss_url: 'https://www.broadcastingcable.com/rss',
        type: 'trade_publication',
        priority: 1
      },
      
      // Local Idaho Broadcasting
      kboi: {
        name: 'KBOI 93.1FM & 670AM',
        rss_url: 'https://kboi.com/feed/',
        type: 'local_radio',
        priority: 2
      },
      kido: {
        name: 'KIDO Talk Radio',
        rss_url: 'https://kidotalkradio.com/feed/',
        type: 'local_radio',
        priority: 2
      },
      
      // Idaho Business (may include broadcasting)
      idahobusiness: {
        name: 'Idaho Business Review',
        rss_url: 'https://idahobusinessreview.com/feed/',
        type: 'business',
        priority: 3
      },
      boisedev: {
        name: 'BoiseDev',
        rss_url: 'https://boisedev.com/feed/',
        type: 'business',
        priority: 3
      }
    };
    
    this.broadcastingKeywords = [
      'broadcast', 'broadcasting', 'radio', 'television', 'tv', 'fcc',
      'streaming', 'media', 'newscast', 'anchor', 'reporter', 'station',
      'network', 'cable', 'satellite', 'digital', 'spectrum', 'license',
      'transmitter', 'antenna', 'studio', 'newsroom', 'meteorologist',
      'sports director', 'news director', 'general manager', 'programming',
      'ratings', 'audience', 'advertising', 'syndication', 'affiliate',
      'ownership', 'merger', 'acquisition', 'consolidation', 'regulatory'
    ];
  }

  // Use RSS2JSON service to bypass CORS issues
  async fetchRSSFeed(url, sourceName) {
    try {
      console.log(`Fetching RSS feed from ${sourceName}: ${url}`);
      
      // Use RSS2JSON service to convert RSS to JSON and bypass CORS
      const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}&api_key=YOUR_API_KEY&count=10`;
      
      const response = await fetch(rss2jsonUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== 'ok') {
        throw new Error(`RSS2JSON error: ${data.message}`);
      }
      
      const articles = data.items.map(item => ({
        title: this.cleanText(item.title || 'No title'),
        description: this.extractDescription(item),
        link: item.link || '',
        published: item.pubDate || new Date().toISOString(),
        source: sourceName,
        image_url: this.extractImage(item),
        link_available: Boolean(item.link),
        link_note: item.link ? null : `Link to ${sourceName} website - direct content link unavailable`
      }));
      
      console.log(`Successfully fetched ${articles.length} articles from ${sourceName}`);
      return articles.filter(article => article.title && article.title.length > 10);
      
    } catch (error) {
      console.error(`Error fetching RSS from ${sourceName}:`, error);
      return [];
    }
  }

  extractDescription(item) {
    let description = item.description || item.content || item.summary || '';
    
    // Clean HTML tags
    description = this.cleanHTML(description);
    description = this.cleanText(description);
    
    // Limit to approximately 100 words
    const words = description.split(' ');
    if (words.length > 100) {
      description = words.slice(0, 100).join(' ') + '...';
    }
    
    return description || "No description available.";
  }

  extractImage(item) {
    // Try different image fields
    if (item.enclosure && item.enclosure.type && item.enclosure.type.startsWith('image/')) {
      return item.enclosure.link;
    }
    
    if (item.thumbnail) {
      return item.thumbnail;
    }
    
    // Check for image in description/content
    const content = item.description || item.content || '';
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) {
      return imgMatch[1];
    }
    
    return null;
  }

  cleanHTML(text) {
    if (!text) return "";
    
    // Remove HTML tags
    const clean = text.replace(/<[^>]+>/g, '');
    
    // Decode HTML entities
    const textarea = document.createElement('textarea');
    textarea.innerHTML = clean;
    return textarea.value;
  }

  cleanText(text) {
    if (!text) return "";
    
    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ');
    
    // Remove special characters that might cause issues
    text = text.replace(/[\u201c\u201d]/g, '"');
    text = text.replace(/[\u2018\u2019]/g, "'");
    text = text.replace(/[\u2013\u2014]/g, '-');
    
    return text.trim();
  }

  isBroadcastingRelated(article) {
    const textToCheck = `${article.title} ${article.description}`.toLowerCase();
    
    // Always include articles from trade publications
    const tradePublications = ['NewscastStudio', 'TV Newscheck', 'Radio Ink', 'Radio World', 
                              'Inside Radio', 'TV Technology', 'Broadcasting & Cable'];
    
    if (tradePublications.includes(article.source)) {
      return true;
    }
    
    // For other sources, check for broadcasting keywords
    return this.broadcastingKeywords.some(keyword => 
      textToCheck.includes(keyword.toLowerCase())
    );
  }

  async aggregateNews() {
    console.log('Starting news aggregation...');
    const allArticles = [];
    
    for (const [sourceId, sourceConfig] of Object.entries(this.sources)) {
      try {
        const articles = await this.fetchRSSFeed(
          sourceConfig.rss_url, 
          sourceConfig.name
        );
        
        // Filter for broadcasting-related content
        const filteredArticles = articles.filter(article => 
          this.isBroadcastingRelated(article)
        );
        
        allArticles.push(...filteredArticles);
        
        // Add small delay between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Error processing source ${sourceId}:`, error);
        continue;
      }
    }
    
    // Sort by publication date (newest first)
    allArticles.sort((a, b) => new Date(b.published) - new Date(a.published));
    
    // Remove duplicates based on title similarity
    const uniqueArticles = this.removeDuplicates(allArticles);
    
    console.log(`Aggregated ${uniqueArticles.length} unique broadcasting articles`);
    return uniqueArticles.slice(0, 15); // Return top 15 articles
  }

  removeDuplicates(articles) {
    const uniqueArticles = [];
    const seenTitles = new Set();
    
    for (const article of articles) {
      // Create a normalized title for comparison
      const normalizedTitle = article.title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Check if we've seen a similar title
      let isDuplicate = false;
      for (const seenTitle of seenTitles) {
        const titleWords = new Set(normalizedTitle.split(' '));
        const seenWords = new Set(seenTitle.split(' '));
        
        if (titleWords.size > 0 && seenWords.size > 0) {
          const overlap = [...titleWords].filter(word => seenWords.has(word)).length;
          const similarity = overlap / Math.max(titleWords.size, seenWords.size);
          
          if (similarity > 0.8) {
            isDuplicate = true;
            break;
          }
        }
      }
      
      if (!isDuplicate) {
        uniqueArticles.push(article);
        seenTitles.add(normalizedTitle);
      }
    }
    
    return uniqueArticles;
  }

  // Mock data for development/fallback
  getMockData() {
    return [
      {
        title: "Fox, Disney bundle up together to offer streaming sports powerhouse",
        description: "Fox Corporation and The Walt Disney Company have announced a new streaming bundle that combines Fox's sports programming with Disney's ESPN+ service. The partnership aims to create a comprehensive sports streaming platform that will compete directly with traditional cable sports packages. The bundle will include live games, original programming, and exclusive content from both networks, targeting cord-cutters who want premium sports content without traditional cable subscriptions.",
        link: "https://www.newscaststudio.com/2025/08/15/fox-disney-bundle-streaming-sports/",
        published: "2025-08-15T19:30:00Z",
        source: "NewscastStudio",
        image_url: "https://www.newscaststudio.com/wp-content/uploads/2025/08/fox-disney-streaming-bundle.jpg",
        link_available: true,
        link_note: null
      },
      {
        title: "Sinclair sells NewsOn to Zeam",
        description: "Sinclair Broadcast Group has completed the sale of its NewsOn streaming platform to Zeam Media, a digital content distribution company. NewsOn, which aggregates local news content from stations across the country, will continue operating under Zeam's ownership with plans for expansion and enhanced features. The acquisition represents Zeam's strategy to build a comprehensive local news streaming ecosystem while providing Sinclair with capital to focus on its core broadcasting operations.",
        link: "https://www.newscaststudio.com/2025/08/15/sinclair-sells-newson-to-zeam/",
        published: "2025-08-15T18:45:00Z",
        source: "NewscastStudio",
        image_url: "https://www.newscaststudio.com/wp-content/uploads/2025/08/sinclair-newson-zeam.jpg",
        link_available: true,
        link_note: null
      },
      {
        title: "Radio advertising revenue shows unexpected growth in Q2",
        description: "Radio advertising revenue experienced a surprising uptick in the second quarter of 2025, with national spot advertising leading the growth. Industry analysts attribute the increase to improved economic conditions and advertisers returning to traditional media for brand building campaigns. Local radio advertising also showed modest gains, particularly in automotive and retail sectors. The positive trend suggests radio's resilience in the evolving media landscape and its continued value proposition for advertisers seeking targeted local reach.",
        link: "https://radioink.com/2025/08/15/radio-advertising-revenue-shows-growth/",
        published: "2025-08-15T17:20:00Z",
        source: "Radio Ink",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "ATSC 3.0 deployment accelerates across major markets",
        description: "Television stations in major markets are rapidly deploying ATSC 3.0 technology, with over 200 stations now broadcasting the next-generation standard. The enhanced capabilities include 4K video, improved audio quality, and interactive features that enable new revenue opportunities. Broadcasters are particularly excited about the mobile viewing capabilities and targeted advertising potential. Equipment manufacturers report strong demand for ATSC 3.0 transmitters and encoding equipment as stations prepare for the transition.",
        link: "https://www.tvtechnology.com/2025/08/15/atsc-3-0-deployment-accelerates/",
        published: "2025-08-15T16:15:00Z",
        source: "TV Technology",
        image_url: "https://www.tvtechnology.com/wp-content/uploads/2025/08/atsc-3-0-tower.jpg",
        link_available: true,
        link_note: null
      },
      {
        title: "Idaho radio stations prepare for FCC license renewal cycle",
        description: "Radio stations across Idaho are beginning preparations for the upcoming FCC license renewal cycle, with applications due in early 2026. Station managers are reviewing public file requirements, community service obligations, and technical compliance issues. The renewal process includes demonstrating service to local communities and maintaining proper documentation of programming and advertising practices. Several Idaho stations are also considering facility upgrades and coverage area modifications as part of the renewal process.",
        link: "https://kboi.com/2025/08/15/idaho-radio-station-license-renewal/",
        published: "2025-08-15T15:30:00Z",
        source: "KBOI 93.1FM & 670AM",
        image_url: null,
        link_available: true,
        link_note: null
      }
    ];
  }
}

export default BroadcastingNewsAggregator;

