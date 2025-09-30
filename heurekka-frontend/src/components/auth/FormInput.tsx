'use client';

import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  showPasswordToggle?: boolean;
}

/**
 * Form Input Component
 *
 * Styled input field following HEUREKKA design system:
 * - 48px height for touch-friendly interaction
 * - 16px font size to prevent iOS zoom
 * - Clear error states with icons
 * - Password visibility toggle
 * - Proper ARIA labels for accessibility
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      label,
      error,
      helperText,
      required,
      type = 'text',
      showPasswordToggle = false,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const actualType = showPasswordToggle
      ? showPassword
        ? 'text'
        : 'password'
      : type;

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-neutral-700 mb-2"
        >
          {label}
          {required && (
            <span className="text-destructive ml-1" aria-label="requerido">
              *
            </span>
          )}
        </label>

        {/* Input Container */}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={actualType}
            aria-invalid={!!error}
            aria-describedby={cn(errorId, helperId)}
            aria-required={required}
            className={cn(
              // Base styles
              'flex h-12 w-full rounded-lg border bg-white px-4 py-3',
              // Typography - 16px prevents iOS zoom
              'text-base placeholder:text-neutral-400',
              // Focus state
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'transition-colors duration-150',
              // Default border
              !error && 'border-neutral-300 focus:border-primary focus:ring-primary/20',
              // Error state
              error &&
                'border-destructive focus:border-destructive focus:ring-destructive/20 bg-red-50',
              // Disabled state
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-neutral-100',
              // Password toggle padding
              showPasswordToggle && 'pr-12'
            )}
            {...props}
          />

          {/* Password Toggle Button */}
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2',
                'p-2 rounded-md',
                'text-neutral-500 hover:text-neutral-700',
                'hover:bg-neutral-100',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-primary'
              )}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div
            id={errorId}
            role="alert"
            className="mt-2 flex items-start gap-2 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Helper Text */}
        {helperText && !error && (
          <p id={helperId} className="mt-2 text-sm text-neutral-500">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';