'use client';

import { cn } from '@/lib/utils';

interface ContentOverlayProps {
  /** Whether the overlay is visible */
  isActive: boolean;
  /** Optional additional className */
  className?: string;
}

/**
 * Transparent overlay that blocks user interaction on the content area
 * while a service call is in progress. Should be placed inside <main>
 * so the header remains accessible for navigation.
 */
export function ContentOverlay({ isActive, className }: ContentOverlayProps) {
  if (!isActive) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 z-40 bg-background/30 backdrop-blur-[1px] cursor-not-allowed',
        'animate-in fade-in duration-200',
        className
      )}
      onClick={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    />
  );
}
