'use client';

import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  intent?: 'tenant' | 'landlord';
  propertyId?: string;
  children: React.ReactNode;
}

/**
 * Base Authentication Modal Component
 *
 * Provides the modal container for authentication flows.
 * - Full-screen on mobile with slide-up animation
 * - Centered modal on desktop with backdrop
 * - Handles escape key and backdrop clicks
 */
export function AuthModal({
  isOpen,
  onClose,
  intent,
  propertyId,
  children
}: AuthModalProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Handle body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsMounted(true);
    } else {
      document.body.style.overflow = 'unset';
      // Delay unmounting for exit animation
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isMounted && !isOpen) {
    return null;
  }

  return (
    <div
      className={cn(
        // Base styles
        'fixed inset-0 z-50 flex items-end justify-center sm:items-center',
        // Backdrop
        'bg-black/50',
        // Animation
        'transition-opacity duration-300',
        isOpen ? 'opacity-100' : 'opacity-0'
      )}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className={cn(
          // Base styles
          'relative w-full bg-white',
          // Mobile: Full screen with slide-up
          'h-full sm:h-auto sm:max-h-[90vh]',
          'sm:max-w-[480px] sm:rounded-xl sm:shadow-2xl',
          // Animation
          'transition-all duration-300 ease-out',
          isOpen
            ? 'translate-y-0 sm:scale-100'
            : 'translate-y-full sm:translate-y-0 sm:scale-95',
          // Scrolling
          'overflow-y-auto'
        )}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className={cn(
            'absolute top-4 right-4 z-10',
            'p-2 rounded-full',
            'text-neutral-500 hover:text-neutral-900',
            'hover:bg-neutral-100',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
          )}
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Auth Modal Header Component
 */
export function AuthModalHeader({
  title,
  subtitle,
  className
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn('text-center mb-8', className)}>
      <h2
        id="auth-modal-title"
        className="text-2xl font-bold text-neutral-900 mb-2"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-base text-neutral-600">
          {subtitle}
        </p>
      )}
    </div>
  );
}

/**
 * Auth Modal Footer Component
 */
export function AuthModalFooter({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mt-6 text-center text-sm text-neutral-600', className)}>
      {children}
    </div>
  );
}

/**
 * Divider with text (e.g., "o")
 */
export function AuthDivider({ text = 'o' }: { text?: string }) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-neutral-200" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-4 text-neutral-500">
          {text}
        </span>
      </div>
    </div>
  );
}