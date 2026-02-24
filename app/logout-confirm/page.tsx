'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { logout } from '@/lib/store/features/authSlice';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';

function LogoutConfirmContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector(state => state.auth);

  // Redirect destination based on user role
  const getDashboardPath = () => {
    if (user?.role === 'owner' || user?.role === 'admin') {
      return '/dashboard';
    }
    return '/chat';
  };

  // Get button text based on user role
  const getCancelButtonText = () => {
    // Debug: log the user role
    console.log('User in logout-confirm:', user);
    console.log('User role:', user?.role);
    
    if (user?.role === 'owner' || user?.role === 'admin') {
      console.log('Returning: No, volver al dashboard');
      return 'No, volver al dashboard';
    }
    console.log('Returning: No, volver al chat');
    return 'No, volver al chat';
  };

  const handleConfirmLogout = () => {
    // dispatch(logout) calls sessionService.clearSession() which invalidates sessionId
    dispatch(logout());
    
    // Hard navigation to login - use location.href to go to END of history
    // Using href instead of replace so forward navigation is cleaner
    window.location.href = '/login';
  };

  const handleCancel = () => {
    // Clean history and go back to dashboard
    const dashboardPath = getDashboardPath();
    window.history.replaceState(null, '', dashboardPath);
    router.replace(dashboardPath);
  };

  // Aggressive history trap to prevent back button bypass
  useEffect(() => {
    // Step 1: Replace current entry to "clean" the stack
    window.history.replaceState({ page: 'logout-confirm' }, '', '/logout-confirm');
    
    // Step 2: Push a second entry so we can detect back button
    window.history.pushState({ page: 'logout-trap' }, '', '/logout-confirm');
    
    const handlePopState = (event: PopStateEvent) => {
      // User tried to go back - immediately push them forward again
      window.history.pushState({ page: 'logout-trap' }, '', '/logout-confirm');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-orange-500/10 rounded-full blur-[120px]" />
      
      <Card className="w-full max-w-md relative z-10 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)] bg-black/90 text-white">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-400">
            ¿Cerrar sesión?
          </CardTitle>
          <CardDescription className="text-gray-300 text-base">
            Estás a punto de salir de <span className="text-primary font-semibold">Sonidero Chat</span>. 
            Tu sesión actual se cerrará y tendrás que volver a iniciar sesión para acceder.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {user && (
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.alias}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">{user.alias}</p>
                <p className="text-xs text-gray-400">Sesión activa</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <Button 
              onClick={handleConfirmLogout}
              variant="destructive"
              className="w-full font-bold text-lg py-6"
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sí, cerrar sesión
            </Button>
            
            <Button 
              onClick={handleCancel}
              variant="outline"
              className="w-full font-medium py-6 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              {getCancelButtonText()}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LogoutConfirmPage() {
  return (
    <AuthGuard>
      <LogoutConfirmContent />
    </AuthGuard>
  );
}
