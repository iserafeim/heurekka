'use client';

/**
 * Welcome Page
 * Página de bienvenida del onboarding
 */

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/landlord/OnboardingContext';

export default function WelcomePage() {
  const router = useRouter();
  const { nextStep } = useOnboarding();

  const handleStart = () => {
    console.log('Comenzar clicked - navigating to type selection');
    nextStep();
    router.push('/landlord/onboarding/type');
  };

  // Auto-advance después de 5 segundos (opcional)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Descomenta para activar auto-advance
      // handleStart();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center text-center py-8 md:py-12">
      {/* Icon animado */}
      <div className="text-8xl mb-8 animate-bounce">
        🏠
      </div>

      {/* Título */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        ¡Bienvenido a Heurekka!
      </h1>

      {/* Subtítulo */}
      <p className="text-xl text-gray-600 mb-12 max-w-md">
        Configura tu perfil en solo 3 minutos y comienza a recibir inquilinos hoy
      </p>

      {/* Beneficios */}
      <div className="space-y-4 mb-12 text-left max-w-md md:w-full mx-auto">
        <div className="flex items-start gap-3">
          <div className="text-green-500 text-2xl flex-shrink-0">✓</div>
          <div>
            <h3 className="font-semibold text-gray-900">Publicación gratuita</h3>
            <p className="text-sm text-gray-600">Sin costos ocultos ni comisiones</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="text-green-500 text-2xl flex-shrink-0">✓</div>
          <div>
            <h3 className="font-semibold text-gray-900">Inquilinos verificados</h3>
            <p className="text-sm text-gray-600">Todos los perfiles son validados</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="text-green-500 text-2xl flex-shrink-0">✓</div>
          <div>
            <h3 className="font-semibold text-gray-900">Gestión simplificada</h3>
            <p className="text-sm text-gray-600">Herramientas para administrar tus propiedades</p>
          </div>
        </div>
      </div>

      {/* Botón principal */}
      <button
        onClick={handleStart}
        className="w-full max-w-md px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
      >
        Comenzar
      </button>

      {/* Link secundario */}
      <button
        onClick={() => router.push('/login')}
        className="mt-4 text-gray-600 hover:text-blue-600 transition-colors"
      >
        Ya tengo una cuenta
      </button>
    </div>
  );
}
