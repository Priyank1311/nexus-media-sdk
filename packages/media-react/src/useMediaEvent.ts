import { useEffect, useRef } from 'react';
import type { MediaEventName, MediaEventHandler } from '@media-sdk/core';
import { useMediaClient } from './context';

// subscribe to SDK events from components
export function useMediaEvent<E extends MediaEventName>(
  event: E,
  handler: MediaEventHandler<E>,
): void {
  const client = useMediaClient();

  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const stableHandler: MediaEventHandler<E> = (payload) => {
      handlerRef.current(payload);
    };

    const unsubscribe = client.emitter.subscribe(event, stableHandler);
    return unsubscribe;
  }, [event, client]);
}
