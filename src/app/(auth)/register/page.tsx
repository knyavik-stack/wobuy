import Link from "next/link";

export default function RegisterPage() {
  return (
    <main>
      <h1>Регистрация</h1>
      <p>Страница регистрации WOBuy подготовлена. Форма создания аккаунта будет добавлена следующим этапом.</p>
      <Link href="/login">Уже есть аккаунт? Войти</Link>
    </main>
  );
}
