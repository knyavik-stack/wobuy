export type MarketplaceSource = "wildberries" | "ozon" | "yandex_market";

export interface RawMarketplaceOffer {
  id: string;
  marketplace: MarketplaceSource;
  externalId: string;
  title: string;
  brand: string;
  category?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  currency: string;
  rating: number | null;
  reviewCount: number | null;
  url: string;
  imageUrl: string;
  deliveryDays?: number;
  deliveryText?: string;
  availability?: string;
  sellerName?: string;
  sellerRating?: number;
}

export interface CanonicalProductData {
  id: string;
  canonicalName: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  aiScore: number;
  antiFakePercent: number;
  aiTags: string[];
  priceSparkline: number[];
  discountPercent: number;
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
}

export interface ParserResult<T> {
  success: boolean;
  data: T;
  source: MarketplaceSource;
  error?: string;
  tookMs: number;
}
