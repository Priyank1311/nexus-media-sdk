import React from 'react';
import { useReelSwiper } from './useReelSwiper';
import type { MediaItem, ReelSwiperProps } from './types';

// unstyled reel swiper component wrapper
export function ReelSwiper<T extends MediaItem>({
  items,
  onActiveChange,
  activeThreshold,
  children,
}: ReelSwiperProps<T>): React.JSX.Element {
  const reel = useReelSwiper({ items, onActiveChange, activeThreshold });

  return (
    <div {...reel.getContainerProps()}>
      {items.map((item, index) => (
        <div key={item.id} {...reel.getItemProps(item, index)}>
          {children(item, index, reel.activeIndex === index)}
        </div>
      ))}
    </div>
  );
}
