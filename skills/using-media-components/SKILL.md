---
name: using-media-components
description: Guide for consuming headless UI hooks and components from @media-sdk/ui-react using prop-getters, BYO-styling, accessibility rules, and layout composition.
---

# Consuming Headless UI Components with `@media-sdk/ui-react`

This document defines the strict requirements and patterns for building UI layouts using `@media-sdk/ui-react`.

---

## Core Contract Rules

1. **Zero SDK Imports**: `@media-sdk/ui-react` has **NO dependency** on `@media-sdk/core` or `@media-sdk/react`.
2. **Local `MediaItem` Mapping**: Components expect a generic `MediaItem` shape. You must map your domain objects (`Photo`, `Video`) into `MediaItem` before passing them to UI hooks/components.
3. **Prop-Getter Pattern**: Hooks expose `getXProps(userProps?)`. Always spread prop-getters onto DOM elements (`<div {...grid.getGridProps()} />`).
4. **Bring Your Own CSS**: Components ship with **zero visual styles**. All layout, grid columns, spacing, colors, and fonts are provided by the application via classes or inline styles.

---

## Local `MediaItem` Type Definition

```ts
export interface MediaItem {
  id: string | number;
  src: string;
  alt?: string;
  type?: 'image' | 'video';
  videoSrc?: string;
  width?: number;
  height?: number;
}
```

---

## 1. Grid Component / Hook (`useGrid`)

### Prop-Getters Exposed:
- `getGridProps(userProps?)`: Spreads `role="list"` and `aria-busy`.
- `getItemProps(item, index, userProps?)`: Spreads `role="listitem"` and `data-item-id`.
- `getLoadMoreTriggerProps(userProps?)`: Attaches an `IntersectionObserver` callback ref to trigger `onLoadMore` automatically when scrolled into view.

### Manual Load More:
- `grid.loadMore()`: Trigger pagination manually via button click.

---

## 2. Lightbox Component / Hook (`useLightbox`)

### Accessibility & Navigation Built-In:
- **Focus Trap**: Traps focus inside the modal dialog while open (`Tab` / `Shift+Tab`).
- **Focus Restoration**: Automatically restores focus to the trigger element when closed.
- **Keyboard Navigation**:
  - `Escape`: Closes the lightbox.
  - `ArrowRight`: Advances to the next item (`next()`).
  - `ArrowLeft`: Navigates to the previous item (`prev()`).

### Prop-Getters Exposed:
- `getTriggerProps(index, userProps?)`: Attach to thumbnails/cards. Captures active element for focus restoration on close.
- `getOverlayProps(userProps?)`: Attach to full-screen backdrop. Spreads `role="dialog"` and `aria-modal="true"`.
- `getCloseButtonProps(userProps?)`: Attach to close button.
- `getNextProps(userProps?)`: Attach to next button (disabled when `!hasNext`).
- `getPrevProps(userProps?)`: Attach to prev button (disabled when `!hasPrev`).

---

## 3. Reel Swiper Component / Hook (`useReelSwiper`)

Vertical snap-paging container (TikTok/Reels style).

### Features & Functional Styles:
- Includes minimal functional styles (`scrollSnapType: 'y mandatory'`, `scrollSnapAlign: 'start'`, `overflowY: 'scroll'`).
- `onActiveChange(index, item)`: Fires when an item crosses the `activeThreshold` (default `0.6`), allowing external playback control.

### Prop-Getters Exposed:
- `getContainerProps(userProps?)`: Attach to vertical scroll view.
- `getItemProps(item, index, userProps?)`: Attach to each slide.

---

## 4. Full Composition Example (Grid + Lightbox + Tailwind CSS)

```tsx
import { usePhotoSearch, useMediaTracking, type Photo } from '@media-sdk/react';
import { useGrid, useLightbox, type MediaItem } from '@media-sdk/ui-react';

export function PhotoGallery({ query }: { query: string }) {
  const { data: photos, loading, hasMore, loadMore } = usePhotoSearch({ query });
  const { trackView, trackDownload } = useMediaTracking();

  // 1. Map SDK Photo objects to local MediaItem shape
  const items: MediaItem[] = (photos || []).map((p) => ({
    id: p.id,
    src: p.src.large2x || p.src.large,
    alt: p.alt || `Photo by ${p.photographer}`,
  }));

  // 2. Initialize UI hooks
  const grid = useGrid({ items, hasMore, loading, onLoadMore: loadMore });
  const lightbox = useLightbox({ items });

  return (
    <div className="p-4">
      {/* Grid Container */}
      <div {...grid.getGridProps({ className: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4' })}>
        {grid.items.map((item, index) => (
          <div key={item.id} {...grid.getItemProps(item, index, { className: 'relative rounded-lg overflow-hidden' })}>
            {/* Lightbox Trigger Button */}
            <button
              type="button"
              {...lightbox.getTriggerProps(index, {
                className: 'w-full h-64 block focus:outline-none focus:ring-2 focus:ring-blue-500',
                onClick: () => trackView(item.id),
              })}
            >
              <img src={item.src} alt={item.alt} className="w-full h-full object-cover" loading="lazy" />
            </button>
          </div>
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      {grid.hasMore && <div {...grid.getLoadMoreTriggerProps({ className: 'h-10 my-4' })} />}

      {/* Lightbox Modal */}
      {lightbox.isOpen && lightbox.currentItem && (
        <div {...lightbox.getOverlayProps({ className: 'fixed inset-0 z-50 bg-black/90 flex items-center justify-center' })}>
          <div className="relative max-w-4xl max-h-[90vh] p-4 flex flex-col items-center">
            {/* Close Button */}
            <button
              type="button"
              {...lightbox.getCloseButtonProps({ className: 'absolute -top-10 right-0 text-white text-2xl p-2' })}
            >
              ✕
            </button>

            {/* Prev Button */}
            {lightbox.hasPrev && (
              <button
                type="button"
                {...lightbox.getPrevProps({ className: 'absolute left-4 top-1/2 -translate-y-1/2 text-white text-4xl p-2' })}
              >
                ‹
              </button>
            )}

            {/* Active Image */}
            <img
              src={lightbox.currentItem.src}
              alt={lightbox.currentItem.alt}
              className="max-h-[75vh] object-contain rounded"
            />

            <div className="mt-4 flex justify-between items-center w-full text-white">
              <span className="text-sm">{lightbox.currentItem.alt}</span>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm font-medium"
                onClick={() => {
                  if (lightbox.currentItem) {
                    trackDownload(lightbox.currentItem.id);
                    window.open(lightbox.currentItem.src, '_blank');
                  }
                }}
              >
                Download
              </button>
            </div>

            {/* Next Button */}
            {lightbox.hasNext && (
              <button
                type="button"
                {...lightbox.getNextProps({ className: 'absolute right-4 top-1/2 -translate-y-1/2 text-white text-4xl p-2' })}
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```
