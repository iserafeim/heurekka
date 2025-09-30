/**
 * Password Validation Utility
 * Enforces consistent password requirements across the application
 *
 * Requirements match backend validation:
 * - Minimum 12 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */

export interface PasswordValidationResult {
  isValid: boolean;
  error: string | null;
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

const PASSWORD_MIN_LENGTH = 12;

/**
 * Validates password against security requirements
 * @param password - Password to validate
 * @returns Validation result with detailed feedback
 */
export function validatePassword(password: string): PasswordValidationResult {
  const requirements = {
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^a-zA-Z0-9]/.test(password),
  };

  // Determine error message
  let error: string | null = null;
  if (!password) {
    error = 'La contraseña es requerida';
  } else if (!requirements.minLength) {
    error = 'La contraseña debe tener al menos 12 caracteres';
  } else if (!requirements.hasUppercase) {
    error = 'Debe incluir al menos una mayúscula';
  } else if (!requirements.hasLowercase) {
    error = 'Debe incluir al menos una minúscula';
  } else if (!requirements.hasNumber) {
    error = 'Debe incluir al menos un número';
  } else if (!requirements.hasSpecial) {
    error = 'Debe incluir al menos un carácter especial (!@#$%^&*...)';
  }

  // Calculate password strength
  const strength = calculatePasswordStrength(password, requirements);

  return {
    isValid: error === null,
    error,
    strength,
    requirements,
  };
}

/**
 * Calculates password strength based on requirements and additional factors
 * @param password - Password to evaluate
 * @param requirements - Requirements checklist
 * @returns Strength level
 */
function calculatePasswordStrength(
  password: string,
  requirements: PasswordValidationResult['requirements']
): PasswordValidationResult['strength'] {
  let score = 0;

  // Check each requirement
  if (requirements.minLength) score += 1;
  if (requirements.hasUppercase) score += 1;
  if (requirements.hasLowercase) score += 1;
  if (requirements.hasNumber) score += 1;
  if (requirements.hasSpecial) score += 1;

  // Bonus points for length
  if (password.length >= 16) score += 1;
  if (password.length >= 20) score += 1;

  // Bonus for variety of special characters
  const specialChars = password.match(/[^a-zA-Z0-9]/g);
  if (specialChars && specialChars.length >= 3) score += 1;

  // Penalty for common patterns
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters
  if (/^[0-9]+$/.test(password)) score -= 2; // Only numbers
  if (/^[a-zA-Z]+$/.test(password)) score -= 2; // Only letters
  if (/^(123|abc|qwerty|password)/i.test(password)) score -= 2; // Common patterns

  // Map score to strength level
  if (score <= 3) return 'weak';
  if (score <= 5) return 'medium';
  if (score <= 7) return 'strong';
  return 'very-strong';
}

/**
 * Gets human-readable description of password requirements
 * @returns Array of requirement descriptions
 */
export function getPasswordRequirements(): string[] {
  return [
    'Al menos 12 caracteres',
    'Una letra mayúscula (A-Z)',
    'Una letra minúscula (a-z)',
    'Un número (0-9)',
    'Un carácter especial (!@#$%^&*...)',
  ];
}

/**
 * Gets user-friendly strength label
 * @param strength - Strength level
 * @returns Localized strength label
 */
export function getStrengthLabel(strength: PasswordValidationResult['strength']): string {
  const labels: Record<PasswordValidationResult['strength'], string> = {
    'weak': 'Débil',
    'medium': 'Media',
    'strong': 'Fuerte',
    'very-strong': 'Muy Fuerte',
  };
  return labels[strength];
}

/**
 * Gets color for strength indicator
 * @param strength - Strength level
 * @returns Tailwind color class
 */
export function getStrengthColor(strength: PasswordValidationResult['strength']): string {
  const colors: Record<PasswordValidationResult['strength'], string> = {
    'weak': 'bg-red-500',
    'medium': 'bg-yellow-500',
    'strong': 'bg-green-500',
    'very-strong': 'bg-blue-500',
  };
  return colors[strength];
}