import { User } from '../types/auth';
import { generateUUID } from '../utils/uuid';

const SESSION_KEY = 'sonidero_session';
const TOKEN_KEY = 'sonidero_token';
const AUTH_COOKIE_NAME = 'sonidero_auth';

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
   * Clear session (logout) - clears both localStorage AND cookie
   */
  clearSession(): void {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
      
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
