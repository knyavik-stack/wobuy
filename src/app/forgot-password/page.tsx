import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ForgotPasswordForm } from "@/components/auth/auth-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Восстановление пароля</CardTitle>
          <CardDescription>Укажи email — мы отправим безопасную ссылку для смены пароля.</CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
