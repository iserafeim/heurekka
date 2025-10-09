/**
 * Tenant Profile Page
 * Página para ver y editar el perfil del tenant
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProfileCompletionProgress } from '@/components/tenant/profile/ProfileCompletionProgress';
import { useTenantProfile, useProfileCompletionStatus, useUpdateTenantProfile } from '@/hooks/tenant/useTenantProfile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

export default function TenantProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useTenantProfile();
  const { data: completionStatus } = useProfileCompletionStatus();
  const updateProfile = useUpdateTenantProfile();
  const [isEditing, setIsEditing] = useState(false);

  const getMoveDateValue = (dateString?: string): string => {
    if (!dateString) return '1-3-months';

    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) return 'less-than-1-month';
    if (diffDays <= 90) return '1-3-months';
    if (diffDays <= 365) return '3-months-1-year';
    return 'more-than-1-year';
  };

  const { register, handleSubmit, formState: { isDirty } } = useForm({
    values: profile?.data ? {
      ...profile.data,
      preferredAreas: profile.data.preferredAreas?.join(', ') || '',
      moveDate: getMoveDateValue(profile.data.moveDate),
      hasPets: profile.data.hasPets?.toString() || 'false',
      hasReferences: profile.data.hasReferences?.toString() || 'false',
    } : {},
  });

  const convertMoveDateRangeToDate = (range: string): string => {
    const today = new Date();
    let daysToAdd = 60;

    switch (range) {
      case 'less-than-1-month':
        daysToAdd = 15;
        break;
      case '1-3-months':
        daysToAdd = 60;
        break;
      case '3-months-1-year':
        daysToAdd = 180;
        break;
      case 'more-than-1-year':
        daysToAdd = 365;
        break;
      case 'not-sure':
        daysToAdd = 90;
        break;
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);
    return targetDate.toISOString().split('T')[0];
  };

  const onSave = async (data: any) => {
    try {
      // Procesar y transformar los datos
      const updateData: any = {
        fullName: data.fullName,
        phone: data.phone,
        occupation: data.occupation,
        occupants: data.occupants,
        budgetMin: data.budgetMin ? parseInt(data.budgetMin) : undefined,
        budgetMax: data.budgetMax ? parseInt(data.budgetMax) : undefined,
        moveDate: data.moveDate ? convertMoveDateRangeToDate(data.moveDate) : undefined,
        preferredAreas: data.preferredAreas
          ? data.preferredAreas.split(',').map((area: string) => area.trim()).filter(Boolean)
          : [],
        propertyTypes: Array.isArray(data.propertyTypes) ? data.propertyTypes : [],
        hasPets: data.hasPets === 'true' || data.hasPets === true,
        hasReferences: data.hasReferences === 'true' || data.hasReferences === true,
      };

      await updateProfile.mutateAsync(updateData);
      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error al actualizar el perfil');
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const getMoveDateRange = (dateString: string): string => {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Lo antes posible';
    if (diffDays <= 30) return 'Menos de 1 mes';
    if (diffDays <= 90) return '1 - 3 meses';
    if (diffDays <= 365) return '3 meses - 1 año';
    return 'Más de 1 año';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-6"></div>
          <p className="text-lg font-medium text-gray-900">Cargando perfil...</p>
          <p className="text-sm text-gray-500 mt-2">Solo un momento</p>
        </div>
      </div>
    );
  }

  return (
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
          {isEditing ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateProfile.isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit(onSave)}
                disabled={updateProfile.isPending || !isDirty}
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
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
            <section className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Información Personal
              </h2>
              <div className="space-y-4">
                <InfoField
                  label="Nombre Completo"
                  value={profile?.data?.fullName}
                  isEditing={isEditing}
                  fieldName="fullName"
                  register={register}
                />
                <InfoField
                  label="Teléfono"
                  value={profile?.data?.phone}
                  isEditing={isEditing}
                  fieldName="phone"
                  register={register}
                />
                <InfoField
                  label="Ocupación"
                  value={profile?.data?.occupation}
                  isEditing={isEditing}
                  fieldName="occupation"
                  register={register}
                />
              </div>
            </section>

            {/* Search Preferences */}
            <section className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Preferencias de Búsqueda
              </h2>
              <div className="space-y-4">
                {/* Presupuesto */}
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Presupuesto
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                        <input
                          type="number"
                          {...register('budgetMin')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="5000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                        <input
                          type="number"
                          {...register('budgetMax')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="20000"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <InfoField
                    label="Presupuesto"
                    value={
                      profile?.data?.budgetMin && profile?.data?.budgetMax
                        ? `L.${profile.data.budgetMin.toLocaleString()} - L.${profile.data.budgetMax.toLocaleString()}`
                        : undefined
                    }
                    isEditing={false}
                  />
                )}

                {/* Fecha de Mudanza */}
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ¿Cuándo deseas mudarte?
                    </label>
                    <select
                      {...register('moveDate')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="less-than-1-month">Menos de 1 mes</option>
                      <option value="1-3-months">1 - 3 meses</option>
                      <option value="3-months-1-year">3 meses - 1 año</option>
                      <option value="more-than-1-year">Más de 1 año</option>
                      <option value="not-sure">Aún no estoy seguro</option>
                    </select>
                  </div>
                ) : (
                  <InfoField
                    label="¿Cuándo deseas mudarte?"
                    value={
                      profile?.data?.moveDate
                        ? getMoveDateRange(profile.data.moveDate)
                        : undefined
                    }
                    isEditing={false}
                  />
                )}

                <InfoField
                  label="Número de Ocupantes"
                  value={profile?.data?.occupants}
                  isEditing={isEditing}
                  fieldName="occupants"
                  register={register}
                />

                {/* Zonas Preferidas */}
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zonas Preferidas
                    </label>
                    <input
                      type="text"
                      {...register('preferredAreas')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Los Próceres, Lomas del Guijarro"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separa las zonas con comas</p>
                  </div>
                ) : (
                  <InfoField
                    label="Zonas Preferidas"
                    value={profile?.data?.preferredAreas?.join(', ')}
                    isEditing={false}
                  />
                )}

                {/* Tipos de Propiedad */}
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipos de Propiedad
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value="apartment"
                          {...register('propertyTypes')}
                          defaultChecked={profile?.data?.propertyTypes?.includes('apartment')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">Apartamento</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value="house"
                          {...register('propertyTypes')}
                          defaultChecked={profile?.data?.propertyTypes?.includes('house')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">Casa</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          value="room"
                          {...register('propertyTypes')}
                          defaultChecked={profile?.data?.propertyTypes?.includes('room')}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm">Habitación</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <InfoField
                    label="Tipos de Propiedad"
                    value={profile?.data?.propertyTypes?.map((type: string) => {
                      if (type === 'apartment') return 'Apartamento';
                      if (type === 'house') return 'Casa';
                      if (type === 'room') return 'Habitación';
                      return type;
                    }).join(', ')}
                    isEditing={false}
                  />
                )}

                {/* Mascotas */}
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ¿Tienes mascotas?
                    </label>
                    <select
                      {...register('hasPets')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="false">No</option>
                      <option value="true">Sí</option>
                    </select>
                  </div>
                ) : (
                  <InfoField
                    label="Mascotas"
                    value={profile?.data?.hasPets ? (profile.data.petDetails || 'Sí') : 'No'}
                    isEditing={false}
                  />
                )}

                {/* Referencias */}
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ¿Tienes referencias?
                    </label>
                    <select
                      {...register('hasReferences')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="false">No</option>
                      <option value="true">Sí</option>
                    </select>
                  </div>
                ) : (
                  <InfoField
                    label="Referencias"
                    value={profile?.data?.hasReferences ? 'Sí' : 'No'}
                    isEditing={false}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
    </div>
  );
}

function InfoField({ label, value, isEditing, fieldName, register, type = 'text', readOnly = false }: any) {
  if (isEditing && !readOnly && fieldName && register) {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <input
          type={type}
          {...register(fieldName)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
