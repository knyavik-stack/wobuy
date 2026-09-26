import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import {
  getFeatureFlags,
  updateFeatureFlags,
  getSystemSettings,
  updateSystemSettings,
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
  const proxyInfo = getOzonProxyInfo();

  return NextResponse.json({
    success: true,
    featureFlags,
    systemSettings,
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
    const { type, updates } = body;

    if (!type || !updates || typeof updates !== "object") {
      return NextResponse.json(
        { error: "Некорректный формат данных для обновления." },
        { status: 400 },
      );
    }

    if (type === "feature_flags") {
      const updatedFlags = updateFeatureFlags(updates, admin.username);
      return NextResponse.json({
        success: true,
        message: "Флаги функций успешно сохранены и применены.",
        featureFlags: updatedFlags,
      });
    }

    if (type === "system_settings") {
      const updatedSettings = updateSystemSettings(updates, admin.username);
      return NextResponse.json({
        success: true,
        message: "Системные настройки успешно обновлены.",
        systemSettings: updatedSettings,
      });
    }

    return NextResponse.json({ error: "Неизвестный тип настроек." }, { status: 400 });
  } catch (err) {
    secureLogger.error("[Admin Settings POST] Ошибка:", err);
    return NextResponse.json({ error: "Ошибка при сохранении настроек." }, { status: 500 });
  }
}
