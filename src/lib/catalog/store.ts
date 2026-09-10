import type { SearchProduct } from "./product-types";

// Глобальное хранилище распарсенных товаров для прямого открытия по id без 404
export const LIVE_PRODUCTS_STORE = new Map<string, SearchProduct>();

export function saveProductToLiveStore(product: SearchProduct) {
  if (product && product.id) {
    LIVE_PRODUCTS_STORE.set(product.id, product);
    if (product.offers) {
      for (const off of product.offers) {
        if (off && off.id) {
          LIVE_PRODUCTS_STORE.set(off.id, product);
        }
      }
    }
  }
}
