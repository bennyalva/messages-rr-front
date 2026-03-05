'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  /** 'confirm' = 2 buttons (decision), 'info' = 1 button (informational) */
  mode?: 'confirm' | 'info';
  /** Optional icon to display above the title */
  icon?: ReactNode;
}

export default function ConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirmar',
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  mode = 'confirm',
  icon,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onCancel();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onCancel]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md mx-4 bg-card border border-border/50 rounded-2xl shadow-2xl shadow-primary/10 animate-in zoom-in-95 duration-200"
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Content */}
        <div className="p-6 pt-8">
          {/* Icon (optional) */}
          {icon && (
            <div className="flex justify-center mb-4">
              {icon}
            </div>
          )}

          {/* Title */}
          <h3 className="text-lg font-bold text-foreground text-center mb-2">{title}</h3>

          {/* Message */}
          <p className="text-muted-foreground text-center text-sm leading-relaxed mb-6">{message}</p>

          {/* Buttons */}
          {mode === 'confirm' ? (
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-border text-muted-foreground hover:bg-muted"
                onClick={onCancel}
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                variant="default"
                className="flex-1 bg-primary hover:bg-primary/80 text-primary-foreground"
                onClick={onConfirm}
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : confirmText}
              </Button>
            </div>
          ) : (
            <Button
              className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

