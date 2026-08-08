import type {
  MediaEmitter,
  MediaEventMap,
  MediaEventName,
  MediaEventHandler,
} from './types';

// simple pub sub event listener setup
export function createEmitter(): {
  emitter: MediaEmitter;
  unsubscribeDefault: () => void;
} {
  // stores active listeners by event name
  const listeners = new Map<
    MediaEventName,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Set<MediaEventHandler<any>>
  >();

  // subscribe callback
  function subscribe<E extends MediaEventName>(
    event: E,
    handler: MediaEventHandler<E>,
  ): () => void {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    const set = listeners.get(event)!;
    set.add(handler);

    let removed = false;
    return () => {
      if (removed) return;
      removed = true;
      set.delete(handler);
    };
  }

  // trigger event for all listeners
  function emit<E extends MediaEventName>(
    event: E,
    payload: MediaEventMap[E],
  ): void {
    const set = listeners.get(event);
    if (!set) return;
    for (const handler of set) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    }
  }

  const emitter: MediaEmitter = { subscribe, emit };

  // default logger listener
  const defaultHandler = <E extends MediaEventName>(event: E) => {
    return (payload: MediaEventMap[E]) => {
      const ts = new Date(payload.timestamp).toISOString();
      console.log(`[Media Event] ${event} - item ${payload.itemId} at ${ts}`);
    };
  };

  const unsubView = emitter.subscribe('view', defaultHandler('view'));
  const unsubDownload = emitter.subscribe('download', defaultHandler('download'));

  const unsubscribeDefault = () => {
    unsubView();
    unsubDownload();
  };

  return { emitter, unsubscribeDefault };
}
