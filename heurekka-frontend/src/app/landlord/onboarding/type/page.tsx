'use client';

/**
 * Type Selection Page
 * Selección del tipo de arrendador
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/landlord/OnboardingContext';
import { ProgressIndicator } from '@/components/landlord/onboarding/ProgressIndicator';
import { LandlordTypeCard } from '@/components/landlord/onboarding/LandlordTypeCard';
import { LANDLORD_TYPE_OPTIONS, type LandlordType } from '@/types/landlord';

export default function TypeSelectionPage() {
  const router = useRouter();
  const { state, setLandlordType, nextStep } = useOnboarding();
  const [selectedType, setSelectedType] = useState<LandlordType | undefined>(state.landlordType);

  const handleContinue = () => {
    if (selectedType) {
      setLandlordType(selectedType);
      nextStep();
      router.push('/landlord/onboarding/details');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Progress */}
      <ProgressIndicator currentStep={1} totalSteps={5} />

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ¿Qué tipo de arrendador eres?
        </h1>
        <p className="text-gray-600">
          Selecciona la opción que mejor te describe
        </p>
      </div>

      {/* Tarjetas de selección */}
      <div className="flex flex-col gap-4">
        {LANDLORD_TYPE_OPTIONS.map((option) => (
          <LandlordTypeCard
            key={option.type}
            type={option.type}
            icon={option.icon}
            title={option.title}
            description={option.description}
            selected={selectedType === option.type}
            onClick={() => setSelectedType(option.type)}
          />
        ))}
      </div>

      {/* Detalles del tipo seleccionado */}
      {selectedType && (
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">¿Qué incluye?</h3>
          <ul className="space-y-2">
            {LANDLORD_TYPE_OPTIONS.find(o => o.type === selectedType)?.details.map((detail, index) => (
              <li key={index} className="flex items-center gap-2 text-blue-800">
                <div className="text-blue-600">✓</div>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Botón continuar */}
      <button
        onClick={handleContinue}
        disabled={!selectedType}
        className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-none"
      >
        Continuar
      </button>

      {/* Info adicional */}
      <p className="text-sm text-gray-500 text-center">
        ¿Puedo cambiar después?<br />
        Sí, puedes actualizar tu tipo cuando lo necesites
      </p>
    </div>
  );
}
