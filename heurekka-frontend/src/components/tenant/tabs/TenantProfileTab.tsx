'use client';

import React, { useState } from 'react';
import { useTenantDashboard } from '@/hooks/tenant/useTenantDashboard';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import {
  Edit,
  Calendar,
  Home,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { TEGUCIGALPA_AREAS } from '@/types/tenant';

export function TenantProfileTab() {
  const utils = trpc.useUtils();
  const { data: dashboardData } = useTenantDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  // Mutation for updating profile
  const updateProfile = trpc.tenantProfile.update.useMutation({
    onSuccess: async (updatedProfile) => {
      // Optimistically update the cache with the new data
      const currentDashboardData = utils.tenantDashboard.getData.getData();
      if (currentDashboardData && editedProfile) {
        utils.tenantDashboard.getData.setData(undefined, {
          ...currentDashboardData,
          data: {
            ...currentDashboardData.data,
            profile: {
              ...currentDashboardData.data.profile,
              ...editedProfile,
            }
          }
        });
      }

      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);

      // Invalidate queries in the background to ensure data consistency
      await Promise.all([
        utils.tenantDashboard.getData.invalidate(),
        utils.tenantProfile.getCurrent.invalidate(),
      ]);
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el perfil');
    }
  });

  // Handle edit mode
  const handleEditProfile = () => {
    if (dashboardData?.data?.profile) {
      setEditedProfile({
        fullName: dashboardData.data.profile.fullName,
        phone: dashboardData.data.profile.phone,
        email: (dashboardData.data.profile as any).email || '',
        password: '',
        budgetMin: dashboardData.data.profile.budgetMin,
        budgetMax: dashboardData.data.profile.budgetMax,
        moveDate: dashboardData.data.profile.moveDate,
        preferredAreas: dashboardData.data.profile.preferredAreas || [],
        propertyTypes: dashboardData.data.profile.propertyTypes || [],
        desiredBedrooms: dashboardData.data.profile.desiredBedrooms || [],
        desiredBathrooms: dashboardData.data.profile.desiredBathrooms || [],
        desiredParkingSpaces: dashboardData.data.profile.desiredParkingSpaces || [],
        hasPets: dashboardData.data.profile.hasPets,
        petDetails: dashboardData.data.profile.petDetails
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile(null);
  };

  const handleSaveProfile = async () => {
    if (!editedProfile) return;

    // Validation
    if (!editedProfile.fullName?.trim()) {
      toast.error('El nombre completo es requerido');
      return;
    }

    if (!editedProfile.phone?.trim()) {
      toast.error('El número de teléfono es requerido');
      return;
    }

    // Validate phone format (must be 9999-9999)
    const phoneRegex = /^[0-9]{4}-[0-9]{4}$/;
    if (!phoneRegex.test(editedProfile.phone)) {
      toast.error('El formato del teléfono debe ser 9999-9999');
      return;
    }

    // Validate email format
    if (editedProfile.email && editedProfile.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editedProfile.email)) {
        toast.error('El formato del email no es válido');
        return;
      }
    }

    if (editedProfile.budgetMin && editedProfile.budgetMax && editedProfile.budgetMin > editedProfile.budgetMax) {
      toast.error('El presupuesto mínimo no puede ser mayor que el máximo');
      return;
    }

    try {
      // Format the data before sending to backend
      const formattedData = {
        ...editedProfile,
        // moveDate is already in text format, send as-is
        // Ensure empty arrays are sent as undefined
        propertyTypes: editedProfile.propertyTypes?.length > 0 ? editedProfile.propertyTypes : undefined,
        preferredAreas: editedProfile.preferredAreas?.length > 0 ? editedProfile.preferredAreas : undefined,
        desiredBedrooms: editedProfile.desiredBedrooms?.length > 0 ? editedProfile.desiredBedrooms : undefined,
        desiredBathrooms: editedProfile.desiredBathrooms?.length > 0 ? editedProfile.desiredBathrooms : undefined,
        desiredParkingSpaces: editedProfile.desiredParkingSpaces?.length > 0 ? editedProfile.desiredParkingSpaces : undefined,
        petDetails: editedProfile.hasPets ? editedProfile.petDetails : undefined,
        // Only send email if it was changed
        email: editedProfile.email?.trim() || undefined,
        // Only send password if it was provided
        password: editedProfile.password?.trim() || undefined,
      };

      await updateProfile.mutateAsync(formattedData);
    } catch (error) {
      // Error handled by mutation onError
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (!dashboardData?.data?.profile) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50 transition-shadow duration-300 p-3 sm:p-6 md:p-8">
      {/* Section Header */}
      <div className="mb-4 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Información Personal
        </h2>
      </div>

      {/* Avatar Section */}
      <div className="mb-4 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl sm:text-3xl flex-shrink-0 shadow-lg ring-2 sm:ring-4 ring-blue-100">
            {dashboardData.data.profile.fullName.split(' ').map((n: string) => n[0]).join('')}
          </div>
        </div>
      </div>

      {/* Personal Info Grid - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
        {/* Full Name */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 block">
            Nombre Completo
          </label>
          {isEditing ? (
            <div className="p-2 sm:p-3 bg-white rounded-lg border border-blue-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-150">
              <input
                type="text"
                value={editedProfile?.fullName || ''}
                onChange={(e) => handleFieldChange('fullName', e.target.value)}
                className="w-full text-sm sm:text-base font-semibold text-gray-900 outline-none bg-transparent"
                placeholder="Ingresa tu nombre completo"
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                Esto se mostrará en tu perfil público
              </p>
            </div>
          ) : (
            <div className="p-2.5 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                {dashboardData.data.profile.fullName}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                Esto se mostrará en tu perfil público
              </p>
            </div>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 block">
            Número de Teléfono
          </label>
          {isEditing ? (
            <div className="p-2 sm:p-3 bg-white rounded-lg border border-blue-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-150">
              <input
                type="text"
                value={editedProfile?.phone || ''}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9]/g, '');
                  if (value.length > 4) {
                    value = value.slice(0, 4) + '-' + value.slice(4, 8);
                  }
                  handleFieldChange('phone', value);
                }}
                className="w-full text-sm sm:text-base font-semibold text-gray-900 outline-none bg-transparent"
                placeholder="9999-9999"
                maxLength={9}
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                Usado para contacto con propietarios
              </p>
            </div>
          ) : (
            <div className="p-2.5 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                {dashboardData.data.profile.phone}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                Usado para contacto con propietarios
              </p>
            </div>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 block">
            Correo Electrónico
          </label>
          {isEditing ? (
            <div className="p-2 sm:p-3 bg-white rounded-lg border border-blue-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-150">
              <input
                type="email"
                value={editedProfile?.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className="w-full text-sm sm:text-base font-semibold text-gray-900 outline-none bg-transparent"
                placeholder="correo@ejemplo.com"
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                Te enviaremos confirmaciones a este email
              </p>
            </div>
          ) : (
            <div className="p-2.5 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                {(dashboardData.data.profile as any).email || 'No registrado'}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                Te enviaremos confirmaciones a este email
              </p>
            </div>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 block">
            {isEditing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
          </label>
          {isEditing ? (
            <div className="p-2 sm:p-3 bg-white rounded-lg border border-blue-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-150">
              <input
                type="password"
                value={editedProfile?.password || ''}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className="w-full text-sm sm:text-base font-semibold text-gray-900 outline-none bg-transparent"
                placeholder="Deja vacío para mantener la actual"
              />
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                Solo ingresa una nueva contraseña si deseas cambiarla
              </p>
            </div>
          ) : (
            <div className="p-2.5 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm sm:text-base font-semibold text-gray-900">
                ••••••••
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                {(dashboardData.data.profile as any).passwordUpdatedAt
                  ? `Última actualización: ${new Date((dashboardData.data.profile as any).passwordUpdatedAt).toLocaleDateString('es-HN', { year: 'numeric', month: 'long', day: 'numeric' })}`
                  : 'Haz clic en Editar Perfil para cambiar tu contraseña'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4 sm:mb-8"></div>

      {/* Unified Preferences Section */}
      <div className="mb-4 sm:mb-8">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-6">
          Preferencias de Búsqueda
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-4 sm:gap-y-8">
          {/* Left Column - Qué, Dónde y Cuándo */}
          <div className="space-y-4 sm:space-y-8">
            {/* 1. Tipo de Propiedad */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                Tipo de Propiedad
              </p>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'apartment', label: 'Apartamento' },
                    { value: 'house', label: 'Casa' },
                    { value: 'room', label: 'Habitación' }
                  ].map((type) => {
                    const isSelected = editedProfile?.propertyTypes?.includes(type.value) || false;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          const current = editedProfile?.propertyTypes || [];
                          const updated = isSelected
                            ? current.filter((t: string) => t !== type.value)
                            : [...current, type.value];
                          handleFieldChange('propertyTypes', updated);
                        }}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-150 active:scale-[0.98]",
                          isSelected
                            ? "bg-blue-50 text-gray-900 border-blue-400 shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                        )}
                      >
                        <Home className={cn("w-4 h-4 -mt-px", isSelected ? "text-gray-700" : "text-gray-500")} />
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'apartment', label: 'Apartamento' },
                    { value: 'house', label: 'Casa' },
                    { value: 'room', label: 'Habitación' }
                  ].map((type) => {
                    const isSelected = dashboardData.data.profile.propertyTypes?.includes(type.value) || false;
                    return (
                      <span
                        key={type.value}
                        className={cn(
                          "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 cursor-default select-none",
                          isSelected
                            ? "bg-blue-50 text-gray-900 border-blue-400"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        )}
                      >
                        <Home className={cn("w-4 h-4 -mt-px", isSelected ? "text-gray-700" : "text-gray-500")} />
                        {type.label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Presupuesto Mensual */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                Presupuesto Mensual
              </p>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wide">Mínimo</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">L.</span>
                        <input
                          type="number"
                          value={editedProfile?.budgetMin || ''}
                          onChange={(e) => handleFieldChange('budgetMin', parseInt(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2.5 bg-white border border-blue-200 rounded-lg text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wide">Máximo</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">L.</span>
                        <input
                          type="number"
                          value={editedProfile?.budgetMax || ''}
                          onChange={(e) => handleFieldChange('budgetMax', parseInt(e.target.value) || 0)}
                          className="w-full pl-8 pr-3 py-2.5 bg-white border border-blue-200 rounded-lg text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="max-w-md">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wide">Mínimo</label>
                      <div className="px-4 py-2.5 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-gray-500">L.</span>
                          <span className="text-sm font-medium text-gray-900">
                            {dashboardData.data.profile.budgetMin?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block uppercase tracking-wide">Máximo</label>
                      <div className="px-4 py-2.5 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-gray-500">L.</span>
                          <span className="text-sm font-medium text-gray-900">
                            {dashboardData.data.profile.budgetMax?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Zonas Preferidas */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                Zonas Preferidas
              </p>
              {isEditing ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border border-blue-200 rounded-lg p-3 bg-white">
                    {TEGUCIGALPA_AREAS.map((area) => {
                      const isSelected = editedProfile?.preferredAreas?.includes(area) || false;
                      return (
                        <button
                          key={area}
                          type="button"
                          onClick={() => {
                            const current = editedProfile?.preferredAreas || [];
                            const updated = isSelected
                              ? current.filter((a: string) => a !== area)
                              : [...current, area];
                            handleFieldChange('preferredAreas', updated);
                          }}
                          className={cn(
                            "px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-150 active:scale-[0.98]",
                            isSelected
                              ? "bg-blue-50 text-gray-900 border border-blue-400 shadow-sm"
                              : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-blue-300"
                          )}
                        >
                          {area}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-500">
                    Seleccionadas: {editedProfile?.preferredAreas?.length || 0}
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {dashboardData.data.profile.preferredAreas?.length > 0 ? (
                    dashboardData.data.profile.preferredAreas.map((area: string) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-900 rounded-lg text-sm font-medium border border-blue-400 cursor-default select-none"
                      >
                        <MapPin className="w-4 h-4 text-gray-700 -mt-px" />
                        {area}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No especificado</span>
                  )}
                </div>
              )}
            </div>

            {/* 4. Fecha de Mudanza */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                ¿Cuándo deseas mudarte?
              </p>
              {isEditing ? (
                <select
                  value={editedProfile?.moveDate || ''}
                  onChange={(e) => handleFieldChange('moveDate', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                >
                  <option value="">Selecciona el periodo...</option>
                  <option value="Menos de 1 mes">Menos de 1 mes</option>
                  <option value="1-3 meses">1-3 meses</option>
                  <option value="3-6 meses">3-6 meses</option>
                  <option value="Más de 6 meses">Más de 6 meses</option>
                  <option value="Flexible">Flexible</option>
                </select>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {dashboardData.data.profile.moveDate ? (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-900 rounded-lg text-sm font-medium border border-blue-400 cursor-default select-none">
                      <Calendar className="w-4 h-4 text-gray-700 -mt-px" />
                      {dashboardData.data.profile.moveDate}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">No especificado</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Características de la Propiedad */}
          <div className="space-y-4 sm:space-y-8">
            {/* 5. Habitaciones */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                Habitaciones
              </p>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((count: number) => {
                    const isSelected = editedProfile?.desiredBedrooms?.includes(count) || false;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          const current = editedProfile?.desiredBedrooms || [];
                          const updated = isSelected
                            ? current.filter((c: number) => c !== count)
                            : [...current, count];
                          handleFieldChange('desiredBedrooms', updated);
                        }}
                        className={cn(
                          "inline-flex items-center justify-center w-14 h-11 rounded-lg text-sm font-medium border transition-all duration-150 active:scale-[0.98]",
                          isSelected
                            ? "bg-blue-50 text-gray-900 border-blue-400 shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                        )}
                      >
                        {count === 5 ? '5+' : count}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((count: number) => {
                    const isSelected = dashboardData.data.profile.desiredBedrooms?.includes(count) || false;
                    return (
                      <span
                        key={count}
                        className={cn(
                          "inline-flex items-center justify-center w-14 h-11 rounded-lg text-sm font-medium border transition-all duration-200 cursor-default select-none",
                          isSelected
                            ? "bg-blue-50 text-gray-900 border-blue-400"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        )}
                      >
                        {count === 5 ? '5+' : count}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 6. Baños */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                Baños
              </p>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((count: number) => {
                    const isSelected = editedProfile?.desiredBathrooms?.includes(count) || false;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          const current = editedProfile?.desiredBathrooms || [];
                          const updated = isSelected
                            ? current.filter((c: number) => c !== count)
                            : [...current, count];
                          handleFieldChange('desiredBathrooms', updated);
                        }}
                        className={cn(
                          "inline-flex items-center justify-center w-14 h-11 rounded-lg text-sm font-medium border transition-all duration-150 active:scale-[0.98]",
                          isSelected
                            ? "bg-blue-50 text-gray-900 border-blue-400 shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                        )}
                      >
                        {count === 5 ? '5+' : count}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((count: number) => {
                    const isSelected = dashboardData.data.profile.desiredBathrooms?.includes(count) || false;
                    return (
                      <span
                        key={count}
                        className={cn(
                          "inline-flex items-center justify-center w-14 h-11 rounded-lg text-sm font-medium border transition-all duration-200 cursor-default select-none",
                          isSelected
                            ? "bg-blue-50 text-gray-900 border-blue-400"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        )}
                      >
                        {count === 5 ? '5+' : count}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 7. Parqueos */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                Parqueos
              </p>
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5].map((count: number) => {
                    const isSelected = editedProfile?.desiredParkingSpaces?.includes(count) || false;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => {
                          const current = editedProfile?.desiredParkingSpaces || [];
                          const updated = isSelected
                            ? current.filter((c: number) => c !== count)
                            : [...current, count];
                          handleFieldChange('desiredParkingSpaces', updated);
                        }}
                        className={cn(
                          "inline-flex items-center justify-center w-14 h-11 rounded-lg text-sm font-medium border transition-all duration-150 active:scale-[0.98]",
                          isSelected
                            ? "bg-blue-50 text-gray-900 border-blue-400 shadow-sm"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                        )}
                      >
                        {count === 5 ? '5+' : count}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5].map((count: number) => {
                    const isSelected = dashboardData.data.profile.desiredParkingSpaces?.includes(count) || false;
                    return (
                      <span
                        key={count}
                        className={cn(
                          "inline-flex items-center justify-center w-14 h-11 rounded-lg text-sm font-medium border transition-all duration-200 cursor-default select-none",
                          isSelected
                            ? "bg-blue-50 text-gray-900 border-blue-400"
                            : "bg-gray-50 text-gray-600 border-gray-200"
                        )}
                      >
                        {count === 5 ? '5+' : count}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 8. Mascotas */}
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                Mascotas
              </p>
              {isEditing ? (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange('hasPets', true)}
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 active:scale-[0.98] inline-flex items-center justify-center gap-1.5",
                        editedProfile?.hasPets
                          ? "bg-blue-50 text-gray-900 border-blue-400 shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                      )}
                    >
                      <span className="text-base">🐾</span>
                      Sí
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleFieldChange('hasPets', false);
                        handleFieldChange('petDetails', null);
                      }}
                      className={cn(
                        "flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-150 active:scale-[0.98]",
                        !editedProfile?.hasPets
                          ? "bg-blue-50 text-gray-900 border-blue-400 shadow-sm"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"
                      )}
                    >
                      No
                    </button>
                  </div>
                  {editedProfile?.hasPets && (
                    <input
                      type="text"
                      value={editedProfile?.petDetails || ''}
                      onChange={(e) => handleFieldChange('petDetails', e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-sm text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                      placeholder="Ej: 1 perro pequeño, 2 gatos"
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {dashboardData.data.profile.hasPets ? (
                    dashboardData.data.profile.petDetails ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-900 rounded-lg text-sm font-medium border border-blue-400 cursor-default select-none">
                        <span className="text-base">🐾</span>
                        {dashboardData.data.profile.petDetails}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-900 rounded-lg text-sm font-medium border border-blue-400 cursor-default select-none">
                        <span className="text-base">🐾</span>
                        Sí
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200 cursor-default select-none">
                      No
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-4 sm:my-8"></div>

      {/* Edit Profile Buttons */}
      <div className="flex justify-end gap-3">
        {isEditing ? (
          <>
            <Button
              onClick={handleCancelEdit}
              size="lg"
              variant="outline"
              disabled={updateProfile.isLoading}
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg px-6 py-3"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveProfile}
              size="lg"
              disabled={updateProfile.isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 flex items-center gap-2 shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all"
            >
              {updateProfile.isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Edit className="h-5 w-5" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleEditProfile}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 flex items-center gap-2 shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all"
          >
            <Edit className="h-5 w-5" />
            Editar Perfil
          </Button>
        )}
      </div>
    </section>
  );
}
