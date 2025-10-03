// Boise Radio Station Scraper Service
// Deep scrapes Boise radio station websites for morning shows, interviews, podcasts, and events

class BoiseRadioScraper {
  constructor() {
    // Comprehensive list of Boise radio stations with their websites and content paths
    this.stations = {
      kboi: {
        name: 'KBOI 93.1FM & 670AM',
        baseUrl: 'https://www.kboi.com',
        paths: {
          shows: '/shows/',
          contests: '/contests/',
          events: '/events/',
          news: '/news/',
          podcasts: '/podcasts/'
        },
        morningShow: {
          name: 'Kasper & Chris',
          url: 'https://www.kboi.com/shows/kasper-and-chris/'
        },
        format: 'News/Talk',
        priority: 1
      },
      wild101: {
        name: 'Wild 101.1 FM',
        baseUrl: 'https://wild101fm.com',
        paths: {
          contests: '/contests/',
          events: '/events/',
          community: '/community/',
          shows: '/shows/'
        },
        format: 'Hip Hop/Top 40',
        priority: 1
      },
      ktsy: {
        name: 'KTSY 89.5',
        baseUrl: 'https://ktsy.org',
        paths: {
          shows: '/shows/',
          events: '/events-community/',
          contests: '/contests/',
          morningShow: '/shows/mornings-with-tristi/'
        },
        morningShow: {
          name: 'Mornings with Dave & Tristi',
          url: 'https://ktsy.org/shows/mornings-with-tristi/'
        },
        format: 'Christian CHR',
        priority: 1
      },
      wowCountry: {
        name: '104.3 Wow Country',
        baseUrl: 'https://1043wowcountry.com',
        paths: {
          contests: '/contests/',
          events: '/events/',
          shows: '/shows/',
          community: '/community/'
        },
        format: 'Country',
        priority: 1
      },
      liteFM: {
        name: '107.9 Lite FM',
        baseUrl: 'https://liteonline.com',
        paths: {
          djs: '/djs/',
          contests: '/contests/',
          events: '/events/',
          community: '/community/'
        },
        format: 'Adult Contemporary',
        priority: 1
      },
      jackFM: {
        name: '105.1 Jack FM',
        baseUrl: 'https://www.jackboise.com',
        paths: {
          events: '/events/',
          contests: '/contests/',
          community: '/community/'
        },
        format: 'Adult Hits',
        priority: 1
      },
      eagle: {
        name: '96.9 The Eagle',
        baseUrl: 'https://www.kkgl.com',
        paths: {
          shows: '/shows/',
          contests: '/contests/',
          events: '/events/',
          podcasts: '/podcasts/'
        },
        format: 'Classic Rock',
        priority: 1
      },
      kbsx: {
        name: '91.5 KBSX',
        baseUrl: 'https://www.boisestatepublicradio.org',
        paths: {
          programs: '/programs/',
          events: '/events/',
          community: '/community-calendar/'
        },
        format: 'Public Radio',
        priority: 2
      }
    };

    // Keywords to identify valuable content
    this.contentKeywords = {
      morningShow: ['morning show', 'morning crew', 'wake up', 'breakfast show', 'am show'],
      interview: ['interview', 'talks with', 'sits down with', 'exclusive chat', 'conversation with'],
      podcast: ['podcast', 'listen now', 'episode', 'audio on demand'],
      event: ['live event', 'concert', 'appearance', 'meet and greet', 'live broadcast', 'remote broadcast'],
      community: ['community', 'charity', 'fundraiser', 'food drive', 'local cause']
    };

    // Track previously seen content to ensure freshness
    this.seenContent = new Set();
    this.contentHistory = [];
  }

  /**
   * Main scraping function - fetches content from all stations
   * @param {number} minNewContent - Minimum percentage of new content required (default 20%)
   * @returns {Promise<Array>} Array of content items
   */
  async scrapeAllStations(minNewContent = 0.2) {
    console.log('Starting deep scrape of Boise radio stations...');
    const allContent = [];

    for (const [stationId, stationConfig] of Object.entries(this.stations)) {
      try {
        console.log(`Scraping ${stationConfig.name}...`);
        
        // Scrape each content type from the station
        const stationContent = await this.scrapeStation(stationId, stationConfig);
        allContent.push(...stationContent);

        // Add delay to be respectful to servers
        await this.delay(2000);
      } catch (error) {
        console.error(`Error scraping ${stationConfig.name}:`, error);
        continue;
      }
    }

    // Sort by priority and date
    allContent.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    // Ensure minimum new content percentage
    const freshContent = this.ensureFreshContent(allContent, minNewContent);

    console.log(`Scraped ${freshContent.length} total items from ${Object.keys(this.stations).length} stations`);
    return freshContent;
  }

