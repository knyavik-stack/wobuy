import SearchResults from "../../../maket/SearchResults-v2";
import { searchProducts } from "@/lib/catalog/search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; category?: string; view?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const sort = params.sort ?? "relevance";
  const category = params.category ?? "all";
  const view = params.view === "list" ? "list" : "grid";
  let products = await searchProducts(query);
  const categories = [...new Set(products.map((product) => product.category).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "ru"),
  );
  if (category !== "all") products = products.filter((product) => product.category === category);
  products.sort((a, b) => {
    const priceA = Math.min(...a.offers.map((offer) => offer.price ?? Number.MAX_SAFE_INTEGER));
    const priceB = Math.min(...b.offers.map((offer) => offer.price ?? Number.MAX_SAFE_INTEGER));
    const ratingA = Math.max(...a.offers.map((offer) => offer.rating ?? 0));
    const ratingB = Math.max(...b.offers.map((offer) => offer.rating ?? 0));
    if (sort === "price_asc") return priceA - priceB;
    if (sort === "price_desc") return priceB - priceA;
    if (sort === "rating") return ratingB - ratingA;
    return a.title.localeCompare(b.title, "ru");
  });
  return (
    <SearchResults
      query={query}
      products={products}
      categories={categories}
      category={category}
      sort={sort}
      view={view}
    />
  );
}
