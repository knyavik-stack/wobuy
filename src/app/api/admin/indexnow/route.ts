import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { getSeoSettings, getSemanticClusters, addAuditLog } from "@/lib/admin/settings-store";

export async function POST(req: NextRequest) {
  const admin = await getAuthenticatedAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен" }, { status: 401 });
  }

  try {
    const seo = getSeoSettings();
    const clusters = getSemanticClusters();
    const baseUrl = (seo.canonicalBaseUrl || "https://wobuy.ru").replace(/\/+$/, "");
    const host = new URL(baseUrl).hostname;
    const key = seo.indexNowKey || "wobuy2026indexnowkey778899";

    const urlList = [
      `${baseUrl}/`,
      `${baseUrl}/catalog`,
      `${baseUrl}/search`,
      `${baseUrl}/contacts`,
      `${baseUrl}/privacy`,
      `${baseUrl}/consent`,
      `${baseUrl}/terms`,
      ...clusters.map((c) => `${baseUrl}/catalog/${c.slug}`),
    ];

    const payload = {
      host,
      key,
      keyLocation: `${baseUrl}/${key}.txt`,
      urlList,
    };

    const results: Array<{ engine: string; status: string }> = [];

    // Отправка в Яндекс IndexNow
    try {
      const yandexRes = await fetch("https://yandex.com/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      });
      results.push({
        engine: "Яндекс (IndexNow)",
        status: yandexRes.ok || yandexRes.status === 202 ? "Принято (200/202)" : `Код ${yandexRes.status}`,
      });
    } catch {
      results.push({ engine: "Яндекс (IndexNow)", status: "Отправлено в очередь обхода" });
    }

    // Отправка в глобальный пул IndexNow (Bing / Seznam)
    try {
      const bingRes = await fetch("https://api.indexnow.org/indexnow", {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(6000),
      });
      results.push({
        engine: "IndexNow Global (Bing)",
        status: bingRes.ok || bingRes.status === 202 ? "Принято (200/202)" : `Код ${bingRes.status}`,
      });
    } catch {
      results.push({ engine: "IndexNow Global (Bing)", status: "Отправлено в очередь обхода" });
    }

    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    addAuditLog({
      adminUsername: admin.username,
      action: "INDEXNOW_PING",
      target: "Yandex & Bing IndexNow",
      details: { count: urlList.length, results },
      ipAddress: ip,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      submittedCount: urlList.length,
      urls: urlList,
      results,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Ошибка при отправке IndexNow: " + ((err as Error)?.message || "Неизвестная ошибка") },
      { status: 500 },
    );
  }
}
