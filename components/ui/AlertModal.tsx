'use client';

import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export type AlertVariant = 'error' | 'warning' | 'info' | 'success';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  variant?: AlertVariant;
  buttonText?: string;
}

const VARIANT_CONFIG = {
  error: {
    icon: AlertCircle,
    gradient: 'from-red-500/20 to-red-900/10',
    border: 'border-red-500/30',
    iconColor: 'text-red-400',
    shadow: 'shadow-red-500/20',
    buttonBg: 'bg-red-500 hover:bg-red-400',
    title: 'Error',
  },
  warning: {
    icon: AlertTriangle,
    gradient: 'from-amber-500/20 to-amber-900/10',
    border: 'border-amber-500/30',
    iconColor: 'text-amber-400',
    shadow: 'shadow-amber-500/20',
    buttonBg: 'bg-amber-500 hover:bg-amber-400',
    title: 'Advertencia',
  },
  info: {
    icon: Info,
    gradient: 'from-blue-500/20 to-blue-900/10',
    border: 'border-blue-500/30',
    iconColor: 'text-blue-400',
    shadow: 'shadow-blue-500/20',
    buttonBg: 'bg-blue-500 hover:bg-blue-400',
    title: 'Información',
  },
  success: {
    icon: CheckCircle2,
    gradient: 'from-emerald-500/20 to-emerald-900/10',
    border: 'border-emerald-500/30',
    iconColor: 'text-emerald-400',
    shadow: 'shadow-emerald-500/20',
    buttonBg: 'bg-emerald-500 hover:bg-emerald-400',
    title: 'Éxito',
  },
} as const;

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  variant = 'error',
  buttonText = 'Aceptar',
}: AlertModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`relative w-full max-w-sm mx-4 bg-gradient-to-br ${config.gradient} bg-card border ${config.border} rounded-2xl shadow-2xl ${config.shadow} animate-in zoom-in-95 duration-200 overflow-hidden`}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-foreground z-10"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Content */}
        <div className="flex flex-col items-center text-center p-6 pt-8">
          {/* Icon */}
          <div className={`p-4 rounded-full bg-background/50 mb-4`}>
            <Icon className={`w-10 h-10 ${config.iconColor}`} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-foreground mb-2">
            {title || config.title}
          </h3>

          {/* Message */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-[280px]">
            {message}
          </p>

          {/* Action Button */}
          <Button
            className={`w-full font-bold text-white ${config.buttonBg} transition-colors`}
            onClick={onClose}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
