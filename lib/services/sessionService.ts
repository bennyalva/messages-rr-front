import { User } from '../types/auth';
import { generateUUID } from '../utils/uuid';

import { STORAGE_KEYS } from '../constants';

const SESSION_KEY = STORAGE_KEYS.SESSION;
const TOKEN_KEY = STORAGE_KEYS.TOKEN;
const AUTH_COOKIE_NAME = STORAGE_KEYS.AUTH_COOKIE;
const SESSION_ID_KEY = STORAGE_KEYS.SESSION_ID; // Unique ID per login session

export interface SessionData {
  user: User;
  token: string;
  expiresAt: number; // timestamp
}

// Session duration: 7 days
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
const SESSION_DURATION_DAYS = 7;

export const sessionService = {
  /**
   * Generate a new unique session ID for this login
   * This is used to invalidate cached pages after logout
   */
  generateSessionId(): string {
    const sessionId = `sid_${generateUUID()}_${Date.now()}`;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  },

  /**
   * Get the current session ID
   */
  getSessionId(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(SESSION_ID_KEY);
  },

  /**
   * Validate if the current session ID exists and is valid
   * This is called by protected pages to check if user is still logged in
   */
  isSessionValid(): boolean {
    if (typeof window === 'undefined') return false;
    
    const sessionId = sessionStorage.getItem(SESSION_ID_KEY);
    const session = this.getSession();
    
    // If we have a valid session in localStorage but no sessionId (e.g. mobile refresh), recover it
    if (!sessionId && session) {
      this.generateSessionId();
      return true;
    }
    
    // Both must exist for a valid session
    return !!(sessionId && session);
  },

  /**
   * Invalidate the session ID (called on logout)
   * This makes all cached pages invalid
   */
  invalidateSessionId(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_ID_KEY);
    }
  },

  /**
   * Save user session to localStorage AND cookie (for middleware)
   */
  saveSession(user: User, token: string): void {
    const sessionData: SessionData = {
      user,
      token,
      expiresAt: Date.now() + SESSION_DURATION,
    };
    
    if (typeof window !== 'undefined') {
      // Save to localStorage (for client-side hydration)
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      localStorage.setItem(TOKEN_KEY, token);
      
      // Save to cookie (for middleware server-side checks)
      const expires = new Date(Date.now() + SESSION_DURATION);
      document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    }
  },

  /**
   * Get session from localStorage (if valid)
   */
  getSession(): SessionData | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (!stored) return null;
      
      const sessionData: SessionData = JSON.parse(stored);
      
      // Check if session expired
      if (Date.now() > sessionData.expiresAt) {
        this.clearSession();
        return null;
      }
      
      return sessionData;
    } catch {
      this.clearSession();
      return null;
    }
  },

  /**
   * Get current token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Clear session (logout) - clears localStorage, cookie, AND session ID
   */
  clearSession(): void {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
      
      // Clear session ID (this invalidates all cached pages!)
      this.invalidateSessionId();
      
      // Clear cookie by setting expired date
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    }
  },

  /**
   * Refresh session (extend expiration)
   */
  refreshSession(): void {
    const session = this.getSession();
    if (session) {
      this.saveSession(session.user, session.token);
    }
  },

  /**
   * Generate a simple token (in production, use JWT from server)
   */
  generateToken(): string {
    return `token_${generateUUID()}_${Date.now()}`;
  }
};
