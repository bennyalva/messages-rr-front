'use client';

import { useEffect, useLayoutEffect, ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { hydrateAuth } from '@/lib/store/features/authSlice';
import { UserRole } from '@/lib/types/auth';
import { sessionService } from '@/lib/services/sessionService';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: ReactNode;
  /** Roles allowed to access this page. If empty, any authenticated user can access. */
  allowedRoles?: UserRole[];
  /** Redirect path when not authenticated. Default: /login */
  redirectTo?: string;
  /** Redirect path when authenticated but not authorized (wrong role). Default: /chat */
  unauthorizedRedirect?: string;
}

/**
 * AuthGuard component that protects routes requiring authentication.
 * 
 * CRITICAL: Uses useLayoutEffect for session validation BEFORE render.
 * This prevents cached pages from being visible even for a moment
 * when the user navigates back/forward after logout.
 */
export default function AuthGuard({ 
  children, 
  allowedRoles = [],
  redirectTo = '/login',
  unauthorizedRedirect = '/chat'
}: AuthGuardProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isHydrated } = useAppSelector(state => state.auth);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // CRITICAL: useLayoutEffect runs synchronously BEFORE browser paint
  // This is the key to preventing cached pages from being visible
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    // Immediate session validation using sessionStorage ID
    const isValid = sessionService.isSessionValid();
    
    if (!isValid) {
      // Session is invalid - redirect immediately
      setShouldRedirect(true);
      window.location.replace('/login');
      return;
    }
    
    setIsSessionChecked(true);
  }, []);

  // Listen for visibility changes, popstate, and pageshow (bfcache)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const validateAndRedirect = () => {
      const isValid = sessionService.isSessionValid();
      if (!isValid) {
        window.location.replace('/login');
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        validateAndRedirect();
      }
    };

    const handlePopState = () => {
      validateAndRedirect();
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      // persisted = true means page was restored from bfcache
      if (event.persisted) {
        validateAndRedirect();
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

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    if (!isHydrated) {
      dispatch(hydrateAuth());
    }
  }, [dispatch, isHydrated]);

  // Handle role-based redirects after hydration
  useEffect(() => {
    if (!isHydrated || shouldRedirect) return;

    // Not authenticated -> redirect to login
    if (!isAuthenticated || !user) {
      window.location.replace(redirectTo);
      return;
    }

    // Check role-based access (if roles specified)
    if (allowedRoles.length > 0) {
      const userRole = user.role;
      
      // Owner can access everything
      if (userRole === 'owner') return;
      
      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        router.replace(unauthorizedRedirect);
        return;
      }
    }
  }, [isHydrated, isAuthenticated, user, allowedRoles, router, redirectTo, unauthorizedRedirect, shouldRedirect]);

  // If we're redirecting, show nothing
  if (shouldRedirect) {
    return null;
  }

  // Show loading while checking session or hydrating
  if (!isSessionChecked || !isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-gray-400 text-sm animate-pulse">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or not authorized - show nothing (redirect will happen)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Check authorization for role-restricted pages
  if (allowedRoles.length > 0 && user.role !== 'owner' && !allowedRoles.includes(user.role)) {
    return null;
  }

  // Authenticated and authorized - render children
  return <>{children}</>;
}

