// photo image sizes
export interface PhotoSrc {
  original: string;
  large2x: string;
  large: string;
  medium: string;
  small: string;
  portrait: string;
  landscape: string;
  tiny: string;
}

// photo item object
export interface Photo {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: PhotoSrc;
  liked: boolean;
  alt: string;
}

// single video file format
export interface VideoFile {
  id: number;
  quality: string;
  file_type: string;
  width: number;
  height: number;
  fps: number;
  link: string;
}

// video thumbnail picture
export interface VideoPicture {
  id: number;
  picture: string;
  nr: number;
}

// uploader profile info
export interface VideoUser {
  id: number;
  name: string;
  url: string;
}

// video item object
export interface Video {
  id: number;
  width: number;
  height: number;
  url: string;
  image: string;
  full_res: string | null;
  duration: number;
  user: VideoUser;
  video_files: VideoFile[];
  video_pictures: VideoPicture[];
}

// common pagination options
export interface PaginationParams {
  page?: number;
  per_page?: number;
}

// photo search filters
export interface SearchPhotosParams extends PaginationParams {
  query: string;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
  color?: string;
  locale?: string;
}

// video search filters
export interface SearchVideosParams extends PaginationParams {
  query: string;
  orientation?: 'landscape' | 'portrait' | 'square';
  size?: 'large' | 'medium' | 'small';
  locale?: string;
  min_width?: number;
  min_height?: number;
  min_duration?: number;
  max_duration?: number;
}

// photo list API response
export interface PhotosResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: Photo[];
  next_page?: string;
  prev_page?: string;
}

// video list API response
export interface VideosResponse {
  total_results: number;
  page: number;
  per_page: number;
  videos: Video[];
  next_page?: string;
  prev_page?: string;
  url?: string;
}

// error types
export type MediaErrorKind =
  | 'NETWORK_ERROR'
  | 'RATE_LIMIT'
  | 'API_ERROR'
  | 'PARSE_ERROR'
  | 'UNKNOWN_ERROR';

// error result details
export interface MediaError {
  kind: MediaErrorKind;
  message: string;
  status?: number;
  cause?: unknown;
}

// result wrapper instead of throwing
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: MediaError };

// event listener map
export interface MediaEventMap {
  view: { itemId: number | string; timestamp: number };
  download: { itemId: number | string; timestamp: number };
}

export type MediaEventName = keyof MediaEventMap;

export type MediaEventHandler<E extends MediaEventName> = (
  payload: MediaEventMap[E],
) => void;

// emitter interface
export interface MediaEmitter {
  subscribe<E extends MediaEventName>(
    event: E,
    handler: MediaEventHandler<E>,
  ): () => void;

  emit<E extends MediaEventName>(
    event: E,
    payload: MediaEventMap[E],
  ): void;
}

// client init config
export interface MediaClientConfig {
  apiKey: string;
  baseUrl?: string;
}

// main SDK interface
export interface MediaClient {
  searchPhotos(params: SearchPhotosParams): Promise<Result<PhotosResponse>>;
  curatedPhotos(params?: PaginationParams): Promise<Result<PhotosResponse>>;
  getPhoto(id: number): Promise<Result<Photo>>;

  searchVideos(params: SearchVideosParams): Promise<Result<VideosResponse>>;
  popularVideos(params?: PaginationParams): Promise<Result<VideosResponse>>;
  getVideo(id: number): Promise<Result<Video>>;

  trackView(itemId: number | string): void;
  trackDownload(itemId: number | string): void;

  readonly emitter: MediaEmitter;
  clearCache(): void;
}
