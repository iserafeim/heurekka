/**
 * Profile Completion Page
 * Página del wizard de completación de perfil
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ProfileCompletionWizard } from '@/components/tenant/profile/ProfileCompletionWizard';
import { useLandlordProfile } from '@/hooks/landlord/useLandlordProfile';

export default function ProfileCompletePage() {
  const router = useRouter();
  const { data: landlordProfile } = useLandlordProfile();

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <ProfileCompletionWizard
          onComplete={() => router.push('/dashboard')}
          onCancel={() => router.push('/dashboard')}
          landlordProfile={landlordProfile?.data}
        />
      </div>
    </div>
  );
}
