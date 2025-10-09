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
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <ProfileCompletionWizard
          onComplete={() => router.push('/tenant/dashboard')}
          onCancel={() => router.push('/tenant/dashboard')}
        />
      </div>
    </div>
  );
}
