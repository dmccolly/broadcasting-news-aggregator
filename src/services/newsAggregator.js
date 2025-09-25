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
      rbrtvbr: {
        name: 'RBR-TVBR',
        rss_url: 'https://rbr.com/feed/',
        type: 'trade_publication',
        priority: 1
      },
      insideaudiomarketing: {
        name: 'Inside Audio Marketing',
        rss_url: 'https://www.insideaudiomarketing.com/feed',
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
                              'Inside Radio', 'TV Technology', 'Broadcasting & Cable', 'RBR-TVBR', 'TV News Check', 'Inside Audio Marketing'];
    
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
    
    try {
      // Fetch from backend API
      const response = await fetch('/api/news');
      const data = await response.json();
      
      if (data.success && data.articles) {
        console.log(`Fetched ${data.articles.length} articles from backend`);
        return data.articles;
      } else {
        console.error('Backend API error:', data.error);
        return [];
      }
    } catch (error) {
      console.error('Error fetching from backend:', error);
      return [];
    }
    
    /* RSS fetching code - requires backend proxy for CORS
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
    */
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

  // Current data with latest articles from multiple sources - September 25, 2025
  getMockData() {
    return [
      {
        title: "Supreme Court Ruling Raises Stakes for FCC's Lone Democrat",
        description: "Having already expressed concerns about her job security at the FCC, Commissioner Anna Gomez will likely find little comfort in the Supreme Court's latest ruling allowing President Donald Trump to fire FTC Commissioner Rebecca Kelly Slaughter without cause. The ruling sets a precedent that could affect all federal commissioners and highlights the political pressures facing regulatory agencies in the current administration.",
        link: "https://radioink.com/2025/09/24/supreme-court-ruling-raises-stakes-for-fccs-lone-democrat/",
        published: "2025-09-24T19:30:00Z",
        source: "Radio Ink",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "Kimmel Slaps Carr In Late Night Return; NRB Urges FCC Fairness",
        description: "Jimmy Kimmel's late-night return put FCC Chairman Brendan Carr at the center of a barbed attack, framing free-speech rights as the centerpiece of his comeback. As Kimmel mocked Carr's threats, the National Religious Broadcasters issued their own call for FCC fairness across political lines. The controversy highlights ongoing tensions between broadcasters and federal regulators over content oversight.",
        link: "https://radioink.com/2025/09/24/kimmel-slaps-carr-in-late-night-return-nrb-urges-fcc-fairness/",
        published: "2025-09-24T18:45:00Z",
        source: "Radio Ink",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "SBS' Raúl Alarcón: Expense Cuts Aren't Hurting Ratings And Digital Growth",
        description: "Spanish Broadcasting System cut operating costs 10% in Q2 and 11% year-to-date, with CEO Raúl Alarcón projecting more coming with no impact seen on ratings or digital listening. Meanwhile, Q2 revenue fell 14% and losses widened, while the bigger hurdle of a $310 million debt repayment set for March still looms. The company's strategy focuses on maintaining audience while reducing operational expenses.",
        link: "https://www.insideradio.com/free/sbs-raul-alarcon-expense-cuts-arent-hurting-ratings-and-digital-growth/",
        published: "2025-09-25T17:20:00Z",
        source: "Inside Radio",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "Religious Broadcasters Urge FCC To Uphold Free Speech",
        description: "The National Religious Broadcasters is lending its voice to those saying the FCC should continue to use a light touch when it comes to policing what is on the airwaves. In the wake of the Jimmy Kimmel controversy that has put free speech into the headlines, NRB says the FCC needs to uphold its standards consistently and fairly across political lines, emphasizing the importance of diverse voices in broadcasting.",
        link: "https://tvnewscheck.com/articles/religious-broadcasters-urge-fcc-to-uphold-free-speech/",
        published: "2025-09-24T16:15:00Z",
        source: "TV News Check",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "NJ PBS To Shutter In 2026 After Funding Cuts, End Of Operating Agreement",
        description: "NJ PBS will cease operations in 2026 after WNET and the New Jersey Public Broadcasting Authority failed to reach a new agreement to continue operating the station. The station's Debra Falk said recent cuts by federal and state governments have been very significant, highlighting the broader crisis facing public broadcasting. The closure represents a significant loss for New Jersey's public media landscape.",
        link: "https://www.insideradio.com/free/nj-pbs-to-shutter-in-2026-after-funding-cuts-end-of-operating-agreement/",
        published: "2025-09-25T15:30:00Z",
        source: "Inside Radio",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "BIA Forecasts $12.3B In Local Radio Revenue For 2025",
        description: "Total local advertising spending is projected to reach $168.2 billion in 2025 (ex. political), with local radio as the fifth-largest medium capturing $12.3 billion. The forecast shows radio maintaining its position as a key local advertising platform despite digital competition. BIA Advisory Services notes that radio's local focus and community connection continue to drive advertiser investment in the medium.",
        link: "https://www.insideaudiomarketing.com/post/bia-forecasts-12-3b-in-local-radio-revenue-for-2025",
        published: "2025-09-25T14:00:00Z",
        source: "Inside Audio Marketing",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "Q&A: Dave Sturgeon On 'The Truth About Radio'",
        description: "40-year radio industry veteran and ad agency founder Dave Sturgeon aims to set the record straight on radio's reach, relevance, and ROI. In this comprehensive interview, Sturgeon addresses common misconceptions about radio advertising effectiveness and shares insights from decades of experience in both radio and advertising agency work. His perspective offers valuable insights for marketers considering audio advertising strategies.",
        link: "https://www.insideaudiomarketing.com/post/qa-dave-sturgeon-on-the-truth-about-radio",
        published: "2025-09-25T13:45:00Z",
        source: "Inside Audio Marketing",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "Future of Broadcasting Comes into Focus at NAB Show New York",
        description: "Broadcasters are moving fast to meet shifting audience habits, multiplatform distribution and AI-driven production. NAB Show New York returns Oct. 22–23 at the Javits Center with a focused, two-day program designed to help station executives and content teams pressure-test strategies and get hands-on with tools on the show floor. The event will showcase emerging technologies and industry best practices.",
        link: "https://rbr.com/future-of-broadcasting-comes-into-focus-at-nab-show-new-york/",
        published: "2025-09-25T14:45:00Z",
        source: "RBR-TVBR",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "AM Radio's Death Has Been Grossly Exaggerated",
        description: "The gloomiest headlines about the medium are not justified, according to industry analysis. Despite challenges facing AM radio, including automotive integration issues and technical limitations, the format continues to serve vital roles in news, talk, and emergency broadcasting, particularly in rural and underserved communities. Recent legislative efforts aim to preserve AM radio's presence in vehicles.",
        link: "https://www.radioworld.com/columns-and-views/guest-commentaries/am-radios-death-has-been-grossly-exaggerated",
        published: "2025-09-24T13:20:00Z",
        source: "Radio World",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "NYPR Offers Free Programming to Needy Peers",
        description: "New York Public Radio is offering free programming to struggling public radio stations, citing unprecedented threats facing public broadcasting. The initiative aims to help smaller stations maintain quality content during funding challenges and represents a collaborative approach to preserving public media infrastructure. The program includes news, cultural programming, and technical support for participating stations.",
        link: "https://www.radioworld.com/news-and-business/programming-and-sales/nypr-offers-free-programming-to-needy-peers",
        published: "2025-09-24T12:15:00Z",
        source: "Radio World",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "Disney Shareholders Request Jimmy Kimmel Suspension Records",
        description: "Citing concerns executives breached their fiduciary duties, the move comes after Kimmel returned to ABC with big ratings following his six-day suspension. Disney shareholders are demanding transparency about the decision-making process behind the suspension and subsequent reinstatement of the late-night host. The controversy has raised questions about corporate governance in media companies.",
        link: "https://tvnewscheck.com/articles/disney-shareholders-request-jimmy-kimmel-suspension-records/",
        published: "2025-09-24T11:30:00Z",
        source: "TV News Check",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "Audacy: Now A Media MOGL",
        description: "Audacy and MOGL announced a strategic partnership to expand sports marketing opportunities through Name, Image and Likeness (NIL) sponsorships. The collaboration enables brands to integrate athlete talent into Audacy's sports audio platforms, representing a new revenue stream for the audio company as it continues post-bankruptcy operations. The partnership reflects the growing importance of NIL marketing in sports media.",
        link: "https://rbr.com/audacy-now-a-media-mogl/",
        published: "2025-09-25T10:45:00Z",
        source: "RBR-TVBR",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "Broadcast and professional AV sectors converge around shared infrastructure needs",
        description: "The traditional boundaries between broadcast television and professional audiovisual industries are dissolving as both sectors migrate toward IP-based infrastructures and software-defined solutions. Industry executives report that fundamental requirements for video content delivery have become nearly identical across broadcast operations, corporate communications, live events and specialized venue applications. This convergence is driving new technology partnerships and market opportunities.",
        link: "https://www.newscaststudio.com/2025/09/23/broadcast-and-professional-av-sectors-converge-around-shared-infrastructure-needs/",
        published: "2025-09-23T19:30:00Z",
        source: "NewscastStudio",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "Price: FCC Must Mandate A 2028 NextGen TV Transition",
        description: "Without a hard transition date, the local TV industry runs the risk of being leapfrogged by ever-expanding technological advances on other platforms. Industry experts argue that a mandated transition to NextGen TV by 2028 is essential for broadcasters to remain competitive in the evolving media landscape. The technology offers enhanced viewing experiences and new revenue opportunities through targeted advertising.",
        link: "https://tvnewscheck.com/articles/price-fcc-must-mandate-a-2028-nextgen-tv-transition/",
        published: "2025-09-23T18:15:00Z",
        source: "TV News Check",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "FEMA Promises Support for New MEP Code",
        description: "The Missing and Endangered Persons event code is now live, with FEMA promising support for implementation. This new emergency alert system enhancement will help broadcasters better serve their communities during critical missing person situations, expanding the Emergency Alert System's capabilities. The code represents a significant advancement in public safety communications through broadcasting.",
        link: "https://www.radioworld.com/news-and-business/business-and-law/fema-promises-support-for-new-mep-code",
        published: "2025-09-24T09:30:00Z",
        source: "Radio World",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "Gotts Gets Record Cash For NJ Kids After Four Days On Billboard",
        description: "After four days living atop a Toms River billboard, 95.9 The Rat's Gotts raised a record sum in support of children battling pediatric cancer in Ocean County. It was all a part of Beasley Media Group New Jersey's fifth annual Billboard Radiothon with Ocean of Love charity. The event demonstrates radio's continued power to mobilize communities for charitable causes.",
        link: "https://radioink.com/2025/09/24/gotts-gets-record-cash-for-nj-kids-after-four-days-on-billboard/",
        published: "2025-09-24T08:45:00Z",
        source: "Radio Ink",
        image_url: null,
        link_available: true,
        link_note: null
      },
      {
        title: "Colorado Public Radio Adds Voice to Mountain West News Bureau",
        description: "Colorado Public Radio is the latest associate partner of the Mountain West News Bureau, joining numerous partner station groups across seven Western states united in coverage of issues like water, energy, public lands, rural economies, and Indigenous affairs. The collaboration strengthens regional journalism coverage and demonstrates the value of public media partnerships in serving underserved communities.",
        link: "https://radioink.com/2025/09/24/colorado-public-radio-adds-voice-to-mountain-west-news-bureau/",
        published: "2025-09-24T07:20:00Z",
        source: "Radio Ink",
        image_url: null,
        link_available: true,
        link_note: null
      }
    ];
  }
}

export default BroadcastingNewsAggregator;

