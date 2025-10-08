/**
 * Tenant Profile Page
 * Página para ver y editar el perfil del tenant
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileCompletionProgress } from '@/components/tenant/profile/ProfileCompletionProgress';
import { useTenantProfile, useProfileCompletionStatus } from '@/hooks/tenant/useTenantProfile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit } from 'lucide-react';

export default function TenantProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useTenantProfile();
  const { data: completionStatus } = useProfileCompletionStatus();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-gray-600 mt-1">Gestiona tu información y preferencias</p>
            </div>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)}>
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancelar' : 'Editar'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Completitud del Perfil
              </h2>
              {completionStatus?.data && (
                <ProfileCompletionProgress
                  percentage={completionStatus.data.percentage}
                  missingFields={completionStatus.data.missingFields}
                  nextSteps={completionStatus.data.nextSteps}
                  showDetails={true}
                />
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Personal Info */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información Personal
              </h2>
              <div className="space-y-4">
                <InfoField
                  label="Nombre Completo"
                  value={profile?.data?.fullName}
                  isEditing={isEditing}
                />
                <InfoField
                  label="Teléfono"
                  value={profile?.data?.phone}
                  isEditing={isEditing}
                />
                <InfoField
                  label="Ocupación"
                  value={profile?.data?.occupation}
                  isEditing={isEditing}
                />
              </div>
            </section>

            {/* Search Preferences */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Preferencias de Búsqueda
              </h2>
              <div className="space-y-4">
                <InfoField
                  label="Presupuesto"
                  value={
                    profile?.data?.budgetMin && profile?.data?.budgetMax
                      ? `L.${profile.data.budgetMin.toLocaleString()} - L.${profile.data.budgetMax.toLocaleString()}`
                      : undefined
                  }
                  isEditing={isEditing}
                />
                <InfoField
                  label="Fecha de Mudanza"
                  value={
                    profile?.data?.moveDate
                      ? new Date(profile.data.moveDate).toLocaleDateString('es-HN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : undefined
                  }
                  isEditing={isEditing}
                />
                <InfoField
                  label="Número de Ocupantes"
                  value={profile?.data?.occupants}
                  isEditing={isEditing}
                />
                <InfoField
                  label="Zonas Preferidas"
                  value={profile?.data?.preferredAreas?.join(', ')}
                  isEditing={isEditing}
                />
                <InfoField
                  label="Tipos de Propiedad"
                  value={profile?.data?.propertyTypes?.map((type: string) =>
                    type === 'apartment' ? 'Apartamento' : type === 'house' ? 'Casa' : type
                  ).join(', ')}
                  isEditing={isEditing}
                />
                <InfoField
                  label="Mascotas"
                  value={profile?.data?.hasPets ? (profile.data.petDetails || 'Sí') : 'No'}
                  isEditing={isEditing}
                />
                <InfoField
                  label="Referencias"
                  value={profile?.data?.hasReferences ? 'Sí' : 'No'}
                  isEditing={isEditing}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, isEditing }: any) {
  if (isEditing) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type="text"
          defaultValue={value}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <p className="text-gray-900">{value || 'No especificado'}</p>
    </div>
  );
}
