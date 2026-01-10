'use client';

import { Speaker } from 'lucide-react'; // Changed SpeakerIcon to Speaker as it is likely correct in generic lucide setup, or I'll check imports

export default function SonideroBanner() {
  return (
    <div className="sticky top-[57px] z-40 w-full bg-white/75 backdrop-blur-2xl py-1.5 border-y border-white/20 shadow-lg overflow-hidden">
        <div className="flex items-center justify-center gap-2 whitespace-nowrap animate-marquee">
            <Speaker className="w-4 h-4 text-gray-700 animate-bounce" />
            <span className="text-sm font-bold text-gray-800 tracking-widest uppercase">
                 ¡SÚBELE AL VOLUMEN MI CHAVO! - AMBIENTE 100% CONFIRMADO
            </span>
             <Speaker className="w-4 h-4 text-gray-700 animate-bounce" />
        </div>
    </div>
  );
}
