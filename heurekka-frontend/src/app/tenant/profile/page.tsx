/**
 * Tenant Profile Page
 * Página para ver y editar el perfil del tenant
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTenantProfile, useUpdateTenantProfile } from '@/hooks/tenant/useTenantProfile';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function TenantProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading } = useTenantProfile();
  const updateProfile = useUpdateTenantProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [desiredBedrooms, setDesiredBedrooms] = useState<number[]>([]);
  const [desiredBathrooms, setDesiredBathrooms] = useState<number[]>([]);
  const [desiredParkingSpaces, setDesiredParkingSpaces] = useState<number[]>([]);
  const [hasPets, setHasPets] = useState(false);
  const [petDetails, setPetDetails] = useState('');

  // Initialize states when profile loads
  useEffect(() => {
    if (profile?.data) {
      setDesiredBedrooms(profile.data.desiredBedrooms || []);
      setDesiredBathrooms(profile.data.desiredBathrooms || []);
      setDesiredParkingSpaces(profile.data.desiredParkingSpaces || []);
      setHasPets(profile.data.hasPets || false);
      setPetDetails(profile.data.petDetails || '');
    }
  }, [profile?.data]);

  // Toggle functions for multi-select
  const toggleBedroom = (count: number) => {
    setDesiredBedrooms(prev =>
      prev.includes(count)
        ? prev.filter(c => c !== count)
        : [...prev, count].sort((a, b) => a - b)
    );
  };

  const toggleBathroom = (count: number) => {
    setDesiredBathrooms(prev =>
      prev.includes(count)
        ? prev.filter(c => c !== count)
        : [...prev, count].sort((a, b) => a - b)
    );
  };

  const toggleParkingSpace = (count: number) => {
    setDesiredParkingSpaces(prev =>
      prev.includes(count)
        ? prev.filter(c => c !== count)
        : [...prev, count].sort((a, b) => a - b)
    );
  };

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
        budgetMin: data.budgetMin ? parseInt(data.budgetMin) : undefined,
        budgetMax: data.budgetMax ? parseInt(data.budgetMax) : undefined,
        moveDate: data.moveDate ? convertMoveDateRangeToDate(data.moveDate) : undefined,
        preferredAreas: data.preferredAreas
          ? data.preferredAreas.split(',').map((area: string) => area.trim()).filter(Boolean)
          : [],
        propertyTypes: Array.isArray(data.propertyTypes) ? data.propertyTypes : [],
        hasPets: hasPets,
        petDetails: petDetails,
        hasReferences: data.hasReferences === 'true' || data.hasReferences === true,
        desiredBedrooms: desiredBedrooms,
        desiredBathrooms: desiredBathrooms,
        desiredParkingSpaces: desiredParkingSpaces,
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

        <div className="max-w-4xl mx-auto">
          {/* Main Content */}
          <div className="space-y-6">
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

                {/* Número de Habitaciones */}
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Número de Habitaciones
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => toggleBedroom(count)}
                          className={`
                            px-4 py-3 rounded-lg border-2 text-center transition-all
                            ${
                              desiredBedrooms.includes(count)
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }
                          `}
                        >
                          {count === 5 ? '5+' : count}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <InfoField
                    label="Número de Habitaciones"
                    value={
                      desiredBedrooms && desiredBedrooms.length > 0
                        ? desiredBedrooms
                            .sort((a: number, b: number) => a - b)
                            .map((n: number) => (n === 5 ? '5+' : n))
                            .join(', ') + ' habitaciones'
                        : undefined
                    }
                    isEditing={false}
                  />
                )}

                {/* Número de Baños */}
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Número de Baños
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => toggleBathroom(count)}
                          className={`
                            px-4 py-3 rounded-lg border-2 text-center transition-all
                            ${
                              desiredBathrooms.includes(count)
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }
                          `}
                        >
                          {count === 4 ? '4+' : count}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <InfoField
                    label="Número de Baños"
                    value={
                      desiredBathrooms && desiredBathrooms.length > 0
                        ? desiredBathrooms
                            .sort((a: number, b: number) => a - b)
                            .map((n: number) => (n === 4 ? '4+' : n))
                            .join(', ') + ' baños'
                        : undefined
                    }
                    isEditing={false}
                  />
                )}

                {/* Número de Parqueos */}
                {isEditing ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Número de Parqueos
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[0, 1, 2, 3].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => toggleParkingSpace(count)}
                          className={`
                            px-4 py-3 rounded-lg border-2 text-center transition-all
                            ${
                              desiredParkingSpaces.includes(count)
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                                : 'border-gray-200 hover:border-gray-300 text-gray-700'
                            }
                          `}
                        >
                          {count === 3 ? '3+' : count}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <InfoField
                    label="Número de Parqueos"
                    value={
                      desiredParkingSpaces && desiredParkingSpaces.length > 0
                        ? desiredParkingSpaces
                            .sort((a: number, b: number) => a - b)
                            .map((n: number) => (n === 3 ? '3+' : n))
                            .join(', ') + ' parqueos'
                        : undefined
                    }
                    isEditing={false}
                  />
                )}

                {/* Mascotas */}
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        ¿Tienes mascotas?
                      </label>
                      <Switch
                        checked={hasPets}
                        onCheckedChange={setHasPets}
                      />
                    </div>
                    {hasPets && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Detalles de mascotas
                        </label>
                        <Textarea
                          value={petDetails}
                          onChange={(e) => setPetDetails(e.target.value)}
                          placeholder="Ej: Pastor Alemán, 2 años"
                          className="w-full"
                          rows={3}
                          maxLength={200}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {petDetails.length}/200 caracteres
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <InfoField
                      label="Mascotas"
                      value={hasPets ? 'Sí' : 'No'}
                      isEditing={false}
                    />
                    {hasPets && petDetails && (
                      <div className="mt-2 pl-4 border-l-2 border-blue-200">
                        <p className="text-sm text-gray-600">{petDetails}</p>
                      </div>
                    )}
                  </div>
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
