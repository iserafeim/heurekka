'use client';

/**
 * Complete Page
 * Página de finalización del onboarding
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboarding } from '@/contexts/landlord/OnboardingContext';
import { useCompleteOnboarding } from '@/hooks/landlord/useOnboarding';
import { useBadges } from '@/hooks/landlord/useBadges';
import { toast } from 'sonner';

export default function CompletePage() {
  const router = useRouter();
  const { state } = useOnboarding();
  const { mutateAsync: completeOnboarding, isPending } = useCompleteOnboarding();
  const { data: badgesData, isLoading: badgesLoading } = useBadges();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Completar onboarding al montar
    const finishOnboarding = async () => {
      try {
        await completeOnboarding();
        setShowConfetti(true);
        toast.success('¡Perfil completado exitosamente!');
      } catch (error) {
        console.error('Error completing onboarding:', error);
        toast.error('Error al completar el perfil. Por favor, intenta de nuevo.');
      }
    };

    finishOnboarding();
  }, [completeOnboarding]);

  const handlePublishProperty = () => {
    router.push('/landlord/properties/create');
  };

  const handleExploreDashboard = () => {
    router.push('/landlord/dashboard');
  };

  const getLandlordTypeLabel = () => {
    switch (state.landlordType) {
      case 'individual_owner':
        return 'Propietario Individual';
      case 'real_estate_agent':
        return 'Agente Inmobiliario';
      case 'property_company':
        return 'Empresa de Gestión';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center text-center py-8 md:py-12 relative">
      {/* Confetti animation (simple CSS) */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-blue-500 rounded-full animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Success Icon */}
      <div className="text-8xl mb-8 animate-bounce">
        🎉
      </div>

      {/* Título */}
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        ¡Tu perfil está listo!
      </h1>

      {/* Subtítulo */}
      <p className="text-xl text-gray-600 mb-8 max-w-md">
        Ya puedes comenzar a publicar propiedades y recibir inquilinos calificados
      </p>

      {/* Resumen del perfil */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 mb-8 text-left">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen de tu perfil</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Tipo de cuenta</span>
            <span className="font-semibold text-gray-900">{getLandlordTypeLabel()}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b">
            <span className="text-gray-600">Completitud</span>
            <span className="font-semibold text-green-600">{state.completionScore}%</span>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-gray-600">Estado</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Activo
            </span>
          </div>
        </div>

        {/* Barra de completitud circular */}
        <div className="mt-6 flex items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - state.completionScore / 100)}`}
                className="text-blue-600 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{state.completionScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges ganados */}
      {!badgesLoading && badgesData?.data && badgesData.data.length > 0 && (
        <div className="w-full max-w-md bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-3">Badges ganados:</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {badgesData.data.map((badge) => (
              <span
                key={badge.id}
                className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium"
                title={badge.badgeDescription}
              >
                {badge.badgeIcon} {badge.badgeName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botones de acción */}
      <div className="w-full max-w-md flex flex-col gap-3 mb-6">
        <button
          onClick={handlePublishProperty}
          disabled={isPending}
          className="w-full px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          📝 Publicar Propiedad
        </button>

        <button
          onClick={handleExploreDashboard}
          disabled={isPending}
          className="w-full px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          📊 Explorar Dashboard
        </button>
      </div>

      {/* Mensaje motivacional */}
      <p className="text-sm text-gray-500 max-w-md">
        ¿Necesitas ayuda?{' '}
        <button
          onClick={() => router.push('/ayuda')}
          className="text-blue-600 hover:underline"
        >
          Visita nuestro centro de ayuda
        </button>
      </p>

      {/* Loading overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Finalizando configuración...</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  );
}
