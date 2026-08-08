// exports for core sdk package
export { createMediaClient } from './client';
export { createEmitter } from './emitter';
export {
  networkError,
  rateLimitError,
  apiError,
  parseError,
  unknownError,
} from './errors';

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
  MediaClientConfig,
  MediaClient,
} from './types';
