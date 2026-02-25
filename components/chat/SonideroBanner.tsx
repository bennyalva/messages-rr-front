'use client';

import { Megaphone } from 'lucide-react';

export default function SonideroBanner() {
  return (
    <div className="sticky top-[57px] z-40 w-full bg-white/90 backdrop-blur-md py-1.5 border-y border-white/20 shadow-lg overflow-hidden">
        <span className="animate-marquee whitespace-nowrap inline-flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-gray-700 animate-bounce flex-shrink-0" />
            <span className="text-sm font-bold text-gray-800 tracking-widest uppercase">
                 ¡SÚBELE AL VOLUMEN MI CHAVO! — AMBIENTE 100% CONFIRMADO
            </span>
            <Megaphone className="w-4 h-4 text-gray-700 animate-bounce flex-shrink-0" />
        </span>
    </div>
  );
}
