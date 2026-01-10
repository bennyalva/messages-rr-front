'use client';

import { useMemo } from 'react';

/**
 * Hook to get the API URL dynamically based on current hostname.
 * This allows devices on the local network to connect to json-server.
 */
export function useApiUrl() {
  return useMemo(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      return `http://${host}:3001`;
    }
    return 'http://localhost:3001';
  }, []);
}

/**
 * Get API URL - can be used outside React components
 * Call this at runtime (not at module load time) to get correct hostname
 */
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    return `http://${host}:3001`;
  }
  return 'http://localhost:3001';
}
