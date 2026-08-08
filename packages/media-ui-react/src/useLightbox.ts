import { useState, useCallback, useRef, useEffect } from 'react';
import { mergeProps } from './mergeProps';
import type {
  MediaItem,
  UseLightboxOptions,
  UseLightboxReturn,
  UserProps,
} from './types';

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

// lightbox state and accessibility hook
export function useLightbox<T extends MediaItem>(
  options: UseLightboxOptions<T>,
): UseLightboxReturn<T> {
  const { items, onClose } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const triggerRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLElement | null>(null);

  const currentItem = isOpen ? (items[currentIndex] ?? null) : null;
  const hasNext = currentIndex < items.length - 1;
  const hasPrev = currentIndex > 0;

  const open = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, items.length - 1)));
      setIsOpen(true);
    },
    [items.length],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, [onClose]);

  const next = useCallback(() => {
    if (hasNext) setCurrentIndex((i) => i + 1);
  }, [hasNext]);

  const prev = useCallback(() => {
    if (hasPrev) setCurrentIndex((i) => i - 1);
  }, [hasPrev]);

  // keyboard event handlers and focus trapping
  useEffect(() => {
    if (!isOpen) return;

    requestAnimationFrame(() => {
      overlayRef.current?.focus();
    });

    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          close();
          break;
        case 'ArrowRight':
          e.preventDefault();
          next();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prev();
          break;
        case 'Tab': {
          const overlay = overlayRef.current;
          if (!overlay) return;

          const focusable = Array.from(
            overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
          );
          if (focusable.length === 0) {
            e.preventDefault();
            return;
          }

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
          break;
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close, next, prev]);

  // prop getters
  const getOverlayProps = useCallback(
    (userProps?: UserProps) =>
      mergeProps(
        {
          ref: (node: HTMLElement | null) => {
            overlayRef.current = node;
          },
          role: 'dialog',
          'aria-modal': true,
          'aria-label': 'Media lightbox',
          tabIndex: -1,
        },
        userProps,
      ),
    [],
  );

  const getCloseButtonProps = useCallback(
    (userProps?: UserProps) =>
      mergeProps(
        {
          type: 'button',
          'aria-label': 'Close lightbox',
          onClick: close,
        },
        userProps,
      ),
    [close],
  );

  const getNextProps = useCallback(
    (userProps?: UserProps) =>
      mergeProps(
        {
          type: 'button',
          'aria-label': 'Next item',
          disabled: !hasNext,
          onClick: next,
        },
        userProps,
      ),
    [hasNext, next],
  );

  const getPrevProps = useCallback(
    (userProps?: UserProps) =>
      mergeProps(
        {
          type: 'button',
          'aria-label': 'Previous item',
          disabled: !hasPrev,
          onClick: prev,
        },
        userProps,
      ),
    [hasPrev, prev],
  );

  const getTriggerProps = useCallback(
    (index: number, userProps?: UserProps) =>
      mergeProps(
        {
          role: 'button',
          tabIndex: 0,
          'aria-haspopup': 'dialog',
          onClick: () => {
            triggerRef.current = document.activeElement as HTMLElement;
            open(index);
          },
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              triggerRef.current = e.currentTarget as HTMLElement;
              open(index);
            }
          },
        },
        userProps,
      ),
    [open],
  );

  return {
    isOpen,
    currentItem,
    currentIndex,
    open,
    close,
    next,
    prev,
    hasNext,
    hasPrev,
    getOverlayProps,
    getCloseButtonProps,
    getNextProps,
    getPrevProps,
    getTriggerProps,
  };
}
