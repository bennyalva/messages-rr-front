'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { hydrateAuth } from '@/lib/store/features/authSlice';
import { UserRole } from '@/lib/types/auth';
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
 * Handles session hydration from localStorage and role-based access control.
 * 
 * Role hierarchy:
 * - owner: All permissions (can access everything)
 * - admin: System management, users, messages, songs
 * - user: Chat, reactions, voting
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

  // Hydrate auth state from localStorage on mount
  useEffect(() => {
    if (!isHydrated) {
      dispatch(hydrateAuth());
    }
  }, [dispatch, isHydrated]);

  // Handle redirects after hydration
  useEffect(() => {
    if (!isHydrated) return;

    // Not authenticated -> redirect to login
    if (!isAuthenticated || !user) {
      router.replace(redirectTo);
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
  }, [isHydrated, isAuthenticated, user, allowedRoles, router, redirectTo, unauthorizedRedirect]);

  // Show loading while hydrating
  if (!isHydrated) {
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
