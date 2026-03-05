'use client';

import { useState, useEffect } from 'react';
import httpClient from '@/lib/services/httpClient';
import { storageService } from '@/lib/utils/storage';
import { ENDPOINTS, ASSETS, STORAGE_KEYS } from '@/lib/constants';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { LoginSchema, LoginCredentials } from '@/lib/types/auth';
import { useAppDispatch } from '@/lib/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/lib/store/features/authSlice';
import { setThemeConfig, setTheme, ThemeName } from '@/lib/store/features/themeSlice';
import { authService } from '@/lib/services/authService';
import { sessionService } from '@/lib/services/sessionService';
import { generateUUID } from '@/lib/utils/uuid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/ui/submit-button';
import { LoadingScreen } from '@/components/ui/loading-screen';
import Link from 'next/link';

interface AppConfig {
  appName: string;
  logoUrl?: string;
  defaultTheme?: string;
  themes?: any;
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AppConfig>({ appName: 'SONIDERO CHAT' });
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  useEffect(() => {
    // Try localStorage first (instant), then fetch fresh from API
    const stored = storageService.getItem(STORAGE_KEYS.CONFIG) as AppConfig;
    if (stored) {
      setConfig(stored);
      // Apply theme from stored config
      if (stored.themes) {
        dispatch(setThemeConfig(stored.themes));
      }
    }

    httpClient.get(ENDPOINTS.CONFIG)
      .then(({ data }) => {
        const dataConfig = data as AppConfig;
        setConfig(dataConfig);
        storageService.setItem(STORAGE_KEYS.CONFIG, dataConfig);
        // Dispatch theme config to store
        if (dataConfig.themes) {
          dispatch(setThemeConfig(dataConfig.themes));
        }
        // Apply default theme if user hasn't chosen one
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
        if (!savedTheme && dataConfig.defaultTheme) {
          dispatch(setTheme(dataConfig.defaultTheme as ThemeName));
        }
        setIsLoadingConfig(false);
      })
      .catch(() => {
        setIsLoadingConfig(false);
      });
  }, [dispatch]);

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<LoginCredentials>({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
  });

  // Set clean history state for login page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Set clean state for login page
    window.history.replaceState({ page: 'login', clean: true }, '', '/login');
  }, []);

  const onSubmit = async (data: LoginCredentials) => {
    dispatch(loginStart());
    setError(null);
    try {
      const user = await authService.login(data);
      // Generate a simple token for session
      const token = `token_${generateUUID()}_${Date.now()}`;
      
      // CRITICAL: Generate a new sessionId for this login
      // This invalidates any cached protected pages from previous sessions
      sessionService.generateSessionId();
      
      dispatch(loginSuccess({ user, token }));
      
      // Redirect based on role - use location.href to add to end of history
      // Then the new page will push its own state
      if (user.role === 'owner' || user.role === 'admin') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/chat';
      }
      
    } catch (err: any) {
      const msg = err.message || "Error al iniciar sesión";
      setError(msg);
      dispatch(loginFailure(msg));
    }
  };

  if (isLoadingConfig) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center relative overflow-hidden transition-colors duration-500" style={{ backgroundImage: `url('${ASSETS.BG_SONIDERO}')` }}>
      <div className="absolute inset-0 bg-background/60 dark:bg-background/85 backdrop-blur-[2px] pointer-events-none transition-colors duration-500" />
      
      <Card className="w-full max-w-md relative z-10 border-border/50 shadow-[0_20px_70px_-10px_rgba(0,0,0,0.25)] dark:shadow-[0_0_40px_-5px_var(--color-primary)]/30 bg-card text-card-foreground transition-all duration-300">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl app-title">
            {config.appName}
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            Ingresa tu alias y contraseña para entrar a la cabina digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alias" className="text-foreground font-semibold">Alias (Nickname)</Label>
              <Input 
                id="alias" 
                {...register('alias')} 
                className="bg-muted border-input focus:border-secondary text-foreground"
                placeholder="Ej. ElBailador77"
              />
              {errors.alias && <p className="text-destructive text-xs">{errors.alias.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-semibold">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                {...register('password')} 
                className="bg-muted border-input focus:border-secondary text-foreground"
              />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/20 border border-destructive/50 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <SubmitButton
              isFormValid={isValid}
              isSubmitting={isSubmitting}
              label="Entrar"
              loadingLabel="Entrando..."
            />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground font-medium">
            ¿No tienes cuenta? <Link href="/register" className="text-primary/70 font-semibold hover:underline hover:text-primary transition-colors">Regístrate aquí</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
