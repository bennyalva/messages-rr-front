'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import ChatHeader from '@/components/chat/ChatHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

function AboutPageContent() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
       <ChatHeader showBackButton />
       
       <div className="flex-1 flex items-center justify-center p-4">
         <Card className="w-full max-w-md bg-card border-border/50 shadow-2xl shadow-black/20 dark:shadow-primary/20 relative overflow-hidden transition-all duration-300">
              <div className="absolute top-0 right-0 p-10 bg-primary/10 blur-[50px] rounded-full" />
              
              <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                      <Info className="w-5 h-5 text-primary" /> Acerca de
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-center">
                  <h2 className="text-2xl font-black app-title tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                      SISTEMA DE CHAT SONIDERO v1.0
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                      Desarrollado para la banda sonidera de corazón.
                      Conecta, baila y disfruta del ambiente.
                  </p>
                  
                  <div className="mt-8 p-5 border border-border rounded-2xl bg-muted/50 shadow-inner">
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] mb-2 opacity-70">Créditos</p>
                      <p className="font-mono text-sm font-bold text-foreground">Creado con ❤️ y Next.js</p>
                  </div>

                  <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider mt-4">
                      © 2026 Sonidero Inc. Todos los derechos reservados.
                  </p>
              </CardContent>
         </Card>
       </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <AuthGuard>
      <AboutPageContent />
    </AuthGuard>
  );
}
