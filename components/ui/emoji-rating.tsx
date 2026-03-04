'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface EmojiRatingProps {
  /** The question label displayed above the emojis */
  question: string;
  /** Currently selected value (1-4) or null */
  value: number | null;
  /** Callback when user selects a rating */
  onChange: (value: number) => void;
}

const EMOJI_OPTIONS = [
  { value: 1, emoji: '😡', label: 'Muy mal' },
  { value: 2, emoji: '😕', label: 'Regular' },
  { value: 3, emoji: '😊', label: 'Bien' },
  { value: 4, emoji: '😍', label: '¡Increíble!' },
];

/**
 * Emoji-based rating component.
 * Displays 4 emojis from most negative to most positive.
 * Only one can be selected per question.
 */
export function EmojiRating({ question, value, onChange }: EmojiRatingProps) {
  return (
    <div className="space-y-3">
      <p className="text-foreground font-semibold text-[15px]">{question}</p>
      <div className="flex items-center justify-between gap-2">
        {EMOJI_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          const hasSelection = value !== null;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-2xl transition-all duration-300 flex-1 cursor-pointer select-none',
                'border-2 border-transparent',
                isSelected
                  ? 'bg-primary/15 border-primary/40 scale-110 shadow-lg shadow-primary/20'
                  : hasSelection
                    ? 'opacity-40 hover:opacity-70 hover:bg-muted/50'
                    : 'hover:bg-muted/50 hover:scale-105'
              )}
              aria-label={option.label}
            >
              <span
                className={cn(
                  'text-3xl md:text-4xl transition-transform duration-300',
                  isSelected && 'animate-[bounce_0.4s_ease-out]'
                )}
              >
                {option.emoji}
              </span>
              <span
                className={cn(
                  'text-[10px] font-medium transition-colors duration-300',
                  isSelected
                    ? 'text-primary font-bold'
                    : 'text-muted-foreground'
                )}
              >
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
