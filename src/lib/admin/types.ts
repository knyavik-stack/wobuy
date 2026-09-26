export interface AdminUser {
  username: string;
  role: "superadmin" | "admin" | "moderator";
  displayName: string;
  lastLogin?: string;
}

export interface FeatureFlags {
  enableWildberriesParser: boolean;
  enableOzonParser: boolean;
  enableAiAgents: boolean;
  enableDuelMatrix: boolean;
  enableTcoCalculator: boolean;
  enableSemanticSearch: boolean;
  enableMaintenanceMode: boolean;
  strictAntiBot: boolean;
  enableLiveSearchCache: boolean;
  enableUserRegistrations: boolean;
}

export interface SystemSettings {
  rateLimitSearch: number; // requests per minute
  rateLimitParsers: number;
  rateLimitAi: number;
  minAntiFakePercent: number;
  maintenanceMessage: string;
  defaultCurrency: string;
  cacheTtlMinutes: number;
  maxSearchResults: number;
  contactSupportEmail: string;
}

export interface RobotsSettings {
  disallowPaths: string[];
  allowPaths: string[];
  customRules: string;
  hostUrl: string;
  crawlDelay?: number;
}

export interface SeoSettings {
  siteName: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  siteKeywords: string;
  canonicalBaseUrl: string;
  ogImageUrl: string;
  twitterCardType: "summary_large_image" | "summary";
  robotsIndexing: "index, follow" | "noindex, nofollow" | "noindex, follow";
  sitemapEnabled: boolean;
  jsonLdEnabled: boolean;
  catalogTitlePattern: string;
  productTitlePattern: string;
  yandexVerification: string;
  googleVerification: string;
  bingVerification?: string;
  yandexHtmlVerificationFile?: string;
  googleHtmlVerificationFile?: string;
  customHeadSnippet?: string;
  robotsSettings?: RobotsSettings;
  enableBreadcrumbsJsonLd?: boolean;
  enableProductJsonLd?: boolean;
  enableWebSiteSearchBox?: boolean;
  enableOrganizationJsonLd?: boolean;
}

export interface LegalSettings {
  companyName: string;
  brandName: string;
  inn: string;
  ogrn: string;
  legalAddress: string;
  supportEmail: string;
  supportPhone: string;
  workHours: string;
  privacyPolicyText: string;
  consentText: string;
  termsOfServiceText: string;
  cookiePolicyText: string;
  partnerDisclaimer: string;
  eridNotice: string;
}

export interface CookieBannerSettings {
  enabled: boolean;
  bannerTitle: string;
  bannerText: string;
  acceptButtonText: string;
  declineButtonText: string;
  customizeButtonText: string;
  allowDecline: boolean;
}

export interface SemanticQueryItem {
  query: string;
  anchorText: string;
  priority: number;
  tags: string[];
}

export interface SemanticCluster {
  id: string;
  category: string;
  slug: string;
  h1Title: string;
  metaDescription: string;
  keywords: string[];
  popularQueries: SemanticQueryItem[];
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminUsername: string;
  action: string;
  target?: string;
  details?: Record<string, unknown>;
  ipAddress: string;
  status: "success" | "warning" | "error";
}

export interface AnalyticsSummary {
  totalProducts: number;
  activeProducts: number;
  totalRegisteredUsers: number;
  totalSearchesToday: number;
  avgSearchTimeMs: number;
  wildberriesStatus: "operational" | "degraded" | "error" | "disabled";
  ozonStatus: "operational" | "proxy_active" | "challenge" | "disabled";
  databaseStatus: "connected" | "disconnected";
  aiServiceStatus: "ready" | "fallback" | "unavailable";
  topQueries: Array<{ query: string; count: number; lastSearched: string }>;
  popularCategories: Array<{ category: string; count: number }>;
  marketplaceShare: {
    wildberries: number;
    ozon: number;
  };
  recentSearches: Array<{
    query: string;
    timestamp: string;
    tookMs: number;
    resultsCount: number;
  }>;
}
