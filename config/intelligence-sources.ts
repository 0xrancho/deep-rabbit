// Intelligence Data Sources Configuration
// Defines all sources for weekly RAG updates

export interface DataSource {
  type: 'github' | 'api' | 'scrape' | 'rss';
  url: string;
  parser?: string;
  selector?: string;
  filters?: Record<string, any>;
  rateLimit?: number; // ms between requests
  priority?: 'high' | 'medium' | 'low';
  enabled?: boolean;
}

export const TOOL_SOURCES = {
  // Immediate/High-Priority Sources - Run Daily
  immediate: [
    {
      type: 'github' as const,
      url: 'https://github.com/e2b-dev/awesome-ai-agents',
      parser: 'markdown-list',
      priority: 'high' as const,
      rateLimit: 1000,
      enabled: true
    },
    {
      type: 'github' as const,
      url: 'https://github.com/steven2358/awesome-generative-ai',
      parser: 'markdown-list', 
      priority: 'high' as const,
      rateLimit: 1000,
      enabled: true
    },
    {
      type: 'rss' as const,
      url: 'https://www.producthunt.com/feed',
      filters: { 
        keywords: ['ai', 'automation', 'sales', 'crm', 'workflow', 'llm', 'gpt'],
        minUpvotes: 50
      },
      priority: 'high' as const,
      rateLimit: 2000,
      enabled: true
    },
    {
      type: 'api' as const,
      url: 'https://hacker-news.firebaseio.com/v0/topstories.json',
      parser: 'hackernews-api',
      filters: { 
        keywords: ['Show HN', 'ai', 'automation', 'workflow', 'saas'],
        scoreThreshold: 100
      },
      priority: 'medium' as const,
      rateLimit: 500,
      enabled: true
    }
  ],
  
  // Weekly Sources - Run Every Sunday
  weekly: [
    {
      type: 'scrape' as const,
      url: 'https://theresanaiforthat.com/newest/',
      selector: '.tool-card',
      parser: 'tait-scraper',
      priority: 'high' as const,
      rateLimit: 2000,
      enabled: true
    },
    {
      type: 'scrape' as const,
      url: 'https://www.futurepedia.io/newest',
      selector: '.tool-item',
      parser: 'futurepedia-scraper',
      priority: 'medium' as const,
      rateLimit: 2000,
      enabled: true
    },
    {
      type: 'github' as const,
      url: 'https://github.com/topics/ai-tools',
      parser: 'github-topics',
      filters: {
        minStars: 10,
        createdAfter: '2024-01-01',
        language: ['typescript', 'python', 'javascript']
      },
      priority: 'medium' as const,
      rateLimit: 1000,
      enabled: true
    },
    {
      type: 'api' as const,
      url: 'https://api.github.com/search/repositories',
      filters: {
        q: 'ai OR automation OR workflow OR llm created:>2024-01-01 stars:>5',
        sort: 'stars',
        per_page: 20
      },
      priority: 'low' as const,
      rateLimit: 1000,
      enabled: true
    }
  ]
};

// Intelligence Categories for Filtering
export const INTELLIGENCE_CATEGORIES = {
  primary: [
    'ai-model',
    'automation', 
    'crm',
    'enrichment',
    'workflow',
    'infrastructure'
  ],
  
  gabi_layers: [
    'Context Orchestration',
    'Knowledge Retrieval', 
    'Function Execution',
    'Conversational Interface'
  ],
  
  use_cases: [
    'lead-qualification',
    'proposal-generation', 
    'workflow-automation',
    'data-processing',
    'enrichment',
    'ai-integration'
  ],
  
  icp_targets: ['itsm', 'agency', 'saas', 'enterprise'],
  
  budget_ranges: ['free', 'low', 'medium', 'high']
};

// Relevance Filters - What Makes a Tool Worth Adding
export const RELEVANCE_CRITERIA = {
  required_keywords: [
    // AI/ML Terms
    'ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'claude',
    'openai', 'anthropic', 'language model', 'generative ai',
    
    // Business Process Terms  
    'automation', 'workflow', 'crm', 'sales', 'lead', 'qualification',
    'proposal', 'enrichment', 'data processing',
    
    // Technical Terms
    'api', 'integration', 'webhook', 'no-code', 'low-code', 'saas'
  ],
  
  excluded_keywords: [
    // Generic/Noise Terms
    'tutorial', 'course', 'learning', 'template', 'example',
    'demo', 'test', 'sample', 'playground',
    
    // Non-Business Tools
    'game', 'entertainment', 'social media', 'dating',
    'crypto', 'nft', 'blockchain'
  ],
  
  minimum_signals: {
    github_stars: 5,
    producthunt_upvotes: 20,
    hackernews_score: 50,
    website_required: true,
    description_min_length: 50
  }
};

// Source-Specific Parsers Configuration
export const PARSER_CONFIG = {
  'markdown-list': {
    patterns: {
      tool_link: /\[([^\]]+)\]\(([^)]+)\)/g,
      description: /- (.+?)(?=\n|$)/g,
      category_header: /#{2,4}\s+(.+)/g
    },
    extraction: {
      name_from_link: true,
      url_from_link: true,
      description_after_dash: true
    }
  },
  
  'tait-scraper': {
    selectors: {
      name: '.tool-name',
      description: '.tool-description', 
      category: '.tool-category',
      pricing: '.pricing-badge',
      url: '.tool-link'
    }
  },
  
  'hackernews-api': {
    fields: ['title', 'url', 'score', 'descendants'],
    filters: {
      min_score: 50,
      require_url: true,
      title_patterns: [/show hn/i, /ask hn.*tool/i, /ai/i]
    }
  }
};

// Rate Limiting and Retry Configuration
export const REQUEST_CONFIG = {
  default_timeout: 10000, // 10 seconds
  max_retries: 3,
  retry_backoff: [1000, 2000, 4000], // exponential backoff
  concurrent_limit: 3, // max parallel requests
  user_agent: 'RAG-Intelligence-Bot/1.0 (+https://github.com/your-repo)',
  
  headers: {
    'Accept': 'application/json, text/html, */*',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache'
  }
};

// Validation Rules for New Tools
export const VALIDATION_RULES = {
  required_fields: ['name', 'description', 'url'],
  url_validation: {
    require_https: false,
    check_accessibility: true,
    timeout: 5000
  },
  
  deduplication: {
    name_similarity_threshold: 0.8,
    description_similarity_threshold: 0.7,
    url_exact_match: true
  },
  
  quality_thresholds: {
    min_description_length: 30,
    max_description_length: 2000,
    require_pricing_info: false,
    require_category: true
  }
};

export default {
  TOOL_SOURCES,
  INTELLIGENCE_CATEGORIES,
  RELEVANCE_CRITERIA, 
  PARSER_CONFIG,
  REQUEST_CONFIG,
  VALIDATION_RULES
};