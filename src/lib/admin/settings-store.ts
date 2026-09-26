import fs from "fs";
import path from "path";
import {
  FeatureFlags,
  SystemSettings,
  SeoSettings,
  LegalSettings,
  CookieBannerSettings,
  SemanticCluster,
  AuditLogEntry,
  AnalyticsSummary,
} from "./types";
import { DEFAULT_LEGAL_SETTINGS, DEFAULT_COOKIE_BANNER_SETTINGS, DEFAULT_ROBOTS_SETTINGS } from "@/lib/legal/legal-defaults";
import { DEFAULT_SEMANTIC_CLUSTERS } from "@/lib/seo/semantic-core";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { secureLogger } from "@/lib/utils/secure-logger";

// Дефолтные флаги функций
const DEFAULT_FEATURE_FLAGS: FeatureFlags = {
  enableWildberriesParser: true,
  enableOzonParser: true,
  enableAiAgents: true,
  enableDuelMatrix: true,
  enableTcoCalculator: true,
  enableSemanticSearch: true,
  enableMaintenanceMode: false,
  strictAntiBot: true,
  enableLiveSearchCache: true,
  enableUserRegistrations: true,
};

// Дефолтные системные настройки
const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  rateLimitSearch: 60,
  rateLimitParsers: 40,
  rateLimitAi: 30,
  minAntiFakePercent: 85,
  maintenanceMessage: "На платформе wobuy проводятся плановые технические работы. Пожалуйста, зайдите позже.",
  defaultCurrency: "RUB",
  cacheTtlMinutes: 10,
  maxSearchResults: 20,
  contactSupportEmail: "support@wobuy.ru",
};

// Дефолтные настройки SEO и индексации
export const DEFAULT_SEO_SETTINGS: SeoSettings = {
  siteName: "wobuy.",
  defaultTitle: "wobuy. — Умный поиск и честное сравнение цен на маркетплейсах",
  titleTemplate: "%s | wobuy.",
  defaultDescription: "wobuy. — ИИ-помощник для поиска, сравнения цен и выбора лучших предложений на Wildberries и Ozon. 100% честные цены, анти-фейк анализ и умная доставка.",
  siteKeywords: "wobuy, поиск товаров, сравнение цен, wildberries, ozon, маркетплейсы, честные отзывы, анти фейк, искусственный интеллект, умный шопинг",
  canonicalBaseUrl: process.env.NEXT_PUBLIC_APP_URL || "https://wobuy.ru",
  ogImageUrl: "/og-preview.png",
  twitterCardType: "summary_large_image",
  robotsIndexing: "index, follow",
  sitemapEnabled: true,
  jsonLdEnabled: true,
  enableBreadcrumbsJsonLd: true,
  enableProductJsonLd: true,
  enableWebSiteSearchBox: true,
  enableOrganizationJsonLd: true,
  catalogTitlePattern: "{query} — купить по выгодной цене | wobuy.",
  productTitlePattern: "{title} — купить по честной цене со скидкой | wobuy.",
  yandexVerification: "",
  googleVerification: "",
  bingVerification: "",
  yandexHtmlVerificationFile: "",
  googleHtmlVerificationFile: "",
  customHeadSnippet: "",
  robotsSettings: { ...DEFAULT_ROBOTS_SETTINGS },
};

// In-memory состояние для быстрого доступа
let cachedFeatureFlags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };
let cachedSystemSettings: SystemSettings = { ...DEFAULT_SYSTEM_SETTINGS };
let cachedSeoSettings: SeoSettings = { ...DEFAULT_SEO_SETTINGS };
let cachedLegalSettings: LegalSettings = { ...DEFAULT_LEGAL_SETTINGS };
let cachedCookieSettings: CookieBannerSettings = { ...DEFAULT_COOKIE_BANNER_SETTINGS };
let cachedSemanticClusters: SemanticCluster[] = [...DEFAULT_SEMANTIC_CLUSTERS];

const auditLogsStore: AuditLogEntry[] = [];
const searchAnalyticsStore: Array<{ query: string; timestamp: string; tookMs: number; resultsCount: number }> = [];

// Путь к локальному файлу сохранения настроек
const SETTINGS_FILE_PATH = path.resolve(process.cwd(), "data", "admin-settings.json");

/**
 * Инициализация и загрузка сохраненных настроек
 */
