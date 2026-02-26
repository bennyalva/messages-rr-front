'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import ChatHeader from '@/components/chat/ChatHeader';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { updateUser } from '@/lib/store/features/authSlice';

function ProfilePageContent() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const [theme, setTheme] = useState<'default' | 'dark'>('dark');

  if (!user) return null;

  const handleSave = () => {
       // Dispatch update user (stub) or save to DB
       alert("Perfil guardado (Simulación)");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
        <ChatHeader showBackButton />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-primary/50 shadow-[0_0_20px_theme(colors.primary.DEFAULT)] bg-black/90 text-white">
              <CardHeader>
                  <CardTitle>Mi Perfil Sonidero</CardTitle>
                  <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 rounded-full border-4 border-secondary overflow-hidden bg-gray-800">
                          <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.alias}`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                  </div>
                  <CardDescription className="text-center text-gray-400">
                      {user.alias}
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label>Alias</Label>
                      <Input defaultValue={user.alias} className="bg-gray-900 border-gray-700" />
                  </div>
                   <div className="space-y-2">
                      <Label>Pandilla</Label>
                      <Input defaultValue={user.gang || ''} placeholder="Sin pandilla" className="bg-gray-900 border-gray-700" />
                  </div>
                  
                   <div className="space-y-2">
                      <Label>Tema de la App</Label>
                      <div className="flex gap-2">
                          <Button 
                              variant={theme === 'default' ? 'default' : 'outline'} 
                              onClick={() => setTheme('default')}
                              className="flex-1"
                          >
                              Estándar
                          </Button>
                           <Button 
                              variant={theme === 'dark' ? 'secondary' : 'outline'} 
                              onClick={() => setTheme('dark')}
                              className="flex-1"
                          >
                              Dark Mode
                          </Button>
                      </div>
                  </div>

                  <Button className="w-full mt-4" variant="default" onClick={handleSave}>
                      Guardar Cambios
                  </Button>
              </CardContent>
          </Card>
        </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfilePageContent />
    </AuthGuard>
  );
}
