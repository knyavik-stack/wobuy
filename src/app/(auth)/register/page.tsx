import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/auth-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Создай аккаунт</CardTitle>
          <CardDescription>Зарегистрируйся в WOBuy с помощью email и пароля.</CardDescription>
        </CardHeader>
        <CardContent><RegisterForm /></CardContent>
      </Card>
    </main>
  );
}