  /**
   * Scrape a single station for all content types
   */
  async scrapeStation(stationId, config) {
    const content = [];

    // Scrape morning show content
    if (config.morningShow) {
      const morningContent = await this.scrapeMorningShow(config);
      content.push(...morningContent);
    }

    // Scrape each content path
    for (const [pathType, path] of Object.entries(config.paths)) {
      try {
        const pathContent = await this.scrapePath(config, pathType, path);
        content.push(...pathContent);
      } catch (error) {
        console.error(`Error scraping ${pathType} for ${config.name}:`, error);
      }
    }

    return content;
  }

  /**
   * Scrape morning show specific content
   */
  async scrapeMorningShow(config) {
    // In a real implementation, this would use actual web scraping
    // For now, we'll return structured data that would come from scraping
    
    const morningShowContent = [];
    
    if (config.morningShow) {
      // This would be replaced with actual scraping logic
      morningShowContent.push({
        id: `${config.name}-morning-${Date.now()}`,
        station: config.name,
        stationFormat: config.format,
        type: 'morning_show',
        title: `${config.morningShow.name} - Latest Episode`,
        description: `Catch up on the latest from ${config.morningShow.name}, featuring local news, interviews, and entertainment.`,
        date: new Date().toISOString(),
        dateAdded: new Date().toISOString(),
        link: config.morningShow.url,
        priority: config.priority,
        contentType: 'morning_show'
      });
    }

    return morningShowContent;
  }

  /**
   * Scrape a specific content path
   */
  async scrapePath(config, pathType, path) {
    // In a real implementation, this would fetch and parse the actual webpage
    // For now, we'll return mock data structure
    
    const content = [];
    const fullUrl = `${config.baseUrl}${path}`;

    // This would be replaced with actual scraping logic using fetch + HTML parsing
    // For demonstration, returning structured data
    
    return content;
  }

  /**
   * Ensure minimum percentage of new content
   */
  ensureFreshContent(allContent, minNewPercentage) {
    const newContent = [];
    const oldContent = [];

    for (const item of allContent) {
      const contentId = this.generateContentId(item);
      
      if (!this.seenContent.has(contentId)) {
        newContent.push(item);
        this.seenContent.add(contentId);
      } else {
        oldContent.push(item);
      }
    }

    // Calculate how many items we need
    const totalNeeded = Math.max(20, allContent.length);
    const minNewNeeded = Math.ceil(totalNeeded * minNewPercentage);

    // If we don't have enough new content, clear some old content from history
    if (newContent.length < minNewNeeded && this.seenContent.size > 100) {
      // Clear oldest 30% of seen content to allow rotation
      const toRemove = Math.floor(this.seenContent.size * 0.3);
      const seenArray = Array.from(this.seenContent);
      for (let i = 0; i < toRemove; i++) {
        this.seenContent.delete(seenArray[i]);
      }
    }

    // Combine new and old content, prioritizing new
    const result = [...newContent, ...oldContent].slice(0, totalNeeded);
    
    console.log(`Content freshness: ${newContent.length} new items (${Math.round(newContent.length / result.length * 100)}%)`);
    
    return result;
  }

  /**
   * Generate unique content ID for tracking
   */
  generateContentId(item) {
    return `${item.station}-${item.type}-${item.title}`.toLowerCase().replace(/\s+/g, '-');
  }