function loadPersistedSettings() {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed.featureFlags) {
        cachedFeatureFlags = { ...DEFAULT_FEATURE_FLAGS, ...parsed.featureFlags };
      }
      if (parsed.systemSettings) {
        cachedSystemSettings = { ...DEFAULT_SYSTEM_SETTINGS, ...parsed.systemSettings };
      }
      if (parsed.seoSettings) {
        cachedSeoSettings = {
          ...DEFAULT_SEO_SETTINGS,
          ...parsed.seoSettings,
          robotsSettings: {
            ...DEFAULT_ROBOTS_SETTINGS,
            ...(parsed.seoSettings?.robotsSettings || {}),
          },
        };
      }
      if (parsed.legalSettings) {
        cachedLegalSettings = { ...DEFAULT_LEGAL_SETTINGS, ...parsed.legalSettings };
      }
      if (parsed.cookieSettings) {
        cachedCookieSettings = { ...DEFAULT_COOKIE_BANNER_SETTINGS, ...parsed.cookieSettings };
      }
      if (parsed.semanticClusters && Array.isArray(parsed.semanticClusters)) {
        cachedSemanticClusters = parsed.semanticClusters;
      }
    }
  } catch (err) {
    secureLogger.warn("[SettingsStore] Не удалось прочитать локальный файл настроек:", (err as Error)?.message);
  }
}

// Загружаем при инициализации
loadPersistedSettings();

/**
 * Сохраняет настройки в локальный файл
 */
function persistSettingsToFile() {
  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const payload = {
      featureFlags: cachedFeatureFlags,
      systemSettings: cachedSystemSettings,
      seoSettings: cachedSeoSettings,
      legalSettings: cachedLegalSettings,
      cookieSettings: cachedCookieSettings,
      semanticClusters: cachedSemanticClusters,
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    secureLogger.warn("[SettingsStore] Ошибка сохранения настроек в файл:", (err as Error)?.message);
  }
}

// --- Флаги функций ---
export function getFeatureFlags(): FeatureFlags {
  return { ...cachedFeatureFlags };
}

export function updateFeatureFlags(updates: Partial<FeatureFlags>, adminUsername = "admin"): FeatureFlags {
  cachedFeatureFlags = { ...cachedFeatureFlags, ...updates };
  persistSettingsToFile();

  addAuditLog({
    adminUsername,
    action: "UPDATE_FEATURE_FLAGS",
    details: updates as Record<string, unknown>,
    ipAddress: "internal",
    status: "success",
  });

  return { ...cachedFeatureFlags };
}

// --- Системные настройки ---
export function getSystemSettings(): SystemSettings {
  return { ...cachedSystemSettings };
}

export function updateSystemSettings(updates: Partial<SystemSettings>, adminUsername = "admin"): SystemSettings {
  cachedSystemSettings = { ...cachedSystemSettings, ...updates };
  persistSettingsToFile();

  addAuditLog({
    adminUsername,
    action: "UPDATE_SYSTEM_SETTINGS",
    details: updates as Record<string, unknown>,
    ipAddress: "internal",
    status: "success",
  });

  return { ...cachedSystemSettings };
}

// --- SEO настройки ---
export function getSeoSettings(): SeoSettings {
  return {
    ...cachedSeoSettings,
    robotsSettings: cachedSeoSettings.robotsSettings || { ...DEFAULT_ROBOTS_SETTINGS },
  };
}

export function updateSeoSettings(updates: Partial<SeoSettings>, adminUsername = "admin"): SeoSettings {
  cachedSeoSettings = {
    ...cachedSeoSettings,
    ...updates,
    robotsSettings: updates.robotsSettings
      ? { ...(cachedSeoSettings.robotsSettings || DEFAULT_ROBOTS_SETTINGS), ...updates.robotsSettings }
      : (cachedSeoSettings.robotsSettings || DEFAULT_ROBOTS_SETTINGS),
  };
  persistSettingsToFile();

  addAuditLog({
    adminUsername,
    action: "UPDATE_SEO_SETTINGS",
    details: updates as Record<string, unknown>,
    ipAddress: "internal",
    status: "success",
  });

  return getSeoSettings();
}

// --- Юридические настройки (152-ФЗ, Реквизиты, Оферта) ---
export function getLegalSettings(): LegalSettings {
  return { ...cachedLegalSettings };
}

export function updateLegalSettings(updates: Partial<LegalSettings>, adminUsername = "admin"): LegalSettings {
  cachedLegalSettings = { ...cachedLegalSettings, ...updates };
  persistSettingsToFile();

  addAuditLog({
    adminUsername,
    action: "UPDATE_LEGAL_SETTINGS",
    details: updates as Record<string, unknown>,
    ipAddress: "internal",
    status: "success",
  });

  return { ...cachedLegalSettings };
}

