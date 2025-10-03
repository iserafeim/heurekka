'use client';

/**
 * Verification Page
 * Página de verificación de identidad y teléfono
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/landlord/OnboardingContext';
import { ProgressIndicator } from '@/components/landlord/onboarding/ProgressIndicator';
import { PhoneVerificationModal } from '@/components/landlord/onboarding/PhoneVerificationModal';
import { toast } from 'sonner';

export default function VerificationPage() {
  const router = useRouter();
  const { state, nextStep, previousStep } = useOnboarding();
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true); // Assuming email is verified from auth
  const [phoneVerified, setPhoneVerified] = useState(false);

  const handlePhoneVerify = async (code: string) => {
    // Simular verificación (integrar con backend)
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (code === '123456') {
          setPhoneVerified(true);
          toast.success('Teléfono verificado correctamente');
          resolve();
        } else {
          toast.error('Código incorrecto');
          reject(new Error('Invalid code'));
        }
      }, 1000);
    });
  };

  const handleResendCode = async () => {
    // Simular reenvío de código
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        toast.success('Código reenviado');
        resolve();
      }, 1000);
    });
  };

  const handleContinue = () => {
    nextStep();
    router.push('/landlord/onboarding/complete');
  };

  const handleSkip = () => {
    toast.info('Puedes verificar tu cuenta después');
    nextStep();
    router.push('/landlord/onboarding/complete');
  };

  const handleBack = () => {
    previousStep();
    router.push('/landlord/onboarding/photo');
  };

  // Get phone number from form data
  const getPhoneNumber = () => {
    const formData = state.formData as any;
    return formData?.phone || formData?.primaryPhone || '9999-9999';
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Progress */}
      <ProgressIndicator currentStep={4} totalSteps={5} />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Construye Confianza
        </h1>
        <p className="text-gray-600">
          Verifica tu identidad para obtener el badge de perfil verificado
        </p>
      </div>

      {/* Verification Cards */}
      <div className="flex flex-col gap-4">
        {/* Email Verification */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">✉️</div>
              <div>
                <h3 className="font-semibold text-gray-900">Email</h3>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verificado
                </p>
              </div>
            </div>
            <div className="text-green-500 text-2xl">✓</div>
          </div>
        </div>

        {/* Phone Verification */}
        <div
          className={`bg-white rounded-xl shadow-lg p-6 border-2 transition-colors ${
            phoneVerified ? 'border-green-200' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📱</div>
              <div>
                <h3 className="font-semibold text-gray-900">Teléfono</h3>
                {phoneVerified ? (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verificado
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Pendiente de verificación</p>
                )}
              </div>
            </div>
            {phoneVerified ? (
              <div className="text-green-500 text-2xl">✓</div>
            ) : (
              <button
                onClick={() => setShowPhoneModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Verificar ahora
              </button>
            )}
          </div>
        </div>

        {/* Identity Verification (Optional) */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🆔</div>
              <div>
                <h3 className="font-semibold text-gray-900">Identidad</h3>
                <p className="text-sm text-gray-500">Obtén el badge verificado</p>
              </div>
            </div>
            <button
              onClick={() => toast.info('Próximamente disponible')}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Comenzar (5 min)
            </button>
          </div>
        </div>

        {/* Document Verification (Premium) */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200 opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">📄</div>
              <div>
                <h3 className="font-semibold text-gray-900">Documentos de Propiedad</h3>
                <p className="text-sm text-gray-500">Para cuentas premium</p>
              </div>
            </div>
            <button
              onClick={() => toast.info('Requiere cuenta premium')}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Más información
            </button>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Beneficios de verificar tu cuenta:</h3>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-center gap-2">
            <span className="text-blue-600">✓</span>
            <span>Badge de perfil verificado</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-600">✓</span>
            <span>Mayor confianza de los inquilinos</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-600">✓</span>
            <span>Prioridad en resultados de búsqueda</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-blue-600">✓</span>
            <span>Acceso a funciones premium</span>
          </li>
        </ul>
      </div>

      {/* Botones de navegación */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleBack}
          className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          ← Atrás
        </button>

        <button
          onClick={handleContinue}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
        >
          Continuar
        </button>
      </div>

      {/* Skip option */}
      <button
        onClick={handleSkip}
        className="text-gray-600 hover:text-blue-600 transition-colors text-center"
      >
        Verificar después
      </button>

      {/* Phone Verification Modal */}
      <PhoneVerificationModal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        onVerify={handlePhoneVerify}
        phoneNumber={getPhoneNumber()}
        onResendCode={handleResendCode}
      />
    </div>
  );
}
