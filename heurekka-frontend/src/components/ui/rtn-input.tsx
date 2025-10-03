import React, { forwardRef, ChangeEvent } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface RTNInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

/**
 * RTNInput Component
 * Custom input with automatic formatting for Honduran RTN (9999-9999-999999)
 * Compatible with React 19 and React Hook Form
 */
export const RTNInput = forwardRef<HTMLInputElement, RTNInputProps>(
  ({ value = '', onChange, className, ...props }, ref) => {
    const formatRTN = (input: string): string => {
      // Remove all non-digits
      const digits = input.replace(/\D/g, '');

      // Limit to 14 digits
      const limitedDigits = digits.slice(0, 14);

      // Format as 9999-9999-999999
      if (limitedDigits.length <= 4) {
        return limitedDigits;
      } else if (limitedDigits.length <= 8) {
        return `${limitedDigits.slice(0, 4)}-${limitedDigits.slice(4)}`;
      }

      return `${limitedDigits.slice(0, 4)}-${limitedDigits.slice(4, 8)}-${limitedDigits.slice(8)}`;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatRTN(e.target.value);

      if (onChange) {
        onChange(formatted);
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="0801-1990-123456"
        maxLength={16} // 14 digits + 2 dashes
        className={cn(className)}
        {...props}
      />
    );
  }
);

RTNInput.displayName = 'RTNInput';
