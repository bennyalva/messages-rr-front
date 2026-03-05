'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { storageService } from '@/lib/utils/storage';
import { cn } from '@/lib/utils';
import { Disc } from 'lucide-react';
import { AnimatedLogo } from '@/components/ui/animated-logo';
import { ASSETS, BRAND, STORAGE_KEYS } from '@/lib/constants';

interface AppConfig {
  appName: string;
  logoUrl?: string;
  // ... other config fields not needed here
}

export function LoadingScreen() {
  const pathname = usePathname();
  const [config, setConfig] = useState<AppConfig>({ appName: 'SONIDERO CHAT' });

  useEffect(() => {
    // Try localStorage for instant config
    const stored = storageService.getItem(STORAGE_KEYS.CONFIG) as AppConfig;
    if (stored) {
      setConfig(stored);
    }
  }, []);

  const isLoginPage = pathname === '/login';
  
  // Rule 2 & 4: Dynamic text and logo based on route
  const text = isLoginPage ? `Cargando ${BRAND.APP_NAME}...` : "Cargando...";
  // As requested, login uses the specific local asset, others use base config.logoUrl
  const logoSource = isLoginPage ? ASSETS.LOGO_CABINA : config.logoUrl;

  return (
    // Rule 1: Theme aware background (bg-background instead of hardcoded bg-black)
    <div className="min-h-screen flex items-center justify-center bg-background absolute inset-0 z-[100]">
      <div className="flex flex-col items-center gap-8">
        
        {/* Rule 5: Container with glassmorphism to distinguish logo from any background */}
        <AnimatedLogo 
          logoUrl={logoSource} 
          className="bg-card/80 backdrop-blur-md border border-border/50 shadow-2xl rounded-3xl p-8 min-w-[200px] min-h-[200px]"
          imageClassName="w-64 h-auto"
          discClassName="w-44 h-44"
        />

        {/* Rule 3 & 6: Elegant, modern, and simple spinner */}
        <div className="flex flex-col items-center gap-4">
            <div className="relative w-12 h-12 flex items-center justify-center">
                {/* Outer Track */}
                <div className="absolute inset-0 rounded-full border-4 border-muted" />
                {/* Animated Inner Ring */}
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ ease: "linear", duration: 1, repeat: Infinity }}
                    className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent"
                />
            </div>
            
            {/* Rule 2: Dynamic Text */}
            <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-foreground/80 font-medium tracking-wide animate-pulse"
            >
                {text}
            </motion.p>
        </div>

      </div>
    </div>
  );
}
