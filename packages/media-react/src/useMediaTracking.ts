import { useCallback } from 'react';
import { useMediaClient } from './context';

// analytics tracking actions
export function useMediaTracking() {
  const client = useMediaClient();

  const trackView = useCallback(
    (itemId: number | string) => client.trackView(itemId),
    [client],
  );

  const trackDownload = useCallback(
    (itemId: number | string) => client.trackDownload(itemId),
    [client],
  );

  return { trackView, trackDownload };
}
