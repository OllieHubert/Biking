// News Service for fetching real cycling news
class NewsService {
  constructor() {
    this.apiKey = process.env.REACT_APP_NEWS_API_KEY || '6e95472e48094d4b9975767540eb53fb';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  // Fetch news from multiple sources
  async fetchCyclingNews() {
    try {
      console.log('Fetching cycling news with API key:', this.apiKey ? 'Present' : 'Missing');
      
      // Try NewsAPI and Guardian API only
      const newsSources = await Promise.allSettled([
        this.fetchFromNewsAPI(),
        this.fetchFromGuardianAPI()
      ]);

      const allNews = [];
      newsSources.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
          console.log(`Source ${index + 1} returned ${result.value.length} articles`);
          allNews.push(...result.value);
        } else if (result.status === 'rejected') {
          console.error(`Source ${index + 1} failed:`, result.reason);
        }
      });

      // Return real news only, or empty array if no news found
      if (allNews.length > 0) {
        console.log(`Total articles found: ${allNews.length}`);
        return this.rankNews(allNews);
      } else {
        console.log('No real news found');
        return [];
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      return []; // Return empty array instead of mock data
    }
  }

  // Fetch from NewsAPI (requires API key)
  async fetchFromNewsAPI() {
    try {
      // Use multiple search queries to get comprehensive cycling news
      // Prioritized for newer articles and major UCI events, especially European races
      const searchQueries = [
        'UCI World Championships 2024',
        'European cycling championships',
        'Tour de France 2024',
        'Giro d\'Italia 2024',
        'Vuelta a España 2024',
        'Paris-Roubaix 2024',
        'Milan-San Remo 2024',
        'Liège-Bastogne-Liège 2024',
        'Israel cycling team name change',
        'cycling news Europe',
        'UCI cycling news',
        'professional cycling 2024',
        'cycling championship results',
        'bike racing news',
        'cycling technology 2024',
        'mountain biking championship'
      ];
      
      const allArticles = [];
      
      // Fetch from multiple queries to get diverse content
      for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries to avoid rate limits
        try {
          // Use CORS proxy for NewsAPI
          const proxyUrl = 'https://api.allorigins.win/raw?url=';
          // Prioritize very recent articles (last 3 days) for major events
          const fromDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          const newsApiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&language=en&from=${fromDate}&apiKey=${this.apiKey}`;
          const response = await fetch(proxyUrl + encodeURIComponent(newsApiUrl));
          
          if (!response.ok) {
            throw new Error(`NewsAPI error: ${response.status}`);
          }
          
          const data = await response.json();
          
          if (data.articles && data.articles.length > 0) {
            const cyclingArticles = data.articles
              .filter(article => this.isCyclingRelated(article.title, article.description))
              .map(article => ({
                id: `newsapi_${Date.now()}_${Math.random()}`,
                title: article.title,
                summary: article.description || article.content?.substring(0, 200) + '...',
                image: article.urlToImage,
                author: article.source.name,
                date: this.formatDate(article.publishedAt),
                url: article.url,
                category: this.categorizeNews(article.title, article.description),
                trending: this.isTrending(article.publishedAt),
                source: article.source.name,
                popularity: this.calculatePopularity(article)
              }));
            
            allArticles.push(...cyclingArticles);
          }
        } catch (queryError) {
          console.error(`Error fetching news for query "${query}":`, queryError);
        }
      }
      
      // Remove duplicates and return top articles
      const uniqueArticles = this.removeDuplicateArticles(allArticles);
      return uniqueArticles.slice(0, 10); // Return top 10 articles
      
    } catch (error) {
      console.error('NewsAPI error:', error);
    }
    return [];
  }

  // Fetch from Guardian API (free)
  async fetchFromGuardianAPI() {
    try {
      const response = await fetch(
        'https://content.guardianapis.com/search?q=cycling OR "bike racing" OR "UCI" OR "Tour de France" OR "cycling championship" OR "European cycling" OR "Israel cycling"&show-fields=thumbnail,trailText&page-size=10&from-date=2024-01-01&api-key=test'
      );
      const data = await response.json();
      
      if (data.response && data.response.results) {
        return data.response.results.map(article => ({
          id: `guardian_${Date.now()}_${Math.random()}`,
          title: article.webTitle,
          summary: article.fields?.trailText || article.webTitle,
          image: article.fields?.thumbnail,
          author: 'The Guardian',
          date: this.formatDate(article.webPublicationDate),
          url: article.webUrl,
          category: this.categorizeNews(article.webTitle, article.fields?.trailText),
          trending: this.isTrending(article.webPublicationDate),
          source: 'The Guardian',
          popularity: this.calculatePopularity(article)
        }));
      }
    } catch (error) {
      console.error('Guardian API error:', error);
    }
    return [];
  }

  // Mock news data for demonstration
  async fetchMockNews() {
    return [
      {
        id: 'mock_1',
        title: 'UCI World Championships 2024: New Records Set in Road Race',
        summary: 'Cyclists break multiple records in this year\'s championship races across different categories, with unprecedented performances in both men\'s and women\'s events.',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        author: 'Cycling Weekly',
        date: '2 hours ago',
        category: 'UCI News',
        trending: true,
        source: 'Mock',
        popularity: 95,
        url: '#'
      },
      {
        id: 'mock_2',
        title: 'Revolutionary Bike Technology Changes Training Methods',
        summary: 'Latest innovations in cycling technology are changing how athletes train and compete, with new power meters and AI coaching systems leading the way.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        author: 'Tech Cycling',
        date: '5 hours ago',
        category: 'Technology',
        trending: false,
        source: 'Mock',
        popularity: 78,
        url: '#'
      },
      {
        id: 'mock_3',
        title: 'Mountain Biking Safety Guidelines Updated for 2024',
        summary: 'New safety protocols and equipment recommendations for mountain biking enthusiasts, including updated helmet standards and trail safety measures.',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        author: 'Safety First',
        date: '1 day ago',
        category: 'Safety',
        trending: false,
        source: 'Mock',
        popularity: 65,
        url: '#'
      },
      {
        id: 'mock_4',
        title: 'Tour de France 2024 Route Revealed with New Challenges',
        summary: 'The official route for next year\'s Tour de France has been announced, featuring new mountain stages and challenging terrain that will test even the most experienced riders.',
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        author: 'Cycling News',
        date: '2 days ago',
        category: 'Tour de France',
        trending: true,
        source: 'Mock',
        popularity: 88,
        url: '#'
      },
      {
        id: 'mock_5',
        title: 'Local Cycling Club Hosts Record-Breaking Charity Ride',
        summary: 'Over 500 cyclists participated in the annual charity ride, raising more than $50,000 for local children\'s hospitals and setting a new participation record.',
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80',
        author: 'Local News',
        date: '3 days ago',
        category: 'Community',
        trending: false,
        source: 'Mock',
        popularity: 45,
        url: '#'
      }
    ];
  }

  // Check if article is cycling-related
  isCyclingRelated(title, description) {
    const text = `${title} ${description || ''}`.toLowerCase();
    const cyclingKeywords = [
      'cycling', 'bike', 'bicycle', 'cyclist', 'biker', 'biking',
      'uci', 'tour de france', 'giro', 'vuelta', 'velodrome',
      'mountain bike', 'mtb', 'road cycling', 'track cycling',
      'cycling championship', 'bike race', 'cycling race',
      'cycling team', 'cycling event', 'cycling news',
      'bike safety', 'cycling safety', 'bike helmet',
      'cycling technology', 'bike technology', 'cycling gear',
      'cycling training', 'bike training', 'cycling fitness',
      // Enhanced keywords for major events and recent developments
      'world championships', 'european championship', 'championship',
      'paris-roubaix', 'milan-san remo', 'liège-bastogne-liège',
      'israel', 'team name change', 'professional cycling',
      'grand tour', 'classic', 'monument', 'spring classic'
    ];
    
    return cyclingKeywords.some(keyword => text.includes(keyword));
  }

  // Remove duplicate articles based on title similarity
  removeDuplicateArticles(articles) {
    const seen = new Set();
    return articles.filter(article => {
      const title = article.title.toLowerCase();
      const words = title.split(' ').slice(0, 5); // First 5 words
      const key = words.join(' ');
      
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Categorize news based on content
  categorizeNews(title, description) {
    const text = `${title} ${description || ''}`.toLowerCase();
    
    if (text.includes('uci') || text.includes('championship') || text.includes('world cup')) {
      return 'UCI News';
    } else if (text.includes('tour de france') || text.includes('giro') || text.includes('vuelta')) {
      return 'Grand Tours';
    } else if (text.includes('technology') || text.includes('tech') || text.includes('innovation')) {
      return 'Technology';
    } else if (text.includes('safety') || text.includes('helmet') || text.includes('protection')) {
      return 'Safety';
    } else if (text.includes('mountain') || text.includes('mtb') || text.includes('trail')) {
      return 'Mountain Biking';
    } else if (text.includes('charity') || text.includes('community') || text.includes('local')) {
      return 'Community';
    } else if (text.includes('training') || text.includes('fitness') || text.includes('workout')) {
      return 'Training';
    } else {
      return 'General';
    }
  }

  // Check if news is trending (published recently)
  isTrending(publishedAt) {
    const published = new Date(publishedAt);
    const now = new Date();
    const hoursDiff = (now - published) / (1000 * 60 * 60);
    return hoursDiff < 24; // Trending if published within last 24 hours
  }

  // Calculate popularity score - REWEIGHTED for newer articles and major UCI events
  calculatePopularity(article) {
    let score = 20; // Lower base score to give more weight to recency and major events
    
    // MAJOR boost for very recent articles (within 24 hours)
    const publishedAt = new Date(article.publishedAt || article.webPublicationDate);
    const now = new Date();
    const hoursDiff = (now - publishedAt) / (1000 * 60 * 60);
    
    if (hoursDiff < 2) {
      score += 50; // Very recent (within 2 hours) - MASSIVE boost
    } else if (hoursDiff < 6) {
      score += 45; // Very recent (within 6 hours)
    } else if (hoursDiff < 24) {
      score += 35; // Recent (within 24 hours)
    } else if (hoursDiff < 72) {
      score += 25; // Fairly recent (within 3 days)
    } else if (hoursDiff < 168) {
      score += 15; // This week
    }
    
    // Boost for trending content (recent articles)
    if (this.isTrending(article.publishedAt || article.webPublicationDate)) {
      score += 20;
    }
    
    const text = `${article.title || article.webTitle} ${article.description || article.fields?.trailText || ''}`.toLowerCase();
    
    // MASSIVE boost for UCI World Championships and major events
    if (text.includes('uci world championships') || text.includes('world championships 2024')) {
      score += 35;
    } else if (text.includes('uci') || text.includes('championship') || text.includes('world cup')) {
      score += 25;
    }
    
    // MAJOR boost for European cycling events
    if (text.includes('european championship') || text.includes('european cycling')) {
      score += 30;
    }
    
    // MAJOR boost for Grand Tours and Classics
    if (text.includes('tour de france') || text.includes('giro') || text.includes('vuelta')) {
      score += 25;
    }
    
    // MAJOR boost for Spring Classics and Monuments
    if (text.includes('paris-roubaix') || text.includes('milan-san remo') || 
        text.includes('liège-bastogne-liège') || text.includes('flanders')) {
      score += 28;
    }
    
    // MAJOR boost for Israel team name change (recent development)
    if (text.includes('israel') && (text.includes('team') || text.includes('name change'))) {
      score += 30;
    }
    
    // Boost for professional cycling content
    if (text.includes('professional cycling') || text.includes('pro cycling')) {
      score += 20;
    }
    
    // Boost for major cycling events and results
    if (text.includes('cycling results') || text.includes('race results') || 
        text.includes('cycling news') || text.includes('cycling event')) {
      score += 18;
    }
    
    // Boost for technology content (reduced priority)
    if (text.includes('technology') || text.includes('innovation') || text.includes('tech')) {
      score += 12;
    }
    
    // Boost for safety content (reduced priority)
    if (text.includes('safety') || text.includes('helmet') || text.includes('protection')) {
      score += 10;
    }
    
    // Boost for mountain biking content (reduced priority)
    if (text.includes('mountain') || text.includes('mtb') || text.includes('trail')) {
      score += 8;
    }
    
    // Boost for training/fitness content (reduced priority)
    if (text.includes('training') || text.includes('fitness') || text.includes('workout')) {
      score += 6;
    }
    
    // MAJOR boost for cycling-focused sources
    const source = article.source?.name || article.source || '';
    const sourceLower = source.toLowerCase();
    if (sourceLower.includes('cycling') || sourceLower.includes('bike') || 
        sourceLower.includes('velo') || sourceLower.includes('bicycle')) {
      score += 20;
    } else if (sourceLower.includes('sport') || sourceLower.includes('athletic')) {
      score += 10;
    }
    
    // Reduced random variation to prioritize content quality
    score += Math.random() * 3;
    
    return Math.min(100, Math.max(0, Math.round(score)));
  }

  // Rank news by popularity and relevance - REWEIGHTED for newer articles and major events
  rankNews(news) {
    return news.sort((a, b) => {
      // First priority: Very recent articles (within 6 hours)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      const now = new Date();
      const hoursA = (now - dateA) / (1000 * 60 * 60);
      const hoursB = (now - dateB) / (1000 * 60 * 60);
      
      if (hoursA < 6 && hoursB >= 6) return -1;
      if (hoursA >= 6 && hoursB < 6) return 1;
      
      // Second priority: Trending status
      if (a.trending && !b.trending) return -1;
      if (!a.trending && b.trending) return 1;
      
      // Third priority: Recency (newer articles first)
      if (dateA > dateB) return -1;
      if (dateA < dateB) return 1;
      
      // Fourth priority: Popularity score
      return b.popularity - a.popularity;
    });
  }

  // Format date for display
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  }

  // Get quick news for ticker
  async getQuickNews() {
    const news = await this.fetchCyclingNews();
    return news.slice(0, 5).map(article => article.title);
  }

  // Get recent news for home page (top 3 most recent)
  async getRecentNews() {
    const news = await this.fetchCyclingNews();
    return news.slice(0, 3);
  }
}

export default new NewsService();
