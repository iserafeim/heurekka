import React, { forwardRef, ChangeEvent } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

/**
 * PhoneInput Component
 * Custom input with automatic formatting for Honduran phone numbers (9999-9999)
 * Compatible with React 19 and React Hook Form
 */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value = '', onChange, className, ...props }, ref) => {
    const formatPhoneNumber = (input: string): string => {
      // Remove all non-digits
      const digits = input.replace(/\D/g, '');

      // Limit to 8 digits
      const limitedDigits = digits.slice(0, 8);

      // Format as 9999-9999
      if (limitedDigits.length <= 4) {
        return limitedDigits;
      }

      return `${limitedDigits.slice(0, 4)}-${limitedDigits.slice(4)}`;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value);

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
        placeholder="9999-9999"
        maxLength={9} // 8 digits + 1 dash
        className={cn(className)}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
