'use client';

/**
 * Email Verification Modal
 * Modal para verificar email con código de 6 dígitos
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => Promise<void>;
  email: string;
  onResendCode: () => Promise<void>;
}

export function EmailVerificationModal({
  isOpen,
  onClose,
  onVerify,
  email,
  onResendCode,
}: EmailVerificationModalProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (!isOpen) {
      setCode(['', '', '', '', '', '']);
      setError('');
      setCanResend(false);
      setCountdown(30);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || canResend) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, canResend]);

  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-verify when all digits are entered
    if (newCode.every((digit) => digit !== '')) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code.join('');

    if (codeToVerify.length !== 6) {
      setError('Por favor ingresa el código completo');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await onVerify(codeToVerify);
      // Don't close here - let parent handle closing after refetch
    } catch (err: any) {
      setError(err?.message || 'Código incorrecto. Intenta de nuevo');
      setCode(['', '', '', '', '', '']);
      const firstInput = document.getElementById('code-0');
      firstInput?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      await onResendCode();
      setCanResend(false);
      setCountdown(30);
      setCode(['', '', '', '', '', '']);
      setError('');
    } catch (err) {
      setError('Error al reenviar código');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Verificar Email</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Código enviado a <span className="font-medium">{email}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center">
            Ingresa el código de 6 dígitos que enviamos a tu email
          </p>

          {/* Code Input */}
          <div className="flex gap-1.5 sm:gap-2 justify-center mb-4 sm:mb-6">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                disabled={isVerifying}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-xs sm:text-sm text-red-600 text-center">{error}</p>
            </div>
          )}

          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={code.join('').length !== 6 || isVerifying}
            className="w-full py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3 sm:mb-4"
          >
            {isVerifying ? 'Verificando...' : 'Verificar'}
          </button>

          {/* Resend Code */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResend}
                className="text-sm sm:text-base text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Reenviar código
              </button>
            ) : (
              <p className="text-gray-500 text-xs sm:text-sm">
                Reenviar código en {countdown}s
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
