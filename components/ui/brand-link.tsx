'use client';

import { Globe } from 'lucide-react';
import { BRAND } from '@/lib/constants';

interface BrandLinkProps {
  href?: string;
  className?: string;
}

export function BrandLink({ href = 'https://google.com', className = '' }: BrandLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block rounded-xl p-[1.5px] bg-gradient-to-r from-purple-500 via-primary to-cyan-400 hover:shadow-[0_0_20px_-4px] hover:shadow-primary/50 transition-all duration-300 ${className}`}
    >
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-[10px] bg-background/95 backdrop-blur-sm">
        <Globe className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
        <span className="text-sm font-bold tracking-wide text-foreground/80 group-hover:text-primary transition-colors">
          {BRAND.WEBSITE}
        </span>
      </div>
    </a>
  );
}

