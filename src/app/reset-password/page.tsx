import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResetPasswordForm } from "@/components/auth/auth-form";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Ссылка недействительна</CardTitle>
            <CardDescription>Ссылка для смены пароля устарела или уже была использована.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-neutral-950 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800" href="/forgot-password">Запросить новую ссылку</Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Новый пароль</CardTitle>
          <CardDescription>Придумай новый пароль для своего аккаунта WOBuy.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm />
        </CardContent>
      </Card>
    </main>
  );
}
