import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";
import { getAuditLogs } from "@/lib/admin/settings-store";

export async function GET(req: NextRequest) {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(200, Math.max(10, parseInt(searchParams.get("limit") || "100", 10)));

  const logs = getAuditLogs(limit);

  return NextResponse.json({
    success: true,
    count: logs.length,
    logs,
  });
}
