'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import ChatHeader from '@/components/chat/ChatHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Headphones, Link as LinkIcon, Instagram, Facebook, Globe, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { useEffect, useState } from 'react';
import { storageService } from '@/lib/utils/storage';



function AboutPageContent() {
    const [config, setConfig] = useState<any>({ appName: 'Cargando...', logoUrl: null });

    
      useEffect(() => {
        const stored = storageService.getItem('config');
        if (stored) {
          setConfig(stored);
        }
      }, []);
      
  return (
    <div className="min-h-screen bg-background flex flex-col">
       <ChatHeader showBackButton />
       
       <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 relative">
         
         {/* Profile Card Proposal 2 */}
         <Card className="bg-card border-none shadow-2xl shadow-black/10 dark:shadow-primary/5 relative flex flex-col rounded-3xl">
            
            {/* Unified Cover Banner Area with Sequential Stack Layout (No Title Overlap) */}
            <div className="w-full flex flex-col relative">
               
               {/* 1. Header Section (Solid Background) containing Logo */}
               <div className="w-full flex flex-col items-center px-6 z-10 bg-card">
                   
                   {/* Logo spanning full width organically - No extra top padding */}
                   <div className="w-full flex justify-center mt-[-4rem] md:mt-[-6rem]">
                       <AnimatedLogo 
                           logoUrl={config.logoUrl} 
                           className="w-full max-w-[20rem] md:max-w-[28rem] lg:max-w-[32rem] aspect-square" 
                           imageClassName="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)] scale-110"
                           glowClassName="bg-primary/40 blur-3xl rounded-[100%] scale-150 opacity-80"
                       />
                   </div>
               </div>

               {/* 2. Background Image Section - Starts cleanly AFTER the logo */}
               <div className="w-full h-[28rem] md:h-[36rem] relative flex flex-col items-center -mt-8 bg-card border-t border-card z-0">
                   {/* Background image constrained to this natural flow block */}
                   <div className="absolute inset-0 top-8 bg-[url('/sonidero-about-bg.png')] bg-cover bg-[center_10%] md:bg-[center_12%] opacity-90 dark:opacity-80 transition-opacity duration-300" />
                   
                   {/* Gradient blending top card solid color into the image smoothly (adjusted for overlap) */}
                   <div className="absolute inset-x-0 top-8 h-32 bg-gradient-to-b from-card via-card/80 to-transparent pointer-events-none" />
                   
                   {/* Gradient blending bottom to card color for smooth transition to content */}
                   <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-card via-card/50 to-transparent pointer-events-none" />

                   {/* Main Title Overlay at the START of the image, clearing the 2rem (-mt-8) overlap */}
                   <div className="text-center mt-12 md:mt-16 relative z-20 px-6">
                       <h1 className="text-primary font-black tracking-widest uppercase text-3xl md:text-5xl flex items-center justify-center gap-3 drop-shadow-2xl shadow-black/80">
                           <Headphones className="w-8 h-8 md:w-12 md:h-12" /> Bochis Mix
                       </h1>
                   </div>
               </div>
               
            </div>

            {/* Wrapping CardContent in overflow-hidden to preserve bottom corner rounding */}
            <div className="overflow-hidden rounded-b-3xl">
                <CardContent className="relative px-6 pb-10 pt-4 flex flex-col items-center flex-1 bg-card">
                
                {/* Content Split: History & Socials */}
                <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: History */}
                    <div className="md:col-span-8 space-y-4 text-left">
                        <h2 className="text-lg font-bold text-foreground border-b border-border/50 pb-2">
                            Nuestra Historia
                        </h2>
                        <p className="text-muted-foreground leading-relaxed text-[15px] font-medium text-justify">
                            Fundado en el corazón del barrio, Sonido Super Loco nació con la única misión de llevar el mejor ritmo y sabor a cada celebración. Con más de una década de trayectoria haciendo vibrar las pistas de baile, hemos logrado la fusión perfecta entre la rica tradición sonidera y la tecnología más avanzada del momento. ¡Cada evento es una fiesta garantizada de puro sabor y sentimiento!
                        </p>
                    </div>

                    {/* Right Column: Contact Links */}
                    <div className="md:col-span-4 space-y-4">
                        <h2 className="text-lg font-bold text-foreground border-b border-border/50 pb-2">
                            Conecta
                        </h2>
                        <div className="flex flex-col gap-3">
                            <a href="#" className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-primary/10 hover:text-primary border border-border/50 hover:border-primary/30 transition-all font-semibold">
                                <Facebook className="w-5 h-5" /> Facebook
                            </a>
                            <a href="#" className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-secondary/10 hover:text-secondary border border-border/50 hover:border-secondary/30 transition-all font-semibold">
                                <Instagram className="w-5 h-5" /> Instagram
                            </a>
                            <a href="#" className="flex items-center justify-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-green-500/10 hover:text-green-500 border border-border/50 hover:border-green-500/30 transition-all font-semibold">
                                <MessageCircle className="w-5 h-5" /> WhatsApp
                            </a>
                        </div>
                    </div>

                </div>
            </CardContent>
            </div>
         </Card>

         {/* Footer */}
         <footer className="mt-8 mb-4 flex flex-col items-center justify-center gap-2 text-center opacity-80 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-foreground/80 mb-1">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold tracking-wide">www.cabina-digital.mx</span>
            </div>
            <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-[0.2em]">
                Todos los derechos reservados © 2026
            </p>
         </footer>
         
       </main>
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
