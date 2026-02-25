'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Whether all required form fields are filled/valid */
  isFormValid: boolean;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Button label text */
  label: string;
  /** Optional label shown during submission */
  loadingLabel?: string;
  /** Optional icon shown before the label */
  icon?: React.ReactNode;
}

/**
 * Reusable submit button with two visual states:
 * - Incomplete: muted appearance (but still clickable to trigger validation)
 * - Complete: vibrant with glow effect
 * - Submitting: disabled with spinner
 */
export function SubmitButton({
  isFormValid,
  isSubmitting,
  label,
  loadingLabel,
  icon,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      variant="default"
      disabled={isSubmitting}
      className={cn(
        'w-full font-bold text-lg transition-all duration-300',
        isFormValid && !isSubmitting
          ? 'opacity-100 shadow-[0_0_20px_theme(colors.primary.DEFAULT)] hover:shadow-[0_0_30px_theme(colors.primary.DEFAULT)] scale-100'
          : 'opacity-40 shadow-none scale-[0.98]',
        className
      )}
      {...props}
    >
      {isSubmitting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </Button>
  );
}
