'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle } from 'lucide-react';
import type { PasswordValidationResult } from '@/lib/validation/password';
import { getStrengthLabel, getStrengthColor, getPasswordRequirements } from '@/lib/validation/password';

interface PasswordStrengthIndicatorProps {
  validation: PasswordValidationResult;
  showRequirements?: boolean;
  className?: string;
}

/**
 * Password Strength Indicator Component
 *
 * Displays visual feedback about password strength and requirements
 * Helps users create secure passwords that meet all requirements
 */
export function PasswordStrengthIndicator({
  validation,
  showRequirements = true,
  className
}: PasswordStrengthIndicatorProps) {
  const { strength, requirements } = validation;

  // Calculate number of met requirements
  const metRequirements = Object.values(requirements).filter(Boolean).length;
  const totalRequirements = Object.values(requirements).length;

  // Don't show indicator if password is empty
  if (!validation.isValid && metRequirements === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength Bars */}
      <div className="flex gap-1" role="progressbar" aria-valuenow={metRequirements} aria-valuemin={0} aria-valuemax={totalRequirements}>
        {[1, 2, 3, 4].map((level) => {
          const isActive = metRequirements >= level;
          const barColor = isActive ? getStrengthColor(strength) : 'bg-neutral-200';

          return (
            <div
              key={level}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-200',
                barColor
              )}
              aria-hidden="true"
            />
          );
        })}
      </div>

      {/* Strength Label */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-neutral-600">
          Seguridad: <span className={cn('font-medium', {
            'text-red-600': strength === 'weak',
            'text-yellow-600': strength === 'medium',
            'text-green-600': strength === 'strong',
            'text-blue-600': strength === 'very-strong',
          })}>
            {getStrengthLabel(strength)}
          </span>
        </span>
        <span className="text-xs text-neutral-500">
          {metRequirements}/{totalRequirements} requisitos
        </span>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1 pt-1" role="list" aria-label="Requisitos de contraseña">
          <RequirementItem
            met={requirements.minLength}
            label="Al menos 12 caracteres"
          />
          <RequirementItem
            met={requirements.hasUppercase}
            label="Una letra mayúscula"
          />
          <RequirementItem
            met={requirements.hasLowercase}
            label="Una letra minúscula"
          />
          <RequirementItem
            met={requirements.hasNumber}
            label="Un número"
          />
          <RequirementItem
            met={requirements.hasSpecial}
            label="Un carácter especial"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Individual Requirement Item
 */
function RequirementItem({ met, label }: { met: boolean; label: string }) {
  const Icon = met ? CheckCircle2 : Circle;

  return (
    <div
      className={cn(
        'flex items-center gap-2 text-xs transition-colors duration-150',
        met ? 'text-green-600' : 'text-neutral-500'
      )}
      role="listitem"
    >
      <Icon className={cn('h-3.5 w-3.5 flex-shrink-0', met && 'fill-current')} aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}