'use client';

import { useState, useEffect } from 'react';
import { useApiUrl } from '@/lib/config/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { LoginSchema, LoginCredentials } from '@/lib/types/auth';
import { useAppDispatch } from '@/lib/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/lib/store/features/authSlice';
import { authService } from '@/lib/services/authService';
import { sessionService } from '@/lib/services/sessionService';
import { generateUUID } from '@/lib/utils/uuid';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/ui/submit-button';
import Link from 'next/link';

export default function LoginPage() {
  const API_URL = useApiUrl();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>({ appName: 'SONIDERO CHAT' });

  useEffect(() => {
    fetch(`${API_URL}/config`).then(res => res.json()).then(setConfig).catch(() => {});
  }, [API_URL]);

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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('/bg-sonidero.png')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      <Card className="w-full max-w-md relative z-10 border-primary/50 shadow-[0_0_30px_theme(colors.primary.DEFAULT)] bg-black/90 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl app-title">
            {config.appName}
          </CardTitle>
          <CardDescription className="text-gray-500 font-medium">
            Ingresa tu alias y contraseña para entrar a la cabina digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="alias" className="text-gray-300 font-semibold">Alias (Nickname)</Label>
              <Input 
                id="alias" 
                {...register('alias')} 
                className="bg-gray-900 border-gray-700 focus:border-secondary text-white"
                placeholder="Ej. ElBailador77"
              />
              {errors.alias && <p className="text-destructive text-xs">{errors.alias.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300 font-semibold">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                {...register('password')} 
                className="bg-gray-900 border-gray-700 focus:border-secondary text-white"
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
          <p className="text-sm text-gray-500 font-medium">
            ¿No tienes cuenta? <Link href="/register" className="text-primary/70 font-semibold hover:underline hover:text-primary transition-colors">Regístrate aquí</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
