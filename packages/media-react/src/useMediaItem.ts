import { useEffect } from 'react';
import type { Photo, Video } from '@media-sdk/core';
import { useMediaClient } from './context';
import { useAsyncState } from './useAsyncState';
import type { AsyncState } from './types';

type MediaItemType = 'photo' | 'video';

type MediaItemData<T extends MediaItemType> = T extends 'photo'
  ? Photo
  : Video;

// single photo or video fetch hook
export function useMediaItem<T extends MediaItemType>(
  type: T,
  id: number | null,
): AsyncState<MediaItemData<T>> {
  const client = useMediaClient();
  const { data, loading, error, execute } =
    useAsyncState<MediaItemData<T>>();

  useEffect(() => {
    if (id === null) return;

    const fetcher =
      type === 'photo'
        ? () => client.getPhoto(id)
        : () => client.getVideo(id);

    execute(
      fetcher as () => Promise<
        { ok: true; data: MediaItemData<T> } | { ok: false; error: import('@media-sdk/core').MediaError }
      >,
    );
  }, [type, id, client, execute]);

  return { data, loading, error };
}
