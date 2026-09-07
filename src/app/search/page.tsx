import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import SearchResults from "../../../maket/SearchResults-v2";
import { searchProducts } from "@/lib/catalog/search";
import { createClient } from "@/lib/supabase/server";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const view = params.view === "list" ? "list" : "grid";

  // Если запрос пустой (например при возврате назад), проверяем сохраненную куку последнего поиска
  if (!query) {
    try {
      const cookieStore = await cookies();
      const lastQuery = cookieStore.get("wobuy_last_query")?.value;
      if (lastQuery && lastQuery.trim()) {
        redirect(`/search?q=${encodeURIComponent(lastQuery.trim())}`);
      }
    } catch (err) {
      if ((err as Error)?.message?.includes("NEXT_REDIRECT")) {
        throw err;
      }
    }
  }

  // Обязательная проверка авторизации: поиск доступен только залогиненным пользователям
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const nextUrl = query ? `/search?q=${encodeURIComponent(query)}` : "/search";
        redirect(`/login?next=${encodeURIComponent(nextUrl)}`);
      }
    }
  } catch (err) {
    // Если произошел редирект от Next.js, пробрасываем его дальше
    if ((err as Error)?.message?.includes("NEXT_REDIRECT")) {
      throw err;
    }
    console.warn("[SearchPage] Auth verification error:", err);
  }

  // Запуск поискового конвейера
  const products = query ? await searchProducts(query) : [];

  return (
    <SearchResults
      query={query}
      products={products}
      view={view}
    />
  );
}
