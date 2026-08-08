import type { MediaError } from '@media-sdk/core';

// re-exported core types
export type {
  Photo,
  PhotoSrc,
  PhotosResponse,
  Video,
  VideoFile,
  VideoPicture,
  VideoUser,
  VideosResponse,
  PaginationParams,
  SearchPhotosParams,
  SearchVideosParams,
  Result,
  MediaError,
  MediaErrorKind,
  MediaEventMap,
  MediaEventName,
  MediaEventHandler,
  MediaEmitter,
  MediaClient,
} from '@media-sdk/core';

// provider props
export interface MediaProviderProps {
  apiKey: string;
  baseUrl?: string;
  children: React.ReactNode;
}

// standard async state pattern
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: MediaError | null;
}

// return type for search hooks
export interface UseMediaSearchReturn<T> extends AsyncState<T[]> {
  loadMore: () => void;
  hasMore: boolean;
  totalResults: number;
}
