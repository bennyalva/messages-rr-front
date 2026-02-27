'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import ChatHeader from '@/components/chat/ChatHeader';
import { useAppSelector, useAppDispatch } from '@/lib/store/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateUser } from '@/lib/store/features/authSlice';
import { setTheme, ThemeName } from '@/lib/store/features/themeSlice';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

function ProfilePageContent() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const activeTheme = useAppSelector(state => state.theme.activeTheme);

  if (!user) return null;

  const handleSave = () => {
       // Dispatch update user (stub) or save to DB
       alert("Perfil guardado (Simulación)");
  };

  const handleThemeChange = (theme: ThemeName) => {
    dispatch(setTheme(theme));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
        <ChatHeader showBackButton />
        
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border/50 shadow-2xl shadow-black/20 dark:shadow-primary/20 bg-card text-foreground transition-all duration-300">
              <CardHeader>
                  <CardTitle>Mi Perfil Sonidero</CardTitle>
                  <div className="flex justify-center mb-4">
                      <div className="w-24 h-24 rounded-full border-4 border-secondary overflow-hidden bg-muted">
                          <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.alias}`} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                  </div>
                  <CardDescription className="text-center text-muted-foreground">
                      {user.alias}
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label>Alias</Label>
                      <Input defaultValue={user.alias} className="bg-muted border-border" />
                  </div>
                   <div className="space-y-2">
                      <Label>Pandilla</Label>
                      <Input defaultValue={user.gang || ''} placeholder="Sin pandilla" className="bg-muted border-border" />
                  </div>
                  
                   <div className="space-y-3">
                      <Label className="text-muted-foreground font-semibold text-xs uppercase tracking-wider">Tema de la App</Label>
                      <div className="flex gap-3">
                          <button 
                              onClick={() => handleThemeChange('standard')}
                              className={cn(
                                  "flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-300 relative",
                                  activeTheme === 'standard' 
                                      ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] text-primary" 
                                      : "bg-muted/30 border-border text-muted-foreground hover:border-border/80"
                              )}
                          >
                              <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-inner transition-transform duration-500",
                                  activeTheme === 'standard' ? "bg-primary text-primary-foreground scale-110 rotate-[360deg]" : "bg-muted"
                              )}>
                                  ☀️
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-tight">Estándar</span>
                              {activeTheme === 'standard' && <Check className="w-3 h-3 absolute top-1.5 right-1.5 animate-in zoom-in-50" />}
                          </button>

                           <button 
                              onClick={() => handleThemeChange('dark')}
                              className={cn(
                                  "flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-300 relative",
                                  activeTheme === 'dark' 
                                      ? "bg-primary/10 border-primary shadow-[0_0_15px_rgba(var(--primary),0.2)] text-primary" 
                                      : "bg-muted/30 border-border text-muted-foreground hover:border-border/80"
                              )}
                          >
                              <div className={cn(
                                  "w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-inner transition-transform duration-500",
                                  activeTheme === 'dark' ? "bg-primary text-primary-foreground scale-110 rotate-[360deg]" : "bg-muted"
                              )}>
                                  🌙
                              </div>
                              <span className="text-[10px] font-bold uppercase tracking-tight">Dark Mode</span>
                              {activeTheme === 'dark' && <Check className="w-3 h-3 absolute top-1.5 right-1.5 animate-in zoom-in-50" />}
                          </button>
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
