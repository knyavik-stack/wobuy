import { createClient } from "@/lib/supabase/server";

export type SearchProduct = {
  id: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  offers: Array<{
    id: string;
    marketplace: string;
    title: string;
    url: string;
    price: number | null;
    currency: string;
    rating: number | null;
    reviewCount: number | null;
    deliveryText: string;
    availability: string;
  }>;
};

function normalize(value: string | null | undefined) {
  return value?.trim() ?? "";
}

export async function searchProducts(query: string): Promise<SearchProduct[]> {
  const supabase = await createClient();
  const normalizedQuery = normalize(query);

  let productsQuery = supabase
    .from("products")
    .select(
      "id, canonical_name, brand, category, description, image_url, product_offers(id, marketplace, title, url, price, currency, rating, review_count, delivery_text, availability)",
    )
    .eq("is_active", true)
    .limit(40);

  if (normalizedQuery) {
    const pattern = `%${normalizedQuery}%`;
    productsQuery = productsQuery.or(
      `canonical_name.ilike.${pattern},brand.ilike.${pattern},category.ilike.${pattern},description.ilike.${pattern}`,
    );
  }

  const { data, error } = await productsQuery;

  if (error) {
    console.error("Ошибка поиска каталога:", error.message);
    return [];
  }

  return (data ?? []).map((product) => ({
    id: product.id,
    title: normalize(product.canonical_name) || "Товар без названия",
    brand: normalize(product.brand) || "Бренд не указан",
    category: normalize(product.category),
    description: normalize(product.description),
    imageUrl: normalize(product.image_url),
    offers: (product.product_offers ?? []).map((offer) => ({
      id: offer.id,
      marketplace: normalize(offer.marketplace),
      title: normalize(offer.title),
      url: normalize(offer.url),
      price: offer.price ?? null,
      currency: normalize(offer.currency) || "RUB",
      rating: offer.rating ?? null,
      reviewCount: offer.review_count ?? null,
      deliveryText: normalize(offer.delivery_text),
      availability: normalize(offer.availability),
    })),
  }));
}
