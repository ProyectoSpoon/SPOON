import type { VersionedProduct } from '@/app/dashboard/carta/types/product-versioning.types';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class MenuCache {
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  private static instance: MenuCache;
  private cache: Map<string, CacheItem<VersionedProduct[]>>;

  private constructor() {
    this.cache = new Map();
  }

  static getInstance(): MenuCache {
    if (!MenuCache.instance) {
      MenuCache.instance = new MenuCache();
    }
    return MenuCache.instance;
  }

  setItems(key: string, items: VersionedProduct[]): void {
    const now = Date.now();
    this.cache.set(key, {
      data: items,
      timestamp: now,
      expiresAt: now + MenuCache.CACHE_DURATION
    });
  }

  getItems(key: string): VersionedProduct[] | null {
    const cached = this.cache.get(key);
    if (!cached || Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  invalidateCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  updateItems(key: string, updateFn: (items: VersionedProduct[]) => VersionedProduct[]): void {
    const cached = this.cache.get(key);
    if (cached) {
      cached.data = updateFn(cached.data);
      cached.timestamp = Date.now();
      cached.expiresAt = Date.now() + MenuCache.CACHE_DURATION;
      this.cache.set(key, cached);
    }
  }
}