// --- Cookie баннер ---
export function getCookieSettings(): CookieBannerSettings {
  return { ...cachedCookieSettings };
}

export function updateCookieSettings(updates: Partial<CookieBannerSettings>, adminUsername = "admin"): CookieBannerSettings {
  cachedCookieSettings = { ...cachedCookieSettings, ...updates };
  persistSettingsToFile();

  addAuditLog({
    adminUsername,
    action: "UPDATE_COOKIE_SETTINGS",
    details: updates as Record<string, unknown>,
    ipAddress: "internal",
    status: "success",
  });

  return { ...cachedCookieSettings };
}

// --- Семантическое ядро ---
export function getSemanticClusters(): SemanticCluster[] {
  return [...cachedSemanticClusters];
}

export function updateSemanticClusters(clusters: SemanticCluster[], adminUsername = "admin"): SemanticCluster[] {
  cachedSemanticClusters = [...clusters];
  persistSettingsToFile();

  addAuditLog({
    adminUsername,
    action: "UPDATE_SEMANTIC_CLUSTERS",
    details: { totalClusters: clusters.length },
    ipAddress: "internal",
    status: "success",
  });

  return [...cachedSemanticClusters];
}

// --- Аналитика поиска ---
export function recordSearchAnalytics(query: string, tookMs: number, resultsCount: number) {
  if (!query || query.trim().length === 0) return;
  searchAnalyticsStore.unshift({
    query: query.trim(),
    timestamp: new Date().toISOString(),
    tookMs,
    resultsCount,
  });

  if (searchAnalyticsStore.length > 500) {
    searchAnalyticsStore.length = 500;
  }
}

// --- Журнал аудита ---
export function addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
  const newLog: AuditLogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  auditLogsStore.unshift(newLog);
  if (auditLogsStore.length > 300) {
    auditLogsStore.length = 300;
  }
}

export function getAuditLogs(limit?: number): AuditLogEntry[] {
  if (limit && limit > 0) {
    return auditLogsStore.slice(0, limit);
  }
  return [...auditLogsStore];
}

// --- Сводная статистика для аналитики ---
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  let totalProducts = 0;
  let activeProducts = 0;
  let totalUsers = 0;
  let dbStatus: "connected" | "disconnected" = "disconnected";

  try {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { count: prodCount } = await supabase.from("products").select("*", { count: "exact", head: true });
      const { count: activeCount } = await supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true);
      const { count: usersCount } = await supabase.from("user_profiles").select("*", { count: "exact", head: true });

      totalProducts = prodCount || 0;
      activeProducts = activeCount || 0;
      totalUsers = usersCount || 0;
      dbStatus = "connected";
    }
  } catch {
    dbStatus = "disconnected";
  }

  const queryCounts: Record<string, { count: number; lastSearched: string }> = {};
  searchAnalyticsStore.forEach((item) => {
    if (!queryCounts[item.query]) {
      queryCounts[item.query] = { count: 1, lastSearched: item.timestamp };
    } else {
      queryCounts[item.query].count += 1;
      queryCounts[item.query].lastSearched = item.timestamp;
    }
  });

  const topQueries = Object.entries(queryCounts)
    .map(([query, data]) => ({ query, count: data.count, lastSearched: data.lastSearched }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const avgSearchTime = searchAnalyticsStore.length > 0
    ? Math.round(searchAnalyticsStore.reduce((acc, curr) => acc + curr.tookMs, 0) / searchAnalyticsStore.length)
    : 140;

  return {
    totalProducts,
    activeProducts,
    totalRegisteredUsers: totalUsers,
    totalSearchesToday: searchAnalyticsStore.length,
    avgSearchTimeMs: avgSearchTime,
    wildberriesStatus: cachedFeatureFlags.enableWildberriesParser ? "operational" : "disabled",
    ozonStatus: cachedFeatureFlags.enableOzonParser ? "operational" : "disabled",
    databaseStatus: dbStatus,
    aiServiceStatus: cachedFeatureFlags.enableAiAgents ? "ready" : "fallback",
    topQueries,
    popularCategories: [
      { category: "Смартфоны и гаджеты", count: 42 },
      { category: "Ноутбуки и ПК", count: 28 },
      { category: "Наушники и аудио", count: 35 },
      { category: "Бытовая техника", count: 24 },
      { category: "Смарт-часы", count: 19 },
    ],
    marketplaceShare: {
      wildberries: 58,
      ozon: 42,
    },
    recentSearches: searchAnalyticsStore.slice(0, 15),
  };
}
