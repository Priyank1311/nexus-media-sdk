import { useEffect, useRef, useCallback } from 'react';
import type { SearchVideosParams, Video, VideosResponse } from '@media-sdk/core';
import { useMediaClient } from './context';
import { useAsyncState } from './useAsyncState';
import type { UseMediaSearchReturn } from './types';

// video search hook with pagination
export function useVideoSearch(
  params: SearchVideosParams,
): UseMediaSearchReturn<Video> {
  const client = useMediaClient();
  const { data, loading, error, execute, setData, setLoading, setError } =
    useAsyncState<Video[]>([]);

  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const totalRef = useRef(0);
  const loadingRef = useRef(false);

  const paramsKey = JSON.stringify(params);

  // fetch videos on param change
  useEffect(() => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    totalRef.current = 0;

    const doFetch = async () => {
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const result = await client.searchVideos({
          ...params,
          page: 1,
        });
        if (result.ok) {
          setData(result.data.videos);
          totalRef.current = result.data.total_results;
          hasMoreRef.current = !!result.data.next_page;
        } else {
          setError(result.error);
          setData([]);
        }
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };

    doFetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, client]);

  // load next page
  const loadMore = useCallback(() => {
    if (!hasMoreRef.current || loadingRef.current) return;

    const nextPage = pageRef.current + 1;
    loadingRef.current = true;

    execute<VideosResponse>(
      () => client.searchVideos({ ...params, page: nextPage }),
      (res) => {
        pageRef.current = nextPage;
        hasMoreRef.current = !!res.next_page;
        totalRef.current = res.total_results;
        return [...(data ?? []), ...res.videos];
      },
    ).finally(() => {
      loadingRef.current = false;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, paramsKey, data, execute]);

  return {
    data,
    loading,
    error,
    loadMore,
    hasMore: hasMoreRef.current,
    totalResults: totalRef.current,
  };
}
