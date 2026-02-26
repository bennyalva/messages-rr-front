'use client';

import ChatHeader from '@/components/chat/ChatHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Info } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
       <ChatHeader showBackButton />
       
       <div className="flex-1 flex items-center justify-center p-4">
         <Card className="w-full max-w-md bg-black/90 text-white border-primary relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 bg-primary/20 blur-[50px] rounded-full" />
              
              <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Info className="w-5 h-5 text-accent" /> Acerca de
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-center">
                  <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                      SISTEMA DE CHAT SONIDERO v1.0
                  </h2>
                  <p className="text-gray-400 text-sm">
                      Desarrollado para la banda sonidera de corazón.
                      Conecta, baila y disfruta del ambiente.
                  </p>
                  
                  <div className="mt-8 p-4 border border-white/10 rounded-lg bg-white/5">
                      <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Créditos</p>
                      <p className="font-mono text-sm">Creado con ❤️ y Next.js</p>
                  </div>

                  <p className="text-xs text-gray-600 mt-4">
                      © 2026 Sonidero Inc. Todos los derechos reservados.
                  </p>
              </CardContent>
         </Card>
       </div>
    </div>
  );
}
