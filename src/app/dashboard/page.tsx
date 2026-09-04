import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/auth/auth-form";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <main className="min-h-screen bg-neutral-50 px-4 py-16">
      <section className="mx-auto max-w-3xl rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl shadow-neutral-950/5">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="mb-3 text-sm font-semibold text-neutral-500">WOBuy</p>
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-950">
              Добро пожаловать в личный кабинет
            </h1>
          </div>
          <LogoutButton />
        </div>
        <p className="mt-3 text-neutral-500">Ты успешно вошёл в аккаунт.</p>
        <p className="mt-6 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          {user.email}
        </p>
      </section>
    </main>
  );
}
