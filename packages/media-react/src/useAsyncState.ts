import { useState, useCallback } from 'react';
import type { MediaError } from '@media-sdk/core';
import type { AsyncState } from './types';

// helper for handling loading and error states
export function useAsyncState<T>(initialData: T | null = null) {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<MediaError | null>(null);

  const execute = useCallback(
    async <R = T>(
      fn: () => Promise<{ ok: true; data: R } | { ok: false; error: MediaError }>,
      transform?: (result: R) => T,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn();
        if (result.ok) {
          const value = transform ? transform(result.data) : (result.data as unknown as T);
          setData(value);
        } else {
          setError(result.error);
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const state: AsyncState<T> = { data, loading, error };

  return { ...state, setData, setLoading, setError, execute };
}
