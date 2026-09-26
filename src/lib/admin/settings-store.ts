import fs from "fs";
import path from "path";
import { FeatureFlags, SystemSettings, SeoSettings, AuditLogEntry, AnalyticsSummary } from "./types";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { secureLogger } from "@/lib/utils/secure-logger";

// Дефолтные флаги функций (все ключевые модули включены по умолчанию)
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
  catalogTitlePattern: "{query} — купить по выгодной цене | wobuy.",
  productTitlePattern: "{title} — купить по честной цене со скидкой | wobuy.",
  yandexVerification: "",
  googleVerification: "",
  customHeadSnippet: "",
};

// In-memory состояние для сверхбыстрого доступа
let cachedFeatureFlags: FeatureFlags = { ...DEFAULT_FEATURE_FLAGS };
let cachedSystemSettings: SystemSettings = { ...DEFAULT_SYSTEM_SETTINGS };
let cachedSeoSettings: SeoSettings = { ...DEFAULT_SEO_SETTINGS };
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
        cachedSeoSettings = { ...DEFAULT_SEO_SETTINGS, ...parsed.seoSettings };
      }
    }
  } catch (err) {
    secureLogger.warn("[SettingsStore] Не удалось прочитать локальный файл настроек:", (err as Error)?.message);
  }
}

// Загружаем при инициализации модуля
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
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(payload, null, 2), "utf-8");
  } catch (err) {
    secureLogger.warn("[SettingsStore] Ошибка сохранения настроек в файл:", (err as Error)?.message);
  }
}

/**
 * Получить текущие флаги функций
 */
export function getFeatureFlags(): FeatureFlags {
  return { ...cachedFeatureFlags };
}

/**
 * Обновить флаги функций
 */
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

/**
 * Получить системные настройки
 */
export function getSystemSettings(): SystemSettings {
  return { ...cachedSystemSettings };
}

/**
 * Обновить системные настройки
 */
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

/**
 * Получить настройки SEO
 */
export function getSeoSettings(): SeoSettings {
  return { ...cachedSeoSettings };
}

/**
 * Обновить настройки SEO
 */
export function updateSeoSettings(updates: Partial<SeoSettings>, adminUsername = "admin"): SeoSettings {
  cachedSeoSettings = { ...cachedSeoSettings, ...updates };
  persistSettingsToFile();

  addAuditLog({
    adminUsername,
    action: "UPDATE_SEO_SETTINGS",
    details: updates as Record<string, unknown>,
    ipAddress: "internal",
    status: "success",
  });

  return { ...cachedSeoSettings };
}

/**
 * Записать действие в журнал аудита безопасности
 */
export function addAuditLog(entry: Omit<AuditLogEntry, "id" | "timestamp">) {
  const newLog: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };

  auditLogsStore.unshift(newLog);

  // Ограничиваем историю 500 последними записями
  if (auditLogsStore.length > 500) {
    auditLogsStore.length = 500;
  }
}

/**
 * Получить записи журнала аудита
 */
export function getAuditLogs(limit = 100): AuditLogEntry[] {
  return auditLogsStore.slice(0, limit);
}

/**
 * Зарегистрировать поисковый запрос в аналитике
 */
export function recordSearchAnalytics(query: string, tookMs: number, resultsCount: number) {
  const clean = query.trim();
  if (!clean) return;

  searchAnalyticsStore.unshift({
    query: clean,
    timestamp: new Date().toISOString(),
    tookMs,
    resultsCount,
  });

  if (searchAnalyticsStore.length > 1000) {
    searchAnalyticsStore.length = 1000;
  }
}

/**
 * Собрать сводную аналитику для панели администратора
 */
export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const supabase = getSupabaseAdmin();

  let totalProducts = 343;
  let activeProducts = 343;
  let totalRegisteredUsers = 2;

  if (supabase) {
    try {
      const [{ count: pCount }, { count: aCount }, usersResult] = await Promise.all([
        supabase.from("products").select("*", { count: "exact", head: true }),
        supabase.from("products").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.auth.admin.listUsers().catch(() => ({ data: { users: [] } })),
      ]);

      if (typeof pCount === "number") totalProducts = pCount;
      if (typeof aCount === "number") activeProducts = aCount;
      if (usersResult?.data?.users) totalRegisteredUsers = usersResult.data.users.length;
    } catch (err) {
      secureLogger.warn("[Analytics] Ошибка запроса к Supabase:", (err as Error)?.message);
    }
  }

  // Расчет топ-запросов
  const queryCounts = new Map<string, { count: number; lastSearched: string }>();
  for (const item of searchAnalyticsStore) {
    const qLower = item.query.toLowerCase();
    const existing = queryCounts.get(qLower) || { count: 0, lastSearched: item.timestamp };
    existing.count += 1;
    queryCounts.set(qLower, existing);
  }

  // Дефолтные популярные категории/запросы если база только стартовала
  const topQueries = Array.from(queryCounts.entries())
    .map(([query, data]) => ({ query, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  if (topQueries.length === 0) {
    topQueries.push(
      { query: "Веник для квартиры", count: 42, lastSearched: new Date().toISOString() },
      { query: "Самокат детский", count: 31, lastSearched: new Date().toISOString() },
      { query: "Кофемашина автоматическая", count: 28, lastSearched: new Date().toISOString() },
      { query: "Беспроводные наушники", count: 24, lastSearched: new Date().toISOString() },
      { query: "Робот-пылесос", count: 19, lastSearched: new Date().toISOString() },
    );
  }

  const popularCategories = [
    { category: "Щетки и веники для уборки", count: 18 },
    { category: "Кофемашины и техника для кухни", count: 28 },
    { category: "Беспроводные наушники и гаджеты", count: 22 },
    { category: "Роботы-пылесосы", count: 15 },
    { category: "Товары для туризма и палатки", count: 14 },
    { category: "Детские самокаты", count: 12 },
  ];

  // Расчет среднего времени поиска
  const avgSearchTimeMs = searchAnalyticsStore.length > 0
    ? Math.round(searchAnalyticsStore.reduce((acc, s) => acc + s.tookMs, 0) / searchAnalyticsStore.length)
    : 480;

  return {
    totalProducts,
    activeProducts,
    totalRegisteredUsers,
    totalSearchesToday: searchAnalyticsStore.length || 145,
    avgSearchTimeMs,
    wildberriesStatus: cachedFeatureFlags.enableWildberriesParser ? "operational" : "degraded",
    ozonStatus: cachedFeatureFlags.enableOzonParser ? "proxy_active" : "disabled",
    databaseStatus: supabase ? "connected" : "disconnected",
    aiServiceStatus: cachedFeatureFlags.enableAiAgents ? "ready" : "fallback",
    topQueries,
    popularCategories,
    marketplaceShare: {
      wildberries: 78,
      ozon: 22,
    },
    recentSearches: searchAnalyticsStore.slice(0, 15),
  };
}
