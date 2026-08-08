import type {
  MediaClient,
  MediaClientConfig,
  Photo,
  PhotosResponse,
  Video,
  VideosResponse,
  PaginationParams,
  SearchPhotosParams,
  SearchVideosParams,
  Result,
} from './types';
import {
  networkError,
  rateLimitError,
  apiError,
  parseError,
  unknownError,
} from './errors';
import { createEmitter } from './emitter';
import { createCache, buildCacheKey } from './cache';

const PHOTOS_BASE = 'https://api.pexels.com/v1';
const VIDEOS_BASE = 'https://api.pexels.com/videos';

// format url string with query params
function buildUrl(
  base: string,
  path: string,
  params: Record<string, unknown> = {},
): string {
  const url = new URL(`${base}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

// helper for fetching pexels api data
async function request<T>(url: string, apiKey: string): Promise<Result<T>> {
  try {
    let response: Response;

    try {
      response = await fetch(url, {
        headers: { Authorization: apiKey },
      });
    } catch (err) {
      return {
        ok: false,
        error: networkError(
          `Network request failed: ${err instanceof Error ? err.message : String(err)}`,
          err,
        ),
      };
    }

    if (response.status === 429) {
      return {
        ok: false,
        error: rateLimitError(
          'Pexels API rate limit exceeded. Free tier allows 200 requests/hour.',
        ),
      };
    }

    if (!response.ok) {
      let body = '';
      try {
        body = await response.text();
      } catch {
        // ignore body text error
      }
      return {
        ok: false,
        error: apiError(
          response.status,
          `API responded with ${response.status}: ${body || response.statusText}`,
        ),
      };
    }

    try {
      const data = (await response.json()) as T;
      return { ok: true, data };
    } catch (err) {
      return {
        ok: false,
        error: parseError('Failed to parse API response as JSON', err),
      };
    }
  } catch (err) {
    return {
      ok: false,
      error: unknownError('Unexpected error during request', err),
    };
  }
}

// create media client instance
export function createMediaClient(config: MediaClientConfig): MediaClient {
  const { apiKey } = config;
  const photosBase = config.baseUrl ? `${config.baseUrl}/v1` : PHOTOS_BASE;
  const videosBase = config.baseUrl ? `${config.baseUrl}/videos` : VIDEOS_BASE;

  const { emitter } = createEmitter();
  const cache = createCache();

  async function cachedRequest<T>(cacheKey: string, url: string): Promise<Result<T>> {
    const cached = cache.get<Result<T>>(cacheKey);
    if (cached) return cached;

    const result = await cache.dedup(cacheKey, () => request<T>(url, apiKey));
    const typedResult = result as Result<T>;

    if (typedResult.ok) {
      cache.set(cacheKey, typedResult);
    }

    return typedResult;
  }

  // search photo catalog
  async function searchPhotos(params: SearchPhotosParams): Promise<Result<PhotosResponse>> {
    const url = buildUrl(photosBase, '/search', params as unknown as Record<string, unknown>);
    const key = buildCacheKey('photos/search', params as unknown as Record<string, unknown>);
    return cachedRequest<PhotosResponse>(key, url);
  }

  // curated photos feed
  async function curatedPhotos(params: PaginationParams = {}): Promise<Result<PhotosResponse>> {
    const url = buildUrl(photosBase, '/curated', params as Record<string, unknown>);
    const key = buildCacheKey('photos/curated', params as Record<string, unknown>);
    return cachedRequest<PhotosResponse>(key, url);
  }

  // fetch single photo
  async function getPhoto(id: number): Promise<Result<Photo>> {
    const url = buildUrl(photosBase, `/photos/${id}`);
    const key = buildCacheKey(`photos/${id}`, {});
    return cachedRequest<Photo>(key, url);
  }

  // search video catalog
  async function searchVideos(params: SearchVideosParams): Promise<Result<VideosResponse>> {
    const url = buildUrl(videosBase, '/search', params as unknown as Record<string, unknown>);
    const key = buildCacheKey('videos/search', params as unknown as Record<string, unknown>);
    return cachedRequest<VideosResponse>(key, url);
  }

  // popular videos feed
  async function popularVideos(params: PaginationParams = {}): Promise<Result<VideosResponse>> {
    const url = buildUrl(videosBase, '/popular', params as Record<string, unknown>);
    const key = buildCacheKey('videos/popular', params as Record<string, unknown>);
    return cachedRequest<VideosResponse>(key, url);
  }

  // fetch single video
  async function getVideo(id: number): Promise<Result<Video>> {
    const url = buildUrl(videosBase, `/${id}`);
    const key = buildCacheKey(`videos/${id}`, {});
    return cachedRequest<Video>(key, url);
  }

  // analytics tracking
  function trackView(itemId: number | string): void {
    emitter.emit('view', { itemId, timestamp: Date.now() });
  }

  function trackDownload(itemId: number | string): void {
    emitter.emit('download', { itemId, timestamp: Date.now() });
  }

  return {
    searchPhotos,
    curatedPhotos,
    getPhoto,
    searchVideos,
    popularVideos,
    getVideo,
    trackView,
    trackDownload,
    emitter,
    clearCache: cache.clear,
  };
}
