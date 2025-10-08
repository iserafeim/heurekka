/**
 * Profile Completion Page
 * Página del wizard de completación de perfil
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProfileCompletionWizard } from '@/components/tenant/profile/ProfileCompletionWizard';

export default function ProfileCompletePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Completa tu Perfil
          </h1>
          <p className="text-gray-600">
            Solo te tomará 2 minutos y podrás contactar propiedades más rápido
          </p>
        </div>

        <ProfileCompletionWizard
          onComplete={() => router.push('/tenant/dashboard')}
          onCancel={() => router.push('/tenant/dashboard')}
        />
      </div>
    </div>
  );
}
