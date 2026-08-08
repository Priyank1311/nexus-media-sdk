import { useCallback, useRef } from 'react';
import { mergeProps } from './mergeProps';
import type {
  MediaItem,
  UseGridOptions,
  UseGridReturn,
  UserProps,
} from './types';

// grid layout hook with infinite scroll trigger
export function useGrid<T extends MediaItem>(
  options: UseGridOptions<T>,
): UseGridReturn<T> {
  const { items, hasMore, loading = false, onLoadMore } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);

  // sentinel element observer callback
  const sentinelCallbackRef = useCallback(
    (node: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

      if (!node || !hasMore || loading || !onLoadMore) return;

      observerRef.current = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            onLoadMore();
          }
        },
        { rootMargin: '200px' },
      );
      observerRef.current.observe(node);
    },
    [hasMore, loading, onLoadMore],
  );

  // manual trigger for pagination
  const loadMore = useCallback(() => {
    if (hasMore && !loading && onLoadMore) {
      onLoadMore();
    }
  }, [hasMore, loading, onLoadMore]);

  // prop getters
  const getGridProps = useCallback(
    (userProps?: UserProps) =>
      mergeProps(
        {
          role: 'list',
          'aria-busy': loading,
        },
        userProps,
      ),
    [loading],
  );

  const getItemProps = useCallback(
    (item: T, index: number, userProps?: UserProps) =>
      mergeProps(
        {
          role: 'listitem',
          'data-item-id': String(item.id),
          'data-index': index,
        },
        userProps,
      ),
    [],
  );

  const getLoadMoreTriggerProps = useCallback(
    (userProps?: UserProps) =>
      mergeProps(
        {
          ref: sentinelCallbackRef,
          'aria-hidden': true,
          'data-testid': 'load-more-sentinel',
        },
        userProps,
      ),
    [sentinelCallbackRef],
  );

  return {
    getGridProps,
    getItemProps,
    getLoadMoreTriggerProps,
    loadMore,
    items,
    hasMore,
    loading,
  };
}
