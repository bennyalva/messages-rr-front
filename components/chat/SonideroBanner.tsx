'use client';

import { useRef, useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { storageService } from '@/lib/utils/storage';
import { STORAGE_KEYS } from '@/lib/constants';

interface SonideroBannerProps {
  show?: boolean;
}

export default function SonideroBanner({ show = true }: SonideroBannerProps) {
  const [config, setConfig] = useState<any>({ appName: 'SONIDERO' });

  useEffect(() => {
    const stored = storageService.getItem(STORAGE_KEYS.CONFIG);
    if (stored) setConfig(stored);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="sticky top-16 z-40 w-full overflow-hidden"
        >
          <div className="bg-primary py-1.5 border-y border-primary-foreground/10 shadow-xl overflow-hidden whitespace-nowrap relative">
              {/* Optional subtle glow overlay */}
              <div className="absolute inset-0 bg-white/5 pointer-events-none" />
              
              <div className="animate-marquee flex flex-row items-center gap-6 w-max relative z-10">
                <Megaphone className="w-4 h-4 text-primary-foreground flex-shrink-0 animate-bounce" />
                
                <span className="text-[13px] font-black text-primary-foreground tracking-[0.1em] uppercase drop-shadow-sm">
                     {config.appName} INFORMA: ¡SÚBELE AL VOLUMEN MI CHAVO! — AMBIENTE 100% CONFIRMADO PROHIBIDO SENTARSE
                </span>
                
                <Megaphone className="w-4 h-4 text-primary-foreground flex-shrink-0 animate-bounce" />
              </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
