import { createContext, useContext } from 'react';
import type { MediaClient } from '@media-sdk/core';

// internal context for client
export const MediaContext = createContext<MediaClient | null>(null);

// custom hook to access media client
export function useMediaClient(): MediaClient {
  const client = useContext(MediaContext);
  if (!client) {
    throw new Error('useMediaClient must be used inside a MediaProvider');
  }
  return client;
}
