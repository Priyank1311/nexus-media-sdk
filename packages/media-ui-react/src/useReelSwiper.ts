import { useState, useCallback, useRef, useEffect } from 'react';
import { mergeProps } from './mergeProps';
import type {
  MediaItem,
  UseReelSwiperOptions,
  UseReelSwiperReturn,
  UserProps,
} from './types';

// vertical reel swiper hook with active index observer
export function useReelSwiper<T extends MediaItem>(
  options: UseReelSwiperOptions<T>,
): UseReelSwiperReturn<T> {
  const { items, onActiveChange, activeThreshold = 0.6 } = options;

  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Map<number, HTMLElement>>(new Map());
  const onActiveChangeRef = useRef(onActiveChange);
  onActiveChangeRef.current = onActiveChange;

  // observe active element in scroll container
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.reelIndex,
            );
            if (!isNaN(index)) {
              setActiveIndex(index);
              onActiveChangeRef.current?.(index, items[index]);
            }
          }
        }
      },
      {
        root: container,
        threshold: activeThreshold,
      },
    );

    for (const [, element] of itemRefs.current) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [items, activeThreshold]);

  const scrollTo = useCallback((index: number) => {
    const el = itemRefs.current.get(index);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // prop getters
  const getContainerProps = useCallback(
    (userProps?: UserProps) =>
      mergeProps(
        {
          ref: (node: HTMLElement | null) => {
            containerRef.current = node;
          },
          role: 'feed',
          'aria-label': 'Media reel',
          style: {
            overflowY: 'scroll' as const,
            scrollSnapType: 'y mandatory' as const,
          },
        },
        userProps,
      ),
    [],
  );

  const getItemProps = useCallback(
    (item: T, index: number, userProps?: UserProps) =>
      mergeProps(
        {
          ref: (node: HTMLElement | null) => {
            if (node) {
              itemRefs.current.set(index, node);
            } else {
              itemRefs.current.delete(index);
            }
          },
          role: 'article',
          'data-reel-index': index,
          'data-item-id': String(item.id),
          'aria-label': item.alt || `Item ${index + 1}`,
          'aria-setsize': items.length,
          'aria-posinset': index + 1,
          style: {
            scrollSnapAlign: 'start' as const,
          },
        },
        userProps,
      ),
    [items.length],
  );

  return {
    activeIndex,
    activeItem: items[activeIndex] ?? null,
    scrollTo,
    getContainerProps,
    getItemProps,
  };
}
