'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { RegisterSchema, RegisterData } from '@/lib/types/auth';
import { authService } from '@/lib/services/authService';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SubmitButton } from '@/components/ui/submit-button';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting, isValid } } = useForm<RegisterData>({
    resolver: zodResolver(RegisterSchema),
    mode: 'onChange',
    defaultValues: {
        musicTypes: [],
        avatar: '',
    }
  });

  const SONIDERO_AVATARS = [
      '/avatars/boy1.svg', '/avatars/girl1.svg', 
      '/avatars/boy2.svg', '/avatars/girl2.svg',
      '/avatars/skull.svg', '/avatars/mask.svg'
  ]; // We will use dicebear urls for now as placeholders if local files don't exist, or just use dicebear direct links

  const AVATAR_OPTIONS = [
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sonidero1",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Sonidero2",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=LaChingona",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=ElRey",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=Bailador",
    "https://api.dicebear.com/7.x/avataaars/svg?seed=DjMaster"
  ];

  const MUSIC_GENRES = [
      "Cumbia Sonidera", "Salsa", "Guaracha", "Weje Weje", "Cumbia Villera", "Tropical", "High Energy"
  ];

  const onSubmit = async (data: RegisterData) => {
    setError(null);
    try {
      await authService.register(data);
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || "Error al registrarse");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
        {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 via-black to-black" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px]" />

      <Card className="w-full max-w-md relative z-10 border-secondary/50 shadow-[0_0_30px_theme(colors.secondary.DEFAULT)] bg-black/90 text-white">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl app-title">
            NUEVO BAILADOR
          </CardTitle>
          <CardDescription className="text-gray-500 font-medium">
            Regístrate para entrar al ambiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                <Label htmlFor="name" className="text-primary">Nombre</Label>
                <Input id="name" {...register('name')} className="bg-gray-900 border-gray-700" />
                {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                <Label htmlFor="lastName" className="text-primary">Apellido</Label>
                <Input id="lastName" {...register('lastName')} className="bg-gray-900 border-gray-700" />
                </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alias" className="text-primary">Alias (Nickname)</Label>
              <Input id="alias" {...register('alias')} className="bg-gray-900 border-gray-700" placeholder="Como te dicen en el barrio" />
              {errors.alias && <p className="text-destructive text-xs">{errors.alias.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gang" className="text-primary">Pandilla (Opcional)</Label>
              <Input id="gang" {...register('gang')} className="bg-gray-900 border-gray-700" placeholder="Ej. Los Chicos Traviesos" />
            </div>

            <div className="space-y-2">
                <Label className="text-gray-300 font-semibold">Elige tu Avatar</Label>
                <div className="grid grid-cols-3 gap-2">
                    {AVATAR_OPTIONS.map((url, idx) => (
                        <div key={idx} className="relative cursor-pointer group">
                             <input 
                                type="radio" 
                                value={url} 
                                {...register('avatar')}
                                className="peer sr-only" 
                                id={`avatar-${idx}`}
                             />
                             <label 
                                htmlFor={`avatar-${idx}`}
                                className="block rounded-full border-2 border-transparent peer-checked:border-primary peer-checked:scale-110 transition-all hover:scale-105 overflow-hidden aspect-square"
                             >
                                 <img src={url} alt="Avatar" className="w-full h-full object-cover" />
                             </label>
                        </div>
                    ))}
                </div>
                {errors.avatar && <p className="text-destructive text-xs">{errors.avatar.message}</p>}
            </div>

            <div className="space-y-2">
                <Label className="text-gray-300 font-semibold">Lo que te mueve (Géneros)</Label>
                <div className="grid grid-cols-2 gap-2 bg-gray-900/50 p-2 rounded border border-gray-800">
                    {MUSIC_GENRES.map((genre) => (
                        <div key={genre} className="flex items-center space-x-2">
                            <input 
                                type="checkbox" 
                                value={genre} 
                                {...register('musicTypes')}
                                id={`genre-${genre}`} 
                                className="w-4 h-4 accent-primary"
                            />
                            <label htmlFor={`genre-${genre}`} className="text-sm text-gray-300 cursor-pointer select-none">
                                {genre}
                            </label>
                        </div>
                    ))}
                </div>
                {errors.musicTypes && <p className="text-destructive text-xs">{errors.musicTypes.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-primary">Contraseña</Label>
              <Input id="password" type="password" {...register('password')} className="bg-gray-900 border-gray-700" />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-primary">Confirmar Contraseña</Label>
              <Input id="confirmPassword" type="password" {...register('confirmPassword')} className="bg-gray-900 border-gray-700" />
              {errors.confirmPassword && <p className="text-destructive text-xs">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <div className="p-3 rounded-md bg-destructive/20 border border-destructive/50 text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <SubmitButton
              isFormValid={isValid}
              isSubmitting={isSubmitting}
              label="Registrarme"
              loadingLabel="Registrando..."
            />
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-400">
            ¿Ya tienes cuenta? <Link href="/login" className="text-primary hover:underline">Inicia Sesión</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
