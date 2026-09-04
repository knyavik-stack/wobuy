import Link from "next/link";

export default function LoginPage() {
  return (
    <main>
      <h1>Вход</h1>
      <p>Страница авторизации WOBuy подготовлена. Форма входа будет добавлена следующим этапом.</p>
      <Link href="/register">Создать аккаунт</Link>
    </main>
  );
}
