import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>С возвращением</CardTitle>
          <CardDescription>Войди в свой аккаунт WOBuy, чтобы продолжить.</CardDescription>
        </CardHeader>
        <CardContent><LoginForm /></CardContent>
      </Card>
    </main>
  );
}
