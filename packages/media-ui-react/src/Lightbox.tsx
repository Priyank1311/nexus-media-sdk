import React from 'react';
import { createPortal } from 'react-dom';
import { useLightbox } from './useLightbox';
import type { MediaItem, LightboxProps } from './types';

// simple portal lightbox component wrapper
export function Lightbox<T extends MediaItem>({
  items,
  onClose,
  renderContent,
}: LightboxProps<T>): React.JSX.Element {
  const lb = useLightbox({ items, onClose });

  const triggers = items.map((item, i) => (
    <span key={item.id} {...lb.getTriggerProps(i)}>
      {renderContent(item)}
    </span>
  ));

  const overlay = lb.isOpen
    ? createPortal(
        <div {...lb.getOverlayProps()}>
          <button {...lb.getCloseButtonProps()}>✕</button>
          {lb.hasPrev && <button {...lb.getPrevProps()}>‹</button>}
          {lb.currentItem && renderContent(lb.currentItem)}
          {lb.hasNext && <button {...lb.getNextProps()}>›</button>}
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      {triggers}
      {overlay}
    </>
  );
}
