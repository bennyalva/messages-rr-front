import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to guard navigation from protected pages.
 * Intercepts back button navigation and redirects to logout-confirm
 * WITHOUT creating extra sentinel states that cause multiple back presses.
 * 
 * @param pageName - Name of the protected page for history state tracking
 */
export function useNavigationGuard(pageName: string) {
  const router = useRouter();

  useEffect(() => {
    // Set clean history state for this protected page
    // NO pushState - solo replace para evitar entradas duplicadas
    window.history.replaceState(
      { page: pageName, protected: true, timestamp: Date.now() }, 
      '', 
      window.location.pathname
    );
    
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state;
      
      // Si vamos a un estado no protegido (login, registro, o null)
      if (!state || !state.protected) {
        // Interceptar y mostrar logout-confirm
        // Usar replaceState en vez de pushState para NO acumular entradas en el historial
        // Esto previene el problema de múltiples pantallas de login
        window.history.replaceState(
          { page: pageName, protected: true, timestamp: Date.now() }, 
          '', 
          window.location.pathname
        );
        
        // Luego navegar a logout-confirm
        router.replace('/logout-confirm');
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [pageName, router]);
}
