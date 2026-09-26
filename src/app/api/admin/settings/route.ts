import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import {
  getFeatureFlags,
  updateFeatureFlags,
  getSystemSettings,
  updateSystemSettings,
  getSeoSettings,
  updateSeoSettings,
  getLegalSettings,
  updateLegalSettings,
  getCookieSettings,
  updateCookieSettings,
  getSemanticClusters,
  updateSemanticClusters,
} from "@/lib/admin/settings-store";
import { getOzonProxyInfo } from "@/lib/parsers/ozon";
import { secureLogger } from "@/lib/utils/secure-logger";

export async function GET(req: NextRequest) {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен." }, { status: 401 });
  }

  const featureFlags = getFeatureFlags();
  const systemSettings = getSystemSettings();
  const seoSettings = getSeoSettings();
  const legalSettings = getLegalSettings();
  const cookieSettings = getCookieSettings();
  const semanticClusters = getSemanticClusters();
  const proxyInfo = getOzonProxyInfo();

  return NextResponse.json({
    success: true,
    featureFlags,
    systemSettings,
    seoSettings,
    legalSettings,
    cookieSettings,
    semanticClusters,
    proxyInfo,
  });
}

export async function POST(req: NextRequest) {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, updates, clusters } = body;

    if (!type) {
      return NextResponse.json(
        { error: "Не указан тип настроек." },
        { status: 400 },
      );
    }

    if (type === "feature_flags" && updates) {
      const updatedFlags = updateFeatureFlags(updates, admin.username);
      return NextResponse.json({
        success: true,
        message: "Флаги функций успешно сохранены и применены.",
        featureFlags: updatedFlags,
      });
    }

    if (type === "system_settings" && updates) {
      const updatedSettings = updateSystemSettings(updates, admin.username);
      return NextResponse.json({
        success: true,
        message: "Системные настройки успешно обновлены.",
        systemSettings: updatedSettings,
      });
    }

    if (type === "seo_settings" && updates) {
      const updatedSeo = updateSeoSettings(updates, admin.username);
      return NextResponse.json({
        success: true,
        message: "Настройки SEO и индексации успешно сохранены и применены.",
        seoSettings: updatedSeo,
      });
    }

    if (type === "legal_settings" && updates) {
      const updatedLegal = updateLegalSettings(updates, admin.username);
      return NextResponse.json({
        success: true,
        message: "Юридические настройки и реквизиты успешно сохранены.",
        legalSettings: updatedLegal,
      });
    }

    if (type === "cookie_settings" && updates) {
      const updatedCookie = updateCookieSettings(updates, admin.username);
      return NextResponse.json({
        success: true,
        message: "Настройки Cookie баннера успешно сохранены.",
        cookieSettings: updatedCookie,
      });
    }

    if (type === "semantic_clusters" && (clusters || updates)) {
      const targetClusters = Array.isArray(clusters) ? clusters : Array.isArray(updates) ? updates : [];
      const updatedClusters = updateSemanticClusters(targetClusters, admin.username);
      return NextResponse.json({
        success: true,
        message: "Семантическое ядро успешно сохранено.",
        semanticClusters: updatedClusters,
      });
    }

    return NextResponse.json({ error: "Неизвестный тип настроек или отсутствуют данные." }, { status: 400 });
  } catch (err) {
    secureLogger.error("[Admin Settings POST] Ошибка:", err);
    return NextResponse.json({ error: "Ошибка при сохранении настроек." }, { status: 500 });
  }
}
