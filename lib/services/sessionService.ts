import { User } from '../types/auth';
import { generateUUID } from '../utils/uuid';

const SESSION_KEY = 'sonidero_session';
const TOKEN_KEY = 'sonidero_token';

export interface SessionData {
  user: User;
  token: string;
  expiresAt: number; // timestamp
}

// Session duration: 7 days
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;

export const sessionService = {
  /**
   * Save user session to localStorage
   */
  saveSession(user: User, token: string): void {
    const sessionData: SessionData = {
      user,
      token,
      expiresAt: Date.now() + SESSION_DURATION,
    };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      localStorage.setItem(TOKEN_KEY, token);
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
   * Clear session (logout)
   */
  clearSession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(TOKEN_KEY);
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
