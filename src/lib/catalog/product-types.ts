export type SearchProduct = {
  id: string;
  title: string;
  brand: string;
  category: string;
  description: string;
  imageUrl: string;
  images?: string[];
  aiScore: number;
  antiFakePercent: number;
  aiTags: string[];
  priceSparkline: number[];
  discountPercent: number;
  triumph?: {
    slotType: "wb" | "ozon" | "economist" | "express";
    badgeTitle: string;
    badgeSubtitle: string;
    marketplace: string;
    verdict: string;
    price?: number | null;
    deliveryText?: string;
    metrics?: {
      basePrice?: number;
      savings?: number;
      deliveryDays?: number;
      speedAdvantage?: string;
    };
  };
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
