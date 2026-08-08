export type MediaItem = {
  id: string | number;
  type?: 'image' | 'video';
  title?: string;
  uri: string;
  thumbnailUri?: string;
  width?: number;
  height?: number;
  duration?: number;
  author?: string;
};

export type MediaEventName = 'view' | 'download';

export type MediaEventPayload = {
  itemId: string | number;
  timestamp: number;
};

export type MediaEventHandler = (payload: MediaEventPayload) => void;

export interface MediaEmitter {
  subscribe: (event: MediaEventName, handler: MediaEventHandler) => () => void;
  emit: (event: MediaEventName, payload: MediaEventPayload) => void;
}

export interface MediaClient {
  getItems: () => Promise<MediaItem[]>;
  getItem: (id: string | number) => Promise<MediaItem | null>;
  trackView: (itemId: string | number) => void;
  trackDownload: (itemId: string | number) => void;
  emitter: MediaEmitter;
}

export interface MediaProviderProps {
  client: MediaClient;
  children?: unknown;
}

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export interface UseMediaSearchReturn<T> extends AsyncState<T[]> {
  loadMore: () => void;
  hasMore: boolean;
}

export function createMediaEmitter(): MediaEmitter {
  const listeners: Record<MediaEventName, Set<MediaEventHandler>> = {
    view: new Set(),
    download: new Set(),
  };

  return {
    subscribe(event, handler) {
      listeners[event].add(handler);
      return () => listeners[event].delete(handler);
    },
    emit(event, payload) {
      listeners[event].forEach((handler) => handler(payload));
    },
  };
}

export function createMediaClient(items: MediaItem[] = []): MediaClient {
  const emitter = createMediaEmitter();

  return {
    async getItems() {
      return items;
    },
    async getItem(id) {
      return items.find((item) => item.id === id) ?? null;
    },
    trackView(itemId) {
      emitter.emit('view', { itemId, timestamp: Date.now() });
    },
    trackDownload(itemId) {
      emitter.emit('download', { itemId, timestamp: Date.now() });
    },
    emitter,
  };
}
