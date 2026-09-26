import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin } from "@/lib/admin/auth";

export async function GET(req: NextRequest) {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    return NextResponse.json(
      { authenticated: false, error: "Неавторизованный доступ." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: admin,
  });
}
