'use client';

import { Megaphone } from 'lucide-react';

export default function SonideroBanner() {
  return (
    <div className="sticky top-[57px] z-40 w-full bg-white/90 backdrop-blur-2xl py-1 border-t border-primary/40 border-b border-secondary/40 shadow-lg overflow-hidden whitespace-nowrap">
        <div className="animate-marquee flex flex-row items-center gap-2 w-max">
            <Megaphone className="w-3.5 h-3.5 text-gray-900 animate-bounce flex-shrink-0" />
            <span className="text-[13px] font-bold text-gray-900 tracking-widest uppercase">
                 ¡SÚBELE AL VOLUMEN MI CHAVO! — AMBIENTE 100% CONFIRMADO
            </span>
            <Megaphone className="w-3.5 h-3.5 text-gray-900 animate-bounce flex-shrink-0" />
        </div>
    </div>
  );
}
