// Firecrawl API Service for web scraping and content extraction

const FIRECRAWL_API_KEY = import.meta.env.VITE_FIRECRAWL_API_KEY;
const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1';

export interface FirecrawlScrapeOptions {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'content' | 'links' | 'screenshot' | 'screenshot@fullPage')[];
  onlyMainContent?: boolean;
  includeTags?: string[];
  excludeTags?: string[];
  headers?: Record<string, string>;
  waitFor?: number;
  timeout?: number;
}

export interface FirecrawlScrapeResponse {
  success: boolean;
  data?: {
    markdown?: string;
    content?: string;
    html?: string;
    rawHtml?: string;
    links?: string[];
    screenshot?: string;
    metadata?: {
      title?: string;
      description?: string;
      language?: string;
      keywords?: string;
      robots?: string;
      ogTitle?: string;
      ogDescription?: string;
      ogUrl?: string;
      ogImage?: string;
      ogLocaleAlternate?: string[];
      ogSiteName?: string;
      sourceURL?: string;
      statusCode?: number;
    };
  };
  error?: string;
}

export class FirecrawlService {
  private static instance: FirecrawlService;
  
  private constructor() {}
  
  static getInstance(): FirecrawlService {
    if (!FirecrawlService.instance) {
      FirecrawlService.instance = new FirecrawlService();
    }
    return FirecrawlService.instance;
  }
  
  /**
   * Scrape a single URL and extract content
   */
  async scrapeUrl(url: string, options: FirecrawlScrapeOptions = {}): Promise<FirecrawlScrapeResponse> {
    try {
      // Use the proxy API endpoint to avoid CORS issues
      const apiUrl = '/api/scrape';
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: url,
          options: options
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Firecrawl scraping error:', errorData);
        return {
          success: false,
          error: errorData.error || `HTTP ${response.status}: ${response.statusText}`
        };
      }
      
      const data = await response.json();
      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error scraping URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Extract business context from a company website
   */
  async extractBusinessContext(domain: string): Promise<{
    success: boolean;
    context?: {
      companyName?: string;
      description?: string;
      services?: string[];
      industries?: string[];
      content?: string;
    };
    error?: string;
  }> {
    // Ensure domain has protocol
    const url = domain.startsWith('http') ? domain : `https://${domain}`;
    
    const result = await this.scrapeUrl(url);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error || 'Failed to scrape website'
      };
    }
    
    const { markdown, content, metadata } = result.data;
    
    // Extract key information from metadata and content
    const context = {
      companyName: metadata?.ogSiteName || metadata?.title?.split(' - ')[0] || domain,
      description: metadata?.ogDescription || metadata?.description || '',
      services: this.extractServices(markdown || content || ''),
      industries: this.extractIndustries(markdown || content || ''),
      content: markdown || content || ''
    };
    
    return {
      success: true,
      context
    };
  }
  
  /**
   * Extract services mentioned in content
   */
  private extractServices(content: string): string[] {
    const serviceKeywords = [
      'consulting', 'development', 'integration', 'support', 'training',
      'implementation', 'migration', 'optimization', 'assessment', 'automation',
      'design', 'architecture', 'engineering', 'analytics', 'security'
    ];
    
    const services: string[] = [];
    const lowerContent = content.toLowerCase();
    
    serviceKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        // Look for context around the keyword
        const regex = new RegExp(`\\b([\\w\\s]+\\s+)?${keyword}(\\s+[\\w\\s]+)?\\b`, 'gi');
        const matches = content.match(regex);
        if (matches) {
          matches.forEach(match => {
            const cleaned = match.trim();
            if (cleaned.length < 50 && !services.includes(cleaned)) {
              services.push(cleaned);
            }
          });
        }
      }
    });
    
    return services.slice(0, 10); // Limit to top 10
  }
  
  /**
   * Extract industries mentioned in content
   */
  private extractIndustries(content: string): string[] {
    const industryKeywords = [
      'healthcare', 'finance', 'retail', 'manufacturing', 'technology',
      'education', 'government', 'energy', 'automotive', 'aerospace',
      'pharmaceutical', 'insurance', 'telecommunications', 'media', 'transportation'
    ];
    
    const industries: string[] = [];
    const lowerContent = content.toLowerCase();
    
    industryKeywords.forEach(keyword => {
      if (lowerContent.includes(keyword)) {
        industries.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    });
    
    return industries;
  }
}

export const firecrawlService = FirecrawlService.getInstance();