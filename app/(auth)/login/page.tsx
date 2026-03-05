'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import httpClient from '@/lib/services/httpClient';
import { storageService } from '@/lib/utils/storage';
import { ENDPOINTS, ASSETS, STORAGE_KEYS, ROUTES, LOGIN_SECURITY } from '@/lib/constants';

const ERROR_DISPLAY_SECONDS = 8;
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
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const cooldownTimer = useRef<NodeJS.Timeout | null>(null);
  const errorDismissTimer = useRef<NodeJS.Timeout | null>(null);

  const isLockedOut = cooldownRemaining > 0;

  // Cooldown countdown timer
  const startCooldown = useCallback(() => {
    setCooldownRemaining(LOGIN_SECURITY.COOLDOWN_SECONDS);

    if (cooldownTimer.current) clearInterval(cooldownTimer.current);

    cooldownTimer.current = setInterval(() => {
      setCooldownRemaining(prev => {
        if (prev <= 1) {
          clearInterval(cooldownTimer.current!);
          cooldownTimer.current = null;
          setFailedAttempts(0);
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimer.current) clearInterval(cooldownTimer.current);
      if (errorDismissTimer.current) clearTimeout(errorDismissTimer.current);
    };
  }, []);

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

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isValid } } = useForm<LoginCredentials>({
    resolver: zodResolver(LoginSchema),
    mode: 'onChange',
  });

  // Clear error when user focuses an input to start typing
  const handleInputFocus = () => {
    if (error && !isLockedOut) {
      setError(null);
    }
  };

  // Auto-dismiss error after N seconds
  useEffect(() => {
    if (error && !isLockedOut) {
      if (errorDismissTimer.current) clearTimeout(errorDismissTimer.current);
      errorDismissTimer.current = setTimeout(() => {
        setError(null);
        errorDismissTimer.current = null;
      }, ERROR_DISPLAY_SECONDS * 1000);
    }
    return () => {
      if (errorDismissTimer.current) clearTimeout(errorDismissTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  // Set clean history state for login page
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Set clean state for login page
    window.history.replaceState({ page: 'login', clean: true }, '', ROUTES.LOGIN);
  }, []);

  const onSubmit = async (data: LoginCredentials) => {
    dispatch(loginStart());
    setError(null);
    try {
      const user = await authService.login(data);
      // Generate a simple token for session
      const token = `token_${generateUUID()}_${Date.now()}`;
      const refreshToken = `ref_token_${generateUUID()}_${Date.now()}`; // Mock
      
      // CRITICAL: Generate a new sessionId for this login
      // This invalidates any cached protected pages from previous sessions
      sessionService.generateSessionId();
      
      dispatch(loginSuccess({ user, token, refreshToken }));
      
      // Redirect based on role - use location.href to add to end of history
      // Then the new page will push its own state
      if (user.role === 'owner' || user.role === 'admin') {
        window.location.href = ROUTES.DASHBOARD;
      } else {
        window.location.href = ROUTES.CHAT;
      }
      
    } catch (err: any) {
      const msg = err.message || "Error al iniciar sesión";
      setError(msg);
      dispatch(loginFailure(msg));
      reset();

      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);

      if (newAttempts >= LOGIN_SECURITY.MAX_ATTEMPTS) {
        startCooldown();
        setError(`Demasiados intentos fallidos. Espera ${LOGIN_SECURITY.COOLDOWN_SECONDS} segundos.`);
      }
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
                onFocus={handleInputFocus}
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
                onFocus={handleInputFocus}
              />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/20 border border-destructive/50 text-destructive text-sm text-center">
                {isLockedOut
                  ? `Demasiados intentos. Inténtalo de nuevo en ${cooldownRemaining}s`
                  : error
                }
              </div>
            )}

            <SubmitButton
              isFormValid={isValid && !isLockedOut}
              isSubmitting={isSubmitting}
              label={isLockedOut ? `Espera ${cooldownRemaining}s` : 'Entrar'}
              loadingLabel="Entrando..."
            />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground font-medium">
            ¿No tienes cuenta? <Link href={ROUTES.REGISTER} className="text-primary font-bold underline underline-offset-4 hover:text-primary/80 transition-colors">Regístrate aquí</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