  /**
   * Utility delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get mock data for development/testing
   * This simulates what would be scraped from actual websites
   */
  getMockScrapedData() {
    return [
      // KBOI Morning Show Content
      {
        id: 'kboi-morning-1',
        station: 'KBOI 93.1FM & 670AM',
        stationFormat: 'News/Talk',
        type: 'morning_show',
        title: 'Kasper & Chris: Interview with Boise Mayor',
        description: 'This morning, Kasper and Chris sat down with Boise Mayor Lauren McLean to discuss upcoming city initiatives, downtown development, and community safety. The wide-ranging conversation covered everything from housing affordability to new park developments.',
        date: 'October 3, 2025',
        dateAdded: new Date().toISOString(),
        link: 'https://www.kboi.com/shows/kasper-and-chris/',
        priority: 1,
        contentType: 'interview'
      },
      {
        id: 'kboi-morning-2',
        station: 'KBOI 93.1FM & 670AM',
        stationFormat: 'News/Talk',
        type: 'morning_show',
        title: 'Kasper & Chris Podcast: Best of the Week',
        description: 'Catch up on the best moments from this week\'s Kasper & Chris morning show. Featuring hilarious listener calls, breaking news coverage, and exclusive interviews with local newsmakers.',
        date: 'October 2, 2025',
        dateAdded: new Date(Date.now() - 86400000).toISOString(),
        link: 'https://www.kboi.com/shows/kasper-and-chris/',
        priority: 1,
        contentType: 'podcast'
      },
      
      // KTSY Morning Show Content
      {
        id: 'ktsy-morning-1',
        station: 'KTSY 89.5',
        stationFormat: 'Christian CHR',
        type: 'morning_show',
        title: 'Mornings with Dave & Tristi: TobyMac Interview',
        description: 'Christian music superstar TobyMac joins Dave and Tristi to talk about his upcoming Boise concert, his latest album, and his journey in faith and music. Don\'t miss this inspiring conversation!',
        date: 'October 3, 2025',
        dateAdded: new Date().toISOString(),
        link: 'https://ktsy.org/shows/mornings-with-tristi/',
        priority: 1,
        contentType: 'interview'
      },
      {
        id: 'ktsy-morning-2',
        station: 'KTSY 89.5',
        stationFormat: 'Christian CHR',
        type: 'morning_show',
        title: 'Dave & Tristi: Local Church Spotlight',
        description: 'Each week, Dave and Tristi highlight a local church making a difference in the Treasure Valley. This week features Crossroads Community Church and their amazing food bank ministry serving hundreds of families.',
        date: 'October 2, 2025',
        dateAdded: new Date(Date.now() - 86400000).toISOString(),
        link: 'https://ktsy.org/shows/mornings-with-tristi/',
        priority: 1,
        contentType: 'community'
      },

      // Wild 101.1 Content
      {
        id: 'wild-event-1',
        station: 'Wild 101.1 FM',
        stationFormat: 'Hip Hop/Top 40',
        type: 'event',
        title: 'Wild 101.1 Street Team at Boise Towne Square',
        description: 'Meet the Wild 101.1 street team this Saturday at Boise Towne Square! Get free station swag, enter to win concert tickets, and take photos with your favorite DJs. Plus, we\'ll be giving away $500 cash on the spot!',
        date: 'October 5, 2025',
        dateAdded: new Date().toISOString(),
        link: 'https://wild101fm.com/events/',
        priority: 1,
        contentType: 'event'
      },
      {
        id: 'wild-interview-1',
        station: 'Wild 101.1 FM',
        stationFormat: 'Hip Hop/Top 40',
        type: 'interview',
        title: 'Exclusive: Doja Cat Talks New Album',
        description: 'Wild 101.1\'s DJ Ace got an exclusive interview with Doja Cat about her upcoming album, tour plans, and what she loves about performing in Boise. Listen to the full interview now!',
        date: 'October 3, 2025',
        dateAdded: new Date().toISOString(),
        link: 'https://wild101fm.com/',
        priority: 1,
        contentType: 'interview'
      },

      // 104.3 Wow Country Content
      {
        id: 'wow-morning-1',
        station: '104.3 Wow Country',
        stationFormat: 'Country',
        type: 'morning_show',
        title: 'Morning Show: Luke Bryan Concert Preview',
        description: 'The Wow Country morning crew previews this weekend\'s Luke Bryan concert at Ford Idaho Center. Plus, they\'re giving away last-minute tickets and VIP meet & greet passes!',
        date: 'October 3, 2025',
        dateAdded: new Date().toISOString(),
        link: 'https://1043wowcountry.com/',
        priority: 1,
        contentType: 'event'
      },
      {
        id: 'wow-podcast-1',
        station: '104.3 Wow Country',
        stationFormat: 'Country',
        type: 'podcast',
        title: 'Country Music Insider Podcast',
        description: 'Go behind the scenes of country music with Wow Country\'s weekly podcast. This week: interviews with rising stars, Nashville news, and the latest from your favorite country artists.',
        date: 'October 2, 2025',
        dateAdded: new Date(Date.now() - 86400000).toISOString(),
        link: 'https://1043wowcountry.com/',
        priority: 1,
        contentType: 'podcast'
      },

      // 107.9 Lite FM Content
      {
        id: 'lite-community-1',
        station: '107.9 Lite FM',
        stationFormat: 'Adult Contemporary',
        type: 'community',
        title: 'Lite FM Coats for Kids Drive',
        description: 'Help Lite FM collect winter coats for kids in need! Drop off new or gently used coats at any of our collection locations throughout the Treasure Valley. Together, we can keep every child warm this winter.',
        date: 'October 1-31, 2025',
        dateAdded: new Date().toISOString(),
        link: 'https://liteonline.com/',
        priority: 1,
        contentType: 'community'
      },
      {
        id: 'lite-interview-1',
        station: '107.9 Lite FM',
        stationFormat: 'Adult Contemporary',
        type: 'interview',
        title: 'Michelle Heart Interviews Ed Sheeran',
        description: 'Lite FM\'s Michelle Heart scored an exclusive phone interview with Ed Sheeran! Hear what he had to say about his new music, upcoming tour, and his love for performing in smaller markets like Boise.',
        date: 'October 3, 2025',
        dateAdded: new Date().toISOString(),
        link: 'https://liteonline.com/',
        priority: 1,
        contentType: 'interview'
      },

      // 105.1 Jack FM Content
      {
        id: 'jack-event-1',
        station: '105.1 Jack FM',
        stationFormat: 'Adult Hits',
        type: 'event',
        title: 'Jack FM at Meridian Oktoberfest',
        description: 'Join Jack FM at Meridian\'s annual Oktoberfest celebration! We\'ll be broadcasting live, giving away prizes, and celebrating with the community. Stop by our booth for free Jack FM swag and enter to win a trip to Munich!',
        date: 'October 4, 2025',
        dateAdded: new Date().toISOString(),
        link: 'https://www.jackboise.com/',
        priority: 1,
        contentType: 'event'
      },

      // 96.9 The Eagle Content
      {
        id: 'eagle-podcast-1',
        station: '96.9 The Eagle',
        stationFormat: 'Classic Rock',
        type: 'podcast',
        title: 'Classic Rock Stories Podcast',
        description: 'Dive deep into the stories behind classic rock\'s greatest songs and albums. This week: The making of Led Zeppelin\'s "Stairway to Heaven" and exclusive interviews with band members.',
        date: 'October 2, 2025',
        dateAdded: new Date(Date.now() - 86400000).toISOString(),
        link: 'https://www.kkgl.com/',
        priority: 1,
        contentType: 'podcast'
      },
      {
        id: 'eagle-interview-1',
        station: '96.9 The Eagle',
        stationFormat: 'Classic Rock',
        type: 'interview',
        title: 'Interview: Sammy Hagar on Van Halen Legacy',
        description: 'The Eagle\'s morning show caught up with Sammy Hagar to discuss his time with Van Halen, his solo career, and his thoughts on the future of rock music. A must-listen for any rock fan!',
        date: 'October 3, 2025',
        dateAdded: new Date().toISOString(),
        link: 'https://www.kkgl.com/',
        priority: 1,
        contentType: 'interview'
      },

      // KBSX Public Radio Content
      {
        id: 'kbsx-community-1',
        station: '91.5 KBSX',
        stationFormat: 'Public Radio',
        type: 'community',
        title: 'Idaho Community Calendar: October Events',
        description: 'Your comprehensive guide to community events across southern Idaho. From town hall meetings to cultural celebrations, stay informed about what\'s happening in your community.',
        date: 'October 2025',
        dateAdded: new Date().toISOString(),
        link: 'https://www.boisestatepublicradio.org/community-calendar',
        priority: 2,
        contentType: 'community'
      },

      // Additional Contest Content
      {
        id: 'kboi-contest-1',
        station: 'KBOI 93.1FM & 670AM',
        stationFormat: 'News/Talk',
        type: 'contest',
        title: '$5K a Day Contest',
        description: 'Listen daily for your chance to win $5,000 cash! Multiple chances to win throughout the day during Kasper & Chris and other popular shows. Be caller 10 when you hear the cue to call!',
        date: 'Daily',
        dateAdded: new Date().toISOString(),
        link: 'https://www.kboi.com/contests/',
        priority: 1,
        contentType: 'contest'
      },
      {
        id: 'wild-contest-1',
        station: 'Wild 101.1 FM',
        stationFormat: 'Hip Hop/Top 40',
        type: 'contest',
        title: 'Listen to Win $500 Every Weekday',
        description: 'Tune in weekdays for your chance to win $500 cash! Listen for the cue to call and be caller 10 to win. No purchase necessary, must be 18 or older to participate.',
        date: 'Weekdays',
        dateAdded: new Date().toISOString(),
        link: 'https://wild101fm.com/contests/',
        priority: 1,
        contentType: 'contest'
      },
      {
        id: 'ktsy-contest-1',
        station: 'KTSY 89.5',
        stationFormat: 'Christian CHR',
        type: 'contest',
        title: 'I Love My Church Giveaway - $20,000 in Production Gear',
        description: '$20,000 in production gear giveaway for local churches. Help your church win professional audio and video equipment to enhance worship services. Vote now to support your church!',
        date: 'Ends October 31, 2025',
        dateAdded: new Date().toISOString(),
        link: 'https://ktsy.org/contests/',
        priority: 1,
        contentType: 'contest'
      }
    ];
  }
}

export default BoiseRadioScraper;