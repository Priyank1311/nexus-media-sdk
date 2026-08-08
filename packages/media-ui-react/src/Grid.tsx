import React from 'react';
import { useGrid } from './useGrid';
import type { MediaItem, GridProps } from './types';

// simple unstyled grid component wrapper
export function Grid<T extends MediaItem>({
  items,
  hasMore,
  loading,
  onLoadMore,
  children,
}: GridProps<T>): React.JSX.Element {
  const grid = useGrid({ items, hasMore, loading, onLoadMore });

  return (
    <div {...grid.getGridProps()}>
      {grid.items.map((item, index) => (
        <div key={item.id} {...grid.getItemProps(item, index)}>
          {children(item, index)}
        </div>
      ))}
      {grid.hasMore && <div {...grid.getLoadMoreTriggerProps()} />}
    </div>
  );
}
