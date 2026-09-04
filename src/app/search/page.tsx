import SearchResults from "../../../maket/SearchResults-v2";
import { searchProducts } from "@/lib/catalog/search";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const products = await searchProducts(query);

  return <SearchResults query={query} products={products} />;
}
