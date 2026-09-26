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
  wildberriesStatus: "operational" | "degraded" | "error";
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
