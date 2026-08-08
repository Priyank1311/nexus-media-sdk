export interface MediaItem {
  id: string | number;
  type?: 'image' | 'video';
  title?: string;
  uri: string;
  thumbnailUri?: string;
  width?: number;
  height?: number;
  duration?: number;
  author?: string;
}

export type PropGetterResult = Record<string, unknown>;
export type UserProps = Record<string, unknown>;

export interface UseGridOptions<T extends MediaItem> {
  items: T[];
  hasMore: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
}

export interface UseGridReturn<T extends MediaItem> {
  getContainerProps: (userProps?: UserProps) => PropGetterResult;
  getItemProps: (item: T, index: number, userProps?: UserProps) => PropGetterResult;
  getLoadMoreTriggerProps: (userProps?: UserProps) => PropGetterResult;
  loadMore: () => void;
  items: T[];
  hasMore: boolean;
  loading: boolean;
}

export interface GridProps<T extends MediaItem> extends UseGridOptions<T> {
  children: (item: T, index: number) => unknown;
}

export interface UseLightboxOptions<T extends MediaItem> {
  items: T[];
  onClose?: () => void;
}

export interface UseLightboxReturn<T extends MediaItem> {
  isOpen: boolean;
  currentItem: T | null;
  currentIndex: number;
  open: (index: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  getOverlayProps: (userProps?: UserProps) => PropGetterResult;
  getCloseButtonProps: (userProps?: UserProps) => PropGetterResult;
  getNextProps: (userProps?: UserProps) => PropGetterResult;
  getPrevProps: (userProps?: UserProps) => PropGetterResult;
  getTriggerProps: (index: number, userProps?: UserProps) => PropGetterResult;
}

export interface LightboxProps<T extends MediaItem> extends UseLightboxOptions<T> {
  renderContent: (item: T) => unknown;
}

export interface UseReelSwiperOptions<T extends MediaItem> {
  items: T[];
  onActiveChange?: (index: number, item: T) => void;
  activeThreshold?: number;
}

export interface UseReelSwiperReturn<T extends MediaItem> {
  activeIndex: number;
  activeItem: T | null;
  scrollTo: (index: number) => void;
  getContainerProps: (userProps?: UserProps) => PropGetterResult;
  getItemProps: (item: T, index: number, userProps?: UserProps) => PropGetterResult;
}

export interface ReelSwiperProps<T extends MediaItem> extends UseReelSwiperOptions<T> {
  children: (item: T, index: number, isActive: boolean) => unknown;
}

export function useGrid<T extends MediaItem>(options: UseGridOptions<T>): UseGridReturn<T> {
  const loadMore = () => options.onLoadMore?.();
  return {
    getContainerProps: (userProps = {}) => userProps,
    getItemProps: (_item, _index, userProps = {}) => userProps,
    getLoadMoreTriggerProps: (userProps = {}) => userProps,
    loadMore,
    items: options.items,
    hasMore: options.hasMore,
    loading: Boolean(options.loading),
  };
}

export function useLightbox<T extends MediaItem>(options: UseLightboxOptions<T>): UseLightboxReturn<T> {
  const noop = () => undefined;
  return {
    isOpen: false,
    currentItem: null,
    currentIndex: -1,
    open: noop,
    close: noop,
    next: noop,
    prev: noop,
    hasNext: false,
    hasPrev: false,
    getOverlayProps: (userProps = {}) => userProps,
    getCloseButtonProps: (userProps = {}) => userProps,
    getNextProps: (userProps = {}) => userProps,
    getPrevProps: (userProps = {}) => userProps,
    getTriggerProps: (_index, userProps = {}) => userProps,
  };
}

export function useReelSwiper<T extends MediaItem>(options: UseReelSwiperOptions<T>): UseReelSwiperReturn<T> {
  const first = options.items[0] ?? null;
  return {
    activeIndex: 0,
    activeItem: first,
    scrollTo: () => undefined,
    getContainerProps: (userProps = {}) => userProps,
    getItemProps: (_item, _index, userProps = {}) => userProps,
  };
}
