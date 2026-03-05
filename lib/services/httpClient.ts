import axios from 'axios';
import { sessionService } from './sessionService';
import { httpErrorEmitter } from './httpErrorEmitter';
import { HTTP, STORAGE_KEYS, ROUTES } from '@/lib/constants';

/**
 * Centralized axios instance for all API calls.
 * 
 * Features:
 * - Dynamic baseURL based on current hostname (LAN-friendly)
 * - Request interceptor: injects auth token automatically
 * - Response interceptor: centralizes error handling (401 → redirect to login)
 * - Global error emission for UI notifications
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

// ── Variables for Refresh Token Queue ────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: string) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// ── Response Interceptor ────────────────────────────────────────────
// Centralizes error handling for all responses
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const { status } = error.response;

      // Check if 401 Unauthorized and request hasn't been retried yet
      if (status === 401 && !originalRequest._retry) {
        
        if (isRefreshing) {
          try {
            // Queue the request until token refresh is finished
            const token = await new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            // Update the auth header with the new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return httpClient(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const currentSession = sessionService.getSession();
        
        if (!currentSession || !currentSession.refreshToken) {
           processQueue(new Error('No refresh token available'));
           isRefreshing = false;
           sessionService.clearSession();
           if (typeof window !== 'undefined') window.location.href = ROUTES.LOGIN;
           return Promise.reject(error);
        }

        try {
          // TODO: Replace this simulated endpoint to the real refresh token service endpoint once alive
          // E.g: const { data } = await axios.post(`${getBaseUrl()}/auth/refresh`, { refreshToken: currentSession.refreshToken });
          
          // --- SIMULATION ---
          // Simulating a successful token refresh logic... replace logic inside this block
          const newToken = `token_refreshed_${Date.now()}`;
          const newRefreshToken = `ref_new_${Date.now()}`;
          // ----- END SIMULATION -----

          // Save new credentials
          sessionService.saveSession(currentSession.user, newToken, newRefreshToken);
          
          processQueue(null, newToken);
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return httpClient(originalRequest);
          
        } catch (refreshError: any) {
          processQueue(refreshError, null);
          isRefreshing = false;
          // Session expired or refresh token invalid — redirect to login
          sessionService.clearSession();
          if (typeof window !== 'undefined') {
            window.location.href = ROUTES.LOGIN;
          }
          return Promise.reject(refreshError);
        }
      } else {
        // Emit error for global AlertModal display
        httpErrorEmitter.emit({
          status,
          message: error.response.data?.message || error.message,
          url: error.config?.url,
        });
      }
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      httpErrorEmitter.emit({
        status: 408,
        message: 'La solicitud tardó demasiado tiempo.',
        url: error.config?.url,
      });
    } else {
      // Network error (no response)
      httpErrorEmitter.emit({
        status: 0,
        message: 'No se pudo conectar con el servidor.',
        url: error.config?.url,
      });
    }

    return Promise.reject(error);
  }
);

export default httpClient;
