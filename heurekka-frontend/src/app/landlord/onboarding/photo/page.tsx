'use client';

/**
 * Photo Upload Page
 * Página para subir foto de perfil
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/landlord/OnboardingContext';
import { ProgressIndicator } from '@/components/landlord/onboarding/ProgressIndicator';
import { ProfilePhotoUpload } from '@/components/landlord/onboarding/ProfilePhotoUpload';
import { toast } from 'sonner';

export default function PhotoUploadPage() {
  const router = useRouter();
  const { state, updateFormData, nextStep, previousStep } = useOnboarding();
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);

  const handlePhotoUpload = (base64Image: string) => {
    setPhotoBase64(base64Image);
    updateFormData({ profilePhotoUrl: base64Image } as any);
    toast.success('Foto subida correctamente');
  };

  const handlePhotoDelete = () => {
    setPhotoBase64(null);
    updateFormData({ profilePhotoUrl: null } as any);
  };

  const handleContinue = () => {
    if (photoBase64) {
      nextStep();
      router.push('/landlord/onboarding/verification');
    } else {
      toast.error('Por favor, sube una foto de perfil');
    }
  };

  const handleSkip = () => {
    toast.info('Puedes agregar tu foto de perfil después');
    nextStep();
    router.push('/landlord/onboarding/verification');
  };

  const handleBack = () => {
    previousStep();
    router.push('/landlord/onboarding/details');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Progress */}
      <ProgressIndicator currentStep={3} totalSteps={5} />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Agrega una foto profesional
        </h1>
        <p className="text-gray-600 mb-4">
          Los perfiles con foto reciben 3x más consultas
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span>Estadística verificada</span>
        </div>
      </div>

      {/* Upload component */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <ProfilePhotoUpload
          onUpload={handlePhotoUpload}
          currentPhoto={photoBase64}
          onDelete={handlePhotoDelete}
        />
      </div>

      {/* Recomendaciones */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Recomendaciones:</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Usa una foto profesional y reciente</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Muestra tu rostro claramente con buena iluminación</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Evita logos, imágenes de propiedades o fotos grupales</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Fondo simple y sin distracciones</span>
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
          disabled={!photoBase64}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
        >
          Continuar
        </button>
      </div>

      {/* Skip option */}
      <button
        onClick={handleSkip}
        className="text-gray-600 hover:text-blue-600 transition-colors text-center"
      >
        Omitir por ahora
      </button>
    </div>
  );
}
