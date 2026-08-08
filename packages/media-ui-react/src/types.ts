// local SDK agnostic media item
export interface MediaItem {
  id: string | number;
  src: string;
  alt?: string;
  type?: 'image' | 'video';
  videoSrc?: string;
  width?: number;
  height?: number;
}

// prop getter result types
export type PropGetterResult = Record<string, unknown>;
export type UserProps = Record<string, unknown>;

// grid component types
export interface UseGridOptions<T extends MediaItem> {
  items: T[];
  hasMore: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
}

export interface UseGridReturn<T extends MediaItem> {
  getGridProps: (userProps?: UserProps) => PropGetterResult;
  getItemProps: (item: T, index: number, userProps?: UserProps) => PropGetterResult;
  getLoadMoreTriggerProps: (userProps?: UserProps) => PropGetterResult;
  loadMore: () => void;
  items: T[];
  hasMore: boolean;
  loading: boolean;
}

export interface GridProps<T extends MediaItem> extends UseGridOptions<T> {
  children: (item: T, index: number) => React.ReactNode;
}

// lightbox component types
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
  renderContent: (item: T) => React.ReactNode;
}

// reel swiper component types
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
  children: (item: T, index: number, isActive: boolean) => React.ReactNode;
}
