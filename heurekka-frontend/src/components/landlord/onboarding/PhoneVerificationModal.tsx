'use client';

/**
 * PhoneVerificationModal Component
 * Modal para verificación de teléfono con código de 6 dígitos
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  phoneNumber: string;
  onResendCode?: () => Promise<void>;
}

const CODE_LENGTH = 6;
const VERIFICATION_TIMEOUT = 5 * 60; // 5 minutos en segundos
const RESEND_COOLDOWN = 30; // 30 segundos

export function PhoneVerificationModal({
  isOpen,
  onClose,
  onVerify,
  phoneNumber,
  onResendCode,
}: PhoneVerificationModalProps) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(VERIFICATION_TIMEOUT);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auto-focus primer input
  useEffect(() => {
    if (isOpen) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = useCallback((index: number, value: string) => {
    // Solo permitir números
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus siguiente input
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit cuando se completa el código
    if (newCode.every(digit => digit !== '') && index === CODE_LENGTH - 1) {
      handleVerify(newCode.join(''));
    }
  }, [code]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [code]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, CODE_LENGTH);

    if (!/^\d+$/.test(pastedData)) return;

    const newCode = Array(CODE_LENGTH).fill('');
    pastedData.split('').forEach((digit, i) => {
      if (i < CODE_LENGTH) {
        newCode[i] = digit;
      }
    });

    setCode(newCode);
    setError(null);

    // Focus último input con valor
    const lastFilledIndex = Math.min(pastedData.length - 1, CODE_LENGTH - 1);
    inputRefs.current[lastFilledIndex]?.focus();

    // Auto-verify si se pegó código completo
    if (pastedData.length === CODE_LENGTH) {
      handleVerify(newCode.join(''));
    }
  }, []);

  const handleVerify = async (codeString: string) => {
    if (codeString.length !== CODE_LENGTH) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await onVerify(codeString);
      // Si llega aquí, la verificación fue exitosa
      onClose();
    } catch (err) {
      setAttemptsLeft(prev => prev - 1);
      setError(
        attemptsLeft > 1
          ? `Código incorrecto. ${attemptsLeft - 1} intentos restantes.`
          : 'Código incorrecto. Último intento.'
      );
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !onResendCode) return;

    try {
      await onResendCode();
      setResendCooldown(RESEND_COOLDOWN);
      setTimeLeft(VERIFICATION_TIMEOUT);
      setCode(Array(CODE_LENGTH).fill(''));
      setError(null);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Error al reenviar el código. Intenta de nuevo.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cerrar"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">📱</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verificar Teléfono
          </h2>
          <p className="text-gray-600">
            Enviamos un código de 6 dígitos a<br />
            <span className="font-semibold">{phoneNumber}</span>
          </p>
        </div>

        {/* Code inputs */}
        <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
          {code.map((digit, index) => (
            <input
              key={index}
              ref={el => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleInputChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className={cn(
                'w-12 h-14 text-center text-2xl font-semibold rounded-lg border-2',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                'transition-all',
                error
                  ? 'border-red-300 bg-red-50'
                  : digit
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white'
              )}
              disabled={isVerifying || timeLeft === 0 || attemptsLeft === 0}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-sm text-red-500 text-center mb-4 flex items-center justify-center gap-1">
            <span className="text-base">⚠</span>
            {error}
          </p>
        )}

        {/* Timer */}
        <div className="text-center mb-6">
          <p className="text-sm text-gray-600">
            {timeLeft > 0 ? (
              <>
                Tiempo restante: <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
              </>
            ) : (
              <span className="text-red-500 font-semibold">El código ha expirado</span>
            )}
          </p>
          {attemptsLeft < 3 && attemptsLeft > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {attemptsLeft} {attemptsLeft === 1 ? 'intento restante' : 'intentos restantes'}
            </p>
          )}
        </div>

        {/* Resend button */}
        <button
          onClick={handleResend}
          disabled={resendCooldown > 0 || timeLeft === 0}
          className={cn(
            'w-full py-3 rounded-lg font-medium transition-colors',
            resendCooldown > 0 || timeLeft === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          )}
        >
          {resendCooldown > 0
            ? `Reenviar código en ${resendCooldown}s`
            : timeLeft === 0
            ? 'Solicitar nuevo código'
            : 'Reenviar código'}
        </button>

        {/* Loading state */}
        {isVerifying && (
          <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-600 font-medium">Verificando...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
