'use client';

/**
 * Details Page
 * Formulario de información según el tipo seleccionado
 */

import React, { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/landlord/OnboardingContext';
import { ProgressIndicator } from '@/components/landlord/onboarding/ProgressIndicator';
import { IndividualOwnerForm } from '@/components/landlord/onboarding/IndividualOwnerForm';
import { RealEstateAgentForm } from '@/components/landlord/onboarding/RealEstateAgentForm';
import { PropertyCompanyForm } from '@/components/landlord/onboarding/PropertyCompanyForm';
import { toast } from 'sonner';

export default function DetailsPage() {
  const router = useRouter();
  const { state, updateFormData, nextStep, previousStep } = useOnboarding();
  const formRef = useRef<HTMLFormElement>(null);

  // Redirigir si no hay tipo seleccionado
  React.useEffect(() => {
    if (!state.landlordType) {
      router.push('/landlord/onboarding/type');
    }
  }, [state.landlordType, router]);

  const handleFormSubmit = (data: any) => {
    updateFormData(data);
    nextStep();
    router.push('/landlord/onboarding/photo');
  };

  const handleSkip = () => {
    toast.info('Puedes completar esta información después');
    nextStep();
    router.push('/landlord/onboarding/photo');
  };

  const handleBack = () => {
    previousStep();
    router.push('/landlord/onboarding/type');
  };

  const getTitleByType = () => {
    switch (state.landlordType) {
      case 'individual_owner':
        return 'Completa tu Perfil';
      case 'real_estate_agent':
        return 'Información Profesional';
      case 'property_company':
        return 'Información de la Empresa';
      default:
        return 'Información Básica';
    }
  };

  const renderForm = () => {
    const formData = state.formData;

    switch (state.landlordType) {
      case 'individual_owner':
        return (
          <IndividualOwnerForm
            onSubmit={handleFormSubmit}
            defaultValues={formData}
            onChange={updateFormData}
          />
        );
      case 'real_estate_agent':
        return (
          <RealEstateAgentForm
            onSubmit={handleFormSubmit}
            defaultValues={formData}
            onChange={updateFormData}
          />
        );
      case 'property_company':
        return (
          <PropertyCompanyForm
            onSubmit={handleFormSubmit}
            defaultValues={formData}
            onChange={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  if (!state.landlordType) {
    return null; // Se redirigirá en el useEffect
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Progress */}
      <ProgressIndicator currentStep={2} totalSteps={5} />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {getTitleByType()}
        </h1>
        <p className="text-gray-600">
          Completa la información para configurar tu perfil
        </p>
      </div>

      {/* Auto-save indicator */}
      {state.formData && Object.keys(state.formData).length > 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-green-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span>Cambios guardados automáticamente</span>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        {renderForm()}
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
          onClick={() => {
            // Trigger el submit del formulario interno
            const form = document.querySelector('form');
            if (form) {
              form.requestSubmit();
            }
          }}
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
        Completar después
      </button>
    </div>
  );
}
