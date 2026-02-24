'use client';

import { useLayoutEffect, useEffect, useRef } from 'react';
import { sessionService } from '../services/sessionService';

/**
 * Critical hook for session validation on protected pages.
 * 
 * Uses useLayoutEffect to validate BEFORE visual render, preventing
 * cached pages from being visible even for a moment.
 * 
 * Also listens to visibility changes (when user swipes back/forward on mobile)
 * to revalidate the session when the page becomes visible again.
 */
export function useSessionValidator() {
  const hasRedirected = useRef(false);

  // Immediate redirect function - used for instant validation
  const redirectToLogin = () => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    
    // Use location.replace for hard navigation that doesn't pollute history
    window.location.replace('/login');
  };

  // useLayoutEffect runs synchronously BEFORE the browser paints
  // This ensures the user never sees protected content if session is invalid
  useLayoutEffect(() => {
    // Skip on server
    if (typeof window === 'undefined') return;

    // Validate session immediately
    const isValid = sessionService.isSessionValid();
    
    if (!isValid) {
      redirectToLogin();
    }
  }, []);

  // Also check on visibility change (mobile swipe navigation)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleVisibilityChange = () => {
      // When page becomes visible again (user navigated to it)
      if (document.visibilityState === 'visible') {
        const isValid = sessionService.isSessionValid();
        if (!isValid) {
          redirectToLogin();
        }
      }
    };

    // Also handle popstate for back/forward navigation
    const handlePopState = () => {
      const isValid = sessionService.isSessionValid();
      if (!isValid) {
        redirectToLogin();
      }
    };

    // Also handle pageshow for bfcache (back-forward cache)
    const handlePageShow = (event: PageTransitionEvent) => {
      // persisted = true means the page was restored from bfcache
      if (event.persisted) {
        const isValid = sessionService.isSessionValid();
        if (!isValid) {
          redirectToLogin();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  return {
    isValid: sessionService.isSessionValid(),
    redirectToLogin
  };
}
