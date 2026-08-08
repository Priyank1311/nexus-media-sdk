interface CacheEntry<T> {
  value: T;
  storedAt: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 min default ttl

// creates cache key from URL and query params
export function buildCacheKey(
  path: string,
  params: Record<string, unknown>,
): string {
  const sorted = Object.keys(params)
    .sort()
    .map((k) => `${k}=${String(params[k])}`)
    .join('&');
  return `${path}?${sorted}`;
}

// memory cache with request deduplication
export function createCache(ttlMs: number = DEFAULT_TTL_MS) {
  const store = new Map<string, CacheEntry<unknown>>();
  const inflight = new Map<string, Promise<unknown>>();

  // get items from cache
  function get<T>(key: string): T | undefined {
    const entry = store.get(key);
    if (!entry) return undefined;

    if (ttlMs > 0 && Date.now() - entry.storedAt > ttlMs) {
      store.delete(key);
      return undefined;
    }

    return entry.value as T;
  }

  // save item to cache
  function set<T>(key: string, value: T): void {
    store.set(key, { value, storedAt: Date.now() });
  }

  // deduplicate active network requests
  function dedup<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const existing = inflight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = factory().finally(() => {
      inflight.delete(key);
    });

    inflight.set(key, promise);
    return promise;
  }

  // clear all cached data
  function clear(): void {
    store.clear();
    inflight.clear();
  }

  return { get, set, dedup, clear };
}

export type Cache = ReturnType<typeof createCache>;
