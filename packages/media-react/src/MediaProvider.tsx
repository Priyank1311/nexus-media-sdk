import React, { useMemo } from 'react';
import { createMediaClient } from '@media-sdk/core';
import { MediaContext } from './context';
import type { MediaProviderProps } from './types';

// context provider component for media client
export function MediaProvider({
  apiKey,
  baseUrl,
  children,
}: MediaProviderProps): React.JSX.Element {
  const client = useMemo(
    () => createMediaClient({ apiKey, baseUrl }),
    [apiKey, baseUrl],
  );

  return (
    <MediaContext.Provider value={client}>
      {children}
    </MediaContext.Provider>
  );
}
