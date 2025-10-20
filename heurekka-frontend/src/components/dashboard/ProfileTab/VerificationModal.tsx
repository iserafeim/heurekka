'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Phone, Mail, Clock, AlertTriangle } from 'lucide-react';
import { trpc } from '@/lib/trpc/react';
import { toast } from 'sonner';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'phone' | 'email';
  phoneNumber?: string;
  email?: string;
  onSuccess: () => void;
}

const CODE_LENGTH = 6;
const VERIFICATION_TIMEOUT = 5 * 60; // 5 minutos en segundos
const RESEND_COOLDOWN = 30; // 30 segundos

export function VerificationModal({
  isOpen,
  onClose,
  type,
  phoneNumber,
  email,
  onSuccess
}: VerificationModalProps) {
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [timeLeft, setTimeLeft] = useState(VERIFICATION_TIMEOUT);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const requestPhoneMutation = trpc.landlordProfile.requestPhoneVerification.useMutation();
  const verifyPhoneMutation = trpc.landlordProfile.verifyPhone.useMutation();
  const requestEmailMutation = trpc.landlordProfile.requestEmailVerification.useMutation();
  const verifyEmailMutation = trpc.landlordProfile.verifyEmail.useMutation();

  const contactInfo = type === 'phone' ? phoneNumber : email;
  const Icon = type === 'phone' ? Phone : Mail;
  const contactLabel = type === 'phone' ? 'teléfono' : 'correo electrónico';
  const contactTitle = type === 'phone' ? 'Verificar teléfono' : 'Verificar correo';

  // Countdown timer
  useEffect(() => {
    if (!isOpen || !codeSent) return;

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
  }, [isOpen, codeSent]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  // Auto-focus primer input cuando se envía el código
  useEffect(() => {
    if (isOpen && codeSent) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen, codeSent]);

  // Error shake animation trigger
  useEffect(() => {
    if (error) {
      setShowError(true);
      const timer = setTimeout(() => setShowError(false), 300);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRequestCode = async () => {
    setError(null);

    try {
      if (type === 'phone') {
        if (!phoneNumber) {
          toast.error('No hay número de teléfono configurado');
          return;
        }

        const result = await requestPhoneMutation.mutateAsync({ phoneNumber });

        if (result.success) {
          setCodeSent(true);
          setTimeLeft(VERIFICATION_TIMEOUT);
          toast.success(`Código enviado a ${phoneNumber}`);
        } else if (result.cooldownSeconds) {
          setResendCooldown(result.cooldownSeconds);
          setError(`Por favor espera ${result.cooldownSeconds} segundos antes de solicitar otro código`);
        }
      } else {
        if (!email) {
          toast.error('No hay correo electrónico configurado');
          return;
        }

        const result = await requestEmailMutation.mutateAsync({ email });

        if (result.success) {
          setCodeSent(true);
          setTimeLeft(VERIFICATION_TIMEOUT);
          toast.success(`Código enviado a ${email}`);
        } else if (result.cooldownSeconds) {
          setResendCooldown(result.cooldownSeconds);
          setError(`Por favor espera ${result.cooldownSeconds} segundos antes de solicitar otro código`);
        }
      }
    } catch (error: any) {
      console.error('Error requesting verification code:', error);
      setError(error?.message || 'Error al enviar el código de verificación');
      toast.error(error?.message || 'Error al enviar el código');
    }
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
      if (type === 'phone') {
        await verifyPhoneMutation.mutateAsync({ code: codeString });
        toast.success('¡Teléfono verificado exitosamente!');
      } else {
        await verifyEmailMutation.mutateAsync({ code: codeString });
        toast.success('¡Correo verificado exitosamente!');
      }

      setTimeout(() => {
        onSuccess();
        handleClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Código incorrecto. Por favor intenta de nuevo.');
      setCode(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      toast.error(err?.message || 'Código incorrecto');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    setCode(Array(CODE_LENGTH).fill(''));
    setError(null);
    await handleRequestCode();
  };

  const handleClose = () => {
    setCode(Array(CODE_LENGTH).fill(''));
    setTimeLeft(VERIFICATION_TIMEOUT);
    setResendCooldown(0);
    setCodeSent(false);
    setError(null);
    setIsVerifying(false);
    onClose();
  };

  if (!isOpen) return null;

  // Si no se ha enviado el código, mostrar botón para enviarlo
  if (!codeSent) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
        <div className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-2xl shadow-2xl shadow-blue-900/10 border border-blue-100/50 max-w-md w-full p-6 sm:p-8 relative animate-in zoom-in-95 duration-300">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 text-gray-400 hover:text-gray-700 transition-all duration-200 hover:bg-gray-100 rounded-full p-1.5 hover:rotate-90 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Cerrar modal de verificación"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200/50 ring-4 ring-blue-50">
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{contactTitle}</h2>
              <p className="text-sm sm:text-base text-gray-600 font-medium">{contactInfo}</p>
            </div>
          </div>

          {/* Gradient divider */}
          <div className="relative mb-6">
            <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
          </div>

          <div className="space-y-6">
            <p className="text-sm text-gray-600">
              Te enviaremos un código de verificación de 6 dígitos a tu {contactLabel}.
            </p>

            {error && (
              <div className="p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100/60 border border-red-300/60 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-200">
                <p className="text-sm sm:text-base text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{error}</span>
                </p>
              </div>
            )}

            <button
              onClick={handleRequestCode}
              disabled={requestPhoneMutation.isPending || requestEmailMutation.isPending || resendCooldown > 0}
              className={cn(
                'w-full py-3 sm:py-3.5 rounded-lg font-semibold transition-all duration-200',
                'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
                'hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-300/40 hover:-translate-y-0.5',
                'active:translate-y-0 active:shadow-lg',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
                'shadow-lg shadow-blue-200/50'
              )}
            >
              {requestPhoneMutation.isPending || requestEmailMutation.isPending
                ? 'Enviando...'
                : resendCooldown > 0
                ? `Espera ${resendCooldown}s`
                : 'Enviar código'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar modal de verificación de código
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-2xl shadow-2xl shadow-blue-900/10 border border-blue-100/50 max-w-md w-full p-6 sm:p-8 relative animate-in zoom-in-95 duration-300">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 text-gray-400 hover:text-gray-700 transition-all duration-200 hover:bg-gray-100 rounded-full p-1.5 hover:rotate-90 active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="Cerrar modal de verificación"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200/50 ring-4 ring-blue-50">
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{contactTitle}</h2>
            <p className="text-sm sm:text-base text-gray-600 font-medium">{contactInfo}</p>
          </div>
        </div>

        {/* Gradient divider */}
        <div className="relative mb-6">
          <div className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </div>

        <div className="space-y-6">
          {/* Info banner */}
          <div className="bg-gradient-to-br from-blue-50 via-blue-50/70 to-purple-50/50 border border-blue-200/60 rounded-xl p-4 shadow-sm shadow-blue-100/50 animate-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-blue-900">
              Código enviado a <span className="font-semibold">{contactInfo}</span>
            </p>
            <p className="text-xs sm:text-sm text-blue-800 mt-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Expira en: </span>
              <span className="font-bold tabular-nums text-blue-700">{formatTime(timeLeft)}</span>
            </p>
          </div>

          {/* Code label */}
          <div>
            <label className="block text-base font-medium text-gray-700 mb-3">
              Código de verificación
            </label>

            {/* Code inputs */}
            <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
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
                    'w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-bold rounded-xl border-2',
                    'focus:outline-none focus:ring-4 focus:ring-blue-200/50 focus:border-blue-500',
                    'transition-all duration-200',
                    'shadow-sm',
                    showError && error
                      ? 'border-red-400 bg-red-50/70 text-red-700 animate-shake'
                      : digit
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100/70 text-blue-700 scale-105 shadow-md shadow-blue-200/30'
                      : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50 hover:border-blue-400'
                  )}
                  disabled={isVerifying || timeLeft === 0}
                />
              ))}
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 sm:p-4 bg-gradient-to-br from-red-50 to-red-100/60 border border-red-300/60 rounded-xl shadow-sm animate-in slide-in-from-top-2 duration-200">
              <p className="text-sm sm:text-base text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0 || timeLeft === 0}
              className={cn(
                'flex-1 py-3 rounded-lg font-semibold transition-all duration-200 border',
                'bg-white text-gray-700 border-gray-300',
                'hover:bg-gray-50 hover:border-gray-400 hover:shadow-md',
                'active:scale-98',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {resendCooldown > 0
                ? `Reenviar (${resendCooldown}s)`
                : timeLeft === 0
                ? 'Código expirado'
                : 'Reenviar código'}
            </button>

            <button
              onClick={() => handleVerify(code.join(''))}
              disabled={code.some(d => !d) || isVerifying}
              className={cn(
                'flex-1 py-3 sm:py-3.5 rounded-lg font-semibold transition-all duration-200',
                'bg-gradient-to-r from-blue-600 to-blue-700 text-white',
                'hover:from-blue-700 hover:to-blue-800 hover:shadow-xl hover:shadow-blue-300/40 hover:-translate-y-0.5',
                'active:translate-y-0 active:shadow-lg',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
                'shadow-lg shadow-blue-200/50'
              )}
            >
              {isVerifying ? 'Verificando...' : 'Verificar'}
            </button>
          </div>
        </div>

        {/* Loading overlay */}
        {isVerifying && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-blue-50/80 to-white/95 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-4 animate-in zoom-in-95 duration-300">
              <div className="relative">
                <div className="w-14 h-14 border-4 border-blue-200 rounded-full"></div>
                <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute inset-0"></div>
              </div>
              <p className="text-base text-gray-700 font-semibold tracking-tight">Verificando...</p>
            </div>
          </div>
        )}
      </div>

      {/* CSS for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
