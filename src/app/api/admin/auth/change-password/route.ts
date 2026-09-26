import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedAdmin, setCustomAdminPassword } from "@/lib/admin/auth";
import { addAuditLog } from "@/lib/admin/settings-store";
import { secureLogger } from "@/lib/utils/secure-logger";

export async function POST(req: NextRequest) {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    return NextResponse.json({ error: "Доступ запрещен." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { newPassword, newUsername } = body;

    if (!newPassword || typeof newPassword !== "string" || newPassword.trim().length < 6) {
      return NextResponse.json(
        { error: "Новый пароль должен содержать не менее 6 символов." },
        { status: 400 },
      );
    }

    const success = setCustomAdminPassword(newPassword, newUsername);
    if (!success) {
      return NextResponse.json(
        { error: "Не удалось сохранить новый пароль администратора." },
        { status: 500 },
      );
    }

    addAuditLog({
      adminUsername: admin.username,
      action: "ADMIN_PASSWORD_CHANGED",
      details: { newUsername: newUsername || admin.username },
      ipAddress: "internal",
      status: "success",
    });

    secureLogger.info(`[Admin Auth] Администратор ${admin.username} успешно обновил пароль`);

    return NextResponse.json({
      success: true,
      message: "Пароль администратора успешно изменен и сохранен в системе.",
    });
  } catch (err) {
    secureLogger.error("[Admin Change Password] Ошибка:", err);
    return NextResponse.json(
      { error: "Внутренняя ошибка при изменении пароля" },
      { status: 500 },
    );
  }
}
