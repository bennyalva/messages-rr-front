import axios from 'axios';
import { sessionService } from './sessionService';
import { HTTP } from '@/lib/constants';

/**
 * Centralized axios instance for all API calls.
 * 
 * Features:
 * - Dynamic baseURL based on current hostname (LAN-friendly)
 * - Request interceptor: injects auth token automatically
 * - Response interceptor: centralizes error handling (401 → redirect to login)
 * - Default timeout: 10 seconds
 * - Default Content-Type: application/json
 */

function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:${HTTP.API_PORT}`;
  }
  return `http://localhost:${HTTP.API_PORT}`;
}

const httpClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: HTTP.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor ─────────────────────────────────────────────
// Injects the auth token on every outgoing request
httpClient.interceptors.request.use(
  (config) => {
    const token = sessionService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────────────────────────
// Centralizes error handling for all responses
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;

      if (status === 401) {
        // Session expired or invalid — redirect to login
        sessionService.clearSession();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
