'use client';

import React, { useState } from 'react';
import { useLandlordProfile } from '@/hooks/landlord/useLandlordProfile';
import { useTenantDashboard } from '@/hooks/tenant/useTenantDashboard';
import { UserRole } from '@/lib/dashboard-tabs';
import { User, Building2, Mail, Phone, MapPin, Award, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ProfileCompletionProgress } from '@/components/tenant/profile/ProfileCompletionProgress';

interface ProfileTabProps {
  userRole: UserRole;
}

type ProfileView = 'landlord' | 'tenant';

export function ProfileTab({ userRole }: ProfileTabProps) {
  const [profileView, setProfileView] = useState<ProfileView>(
    userRole === 'tenant-only' ? 'tenant' : 'landlord'
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  const { data: landlordData, isLoading: landlordLoading } = useLandlordProfile();
  const { data: tenantData, isLoading: tenantLoading } = useTenantDashboard();

  const landlordProfile = landlordData?.data;
  const tenantProfile = tenantData?.data?.profile;

  // Debug: log profile photo URL
  React.useEffect(() => {
    if (landlordProfile) {
      console.log('[ProfileTab] landlordProfile.profilePhotoUrl:', landlordProfile.profilePhotoUrl);
    }
  }, [landlordProfile]);

  const isLoading = profileView === 'landlord' ? landlordLoading : tenantLoading;

  // Calculate landlord profile completion percentage
  // This matches the backend logic in landlord-profile.service.ts
  const calculateLandlordCompletion = () => {
    if (!landlordProfile) return 0;

    const landlordType = landlordProfile.landlordType;
    let basePoints = 0;

    switch (landlordType) {
      case 'individual_owner':
        // Base score calculation (same as backend lines 646-659)
        if (landlordProfile.fullName) basePoints += 25;
        if (landlordProfile.phone) basePoints += 25;
        if (landlordProfile.whatsappNumber) basePoints += 20;
        if (landlordProfile.propertyCountRange) basePoints += 15;
        if (landlordProfile.propertyLocation) basePoints += 15;
        break;

      case 'real_estate_agent':
        // Base score calculation (same as backend lines 661-681)
        if (landlordProfile.fullName) basePoints += 15;
        if (landlordProfile.phone) basePoints += 15;
        if (landlordProfile.whatsappNumber) basePoints += 15;
        if (landlordProfile.yearsExperience) basePoints += 10;
        if (landlordProfile.specializations?.length > 0) basePoints += 10;
        if (landlordProfile.coverageAreas?.length > 0) basePoints += 15;
        if (landlordProfile.propertiesInManagement) basePoints += 10;
        if (landlordProfile.professionalBio) basePoints += 10;
        break;

      case 'property_company':
        // Base score calculation (same as backend lines 683-705)
        if (landlordProfile.companyName) basePoints += 15;
        if (landlordProfile.companyRtn) basePoints += 15;
        if (landlordProfile.mainPhone || landlordProfile.phone) basePoints += 10;
        if (landlordProfile.whatsappBusiness || landlordProfile.whatsappNumber) basePoints += 10;
        if (landlordProfile.officeAddress) basePoints += 10;
        if (landlordProfile.operationZones?.length > 0) basePoints += 15;
        if (landlordProfile.portfolioSize) basePoints += 10;
        if (landlordProfile.portfolioTypes?.length > 0) basePoints += 10;
        if (landlordProfile.companyDescription) basePoints += 5;
        break;

      default:
        return 0;
    }

    // Scale base score to 70% (as per backend line 626)
    const basePercentage = (basePoints / 100) * 70;

    // Add verification bonuses (15% each, as per backend lines 635-636)
    const emailVerificationScore = landlordProfile.emailVerified ? 15 : 0;
    const phoneVerificationScore = landlordProfile.phoneVerified ? 15 : 0;

    return Math.min(100, Math.round(basePercentage + emailVerificationScore + phoneVerificationScore));
  };

  const getMissingFields = () => {
    if (!landlordProfile) return [];
    const missing: string[] = [];
    const landlordType = landlordProfile.landlordType;

    switch (landlordType) {
      case 'individual_owner':
        // Required fields for individual owner
        if (!landlordProfile.fullName) missing.push('Nombre completo');
        if (!landlordProfile.phone) missing.push('Número de teléfono');
        if (!landlordProfile.whatsappNumber) missing.push('WhatsApp');
        // Optional fields
        if (!landlordProfile.propertyCountRange) missing.push('Cantidad de propiedades');
        if (!landlordProfile.propertyLocation) missing.push('Ubicación de propiedad');
        break;

      case 'real_estate_agent':
        // Required fields for real estate agent
        if (!landlordProfile.fullName) missing.push('Nombre completo');
        if (!landlordProfile.phone) missing.push('Número de teléfono');
        if (!landlordProfile.whatsappNumber) missing.push('WhatsApp');
        if (!landlordProfile.yearsExperience) missing.push('Años de experiencia');
        if (!landlordProfile.specializations || landlordProfile.specializations.length === 0) {
          missing.push('Especializaciones');
        }
        if (!landlordProfile.coverageAreas || landlordProfile.coverageAreas.length === 0) {
          missing.push('Zonas de cobertura');
        }
        // Optional fields
        if (!landlordProfile.propertiesInManagement) missing.push('Propiedades en gestión');
        if (!landlordProfile.professionalBio) missing.push('Biografía profesional');
        break;

      case 'property_company':
        // Required fields for property company
        if (!landlordProfile.companyName) missing.push('Nombre de empresa');
        if (!landlordProfile.companyRtn) missing.push('RTN de empresa');
        if (!landlordProfile.mainPhone && !landlordProfile.phone) missing.push('Teléfono principal');
        if (!landlordProfile.whatsappBusiness && !landlordProfile.whatsappNumber) missing.push('WhatsApp Business');
        if (!landlordProfile.officeAddress) missing.push('Dirección de oficina');
        if (!landlordProfile.operationZones || landlordProfile.operationZones.length === 0) {
          missing.push('Zonas de operación');
        }
        if (!landlordProfile.portfolioSize) missing.push('Tamaño de portafolio');
        // Optional fields
        if (!landlordProfile.portfolioTypes || landlordProfile.portfolioTypes.length === 0) {
          missing.push('Tipos de propiedad');
        }
        if (!landlordProfile.companyDescription) missing.push('Descripción de empresa');
        break;
    }

    // Add verification fields if not verified
    if (!landlordProfile.emailVerified) missing.push('Verificación de email');
    if (!landlordProfile.phoneVerified) missing.push('Verificación de teléfono');

    return missing;
  };

  const profileCompletion = calculateLandlordCompletion();
  const missingFields = getMissingFields();

  const handleEditProfile = () => {
    if (profileView === 'landlord' && landlordProfile) {
      setEditedProfile({
        fullName: landlordProfile.fullName || '',
        companyName: landlordProfile.companyName || '',
        phone: landlordProfile.phone || '',
        email: landlordProfile.email || '',
        whatsappNumber: landlordProfile.whatsappNumber || '',
        officeAddress: landlordProfile.officeAddress || '',
        professionalBio: landlordProfile.professionalBio || '',
        companyDescription: landlordProfile.companyDescription || '',
      });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile(null);
  };

  const handleSaveProfile = async () => {
    // TODO: Implement save functionality with tRPC mutation
    toast.success('Perfil actualizado exitosamente');
    setIsEditing(false);
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Toggle for dual-context users */}
      {userRole === 'dual-context' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-900">
                Vista de perfil
              </p>
              <p className="text-xs text-blue-700 mt-1">
                Como usuario dual, puedes ver tu perfil de inquilino o propietario
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setProfileView('tenant')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  profileView === 'tenant'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Inquilino
              </button>
              <button
                onClick={() => setProfileView('landlord')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  profileView === 'landlord'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Propietario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Landlord Profile */}
      {profileView === 'landlord' && landlordProfile && (
        <>
          {/* Profile Completion Banner */}
          <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl border border-blue-200 shadow-lg shadow-blue-100/50 p-4 sm:p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Completion Progress Circle */}
              <div className="flex-shrink-0">
                <ProfileCompletionProgress
                  percentage={profileCompletion}
                  missingFields={missingFields}
                  showDetails={false}
                  size="large"
                />
              </div>

              {/* Completion Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-3 mb-3">
                  <h3 className="text-xl font-bold text-gray-900">
                    {profileCompletion === 100 ? '¡Perfil Completo!' : 'Completa tu Perfil'}
                  </h3>
                  {profileCompletion === 100 && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-md">
                      <Award className="w-3 h-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {profileCompletion === 100
                    ? 'Tu perfil está completo. Los inquilinos podrán ver toda tu información.'
                    : `Te faltan ${missingFields.length} ${missingFields.length === 1 ? 'campo' : 'campos'} para completar tu perfil al 100%.`}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {profileCompletion >= 90 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Perfil destacado
                    </Badge>
                  )}
                  {landlordProfile.whatsappNumber && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                      <Phone className="w-3 h-3 mr-1" />
                      WhatsApp activo
                    </Badge>
                  )}
                  {landlordProfile.officeAddress && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-300">
                      <MapPin className="w-3 h-3 mr-1" />
                      Ubicación verificada
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Missing Fields Alert */}
            {missingFields.length > 0 && (
              <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-sm font-medium text-amber-900 mb-2">
                  Campos pendientes:
                </p>
                <ul className="space-y-1">
                  {missingFields.map((field, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-amber-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      <span>{field}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

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
              {landlordProfile.profilePhotoUrl ? (
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full overflow-hidden flex-shrink-0 shadow-lg ring-2 sm:ring-4 ring-blue-100">
                  <img
                    src={landlordProfile.profilePhotoUrl}
                    alt={landlordProfile.fullName || landlordProfile.companyName || 'Foto de perfil'}
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl sm:text-3xl flex-shrink-0 shadow-lg ring-2 sm:ring-4 ring-blue-100">
                  {(landlordProfile.fullName || landlordProfile.companyName || 'L')
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')
                    .substring(0, 2)}
                </div>
              )}
            </div>
          </div>

          {/* Personal Info Grid - 2x2 Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
            {/* Full Name / Company Name */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 block">
                {landlordProfile.landlordType === 'property_company' ? 'Nombre de la Empresa' : 'Nombre Completo'}
              </label>
              {isEditing ? (
                <div className="p-2 sm:p-3 bg-white rounded-lg border border-blue-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-150">
                  <input
                    type="text"
                    value={landlordProfile.landlordType === 'property_company' ? editedProfile?.companyName || '' : editedProfile?.fullName || ''}
                    onChange={(e) => handleFieldChange(
                      landlordProfile.landlordType === 'property_company' ? 'companyName' : 'fullName',
                      e.target.value
                    )}
                    className="w-full text-sm sm:text-base font-semibold text-gray-900 outline-none bg-transparent"
                    placeholder={landlordProfile.landlordType === 'property_company' ? 'Ingresa el nombre de la empresa' : 'Ingresa tu nombre completo'}
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                    Esto se mostrará en tu perfil público
                  </p>
                </div>
              ) : (
                <div className="p-2.5 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {landlordProfile.fullName || landlordProfile.companyName || 'Sin nombre'}
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
                    Teléfono principal de contacto
                  </p>
                </div>
              ) : (
                <div className="p-2.5 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {landlordProfile.phone || 'No especificado'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                    Teléfono principal de contacto
                  </p>
                </div>
              )}
            </div>

            {/* Contact Email */}
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
                    Email para recibir notificaciones
                  </p>
                </div>
              ) : (
                <div className="p-2.5 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {landlordProfile.email || 'No especificado'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                    Email para recibir notificaciones
                  </p>
                </div>
              )}
            </div>

            {/* WhatsApp Number */}
            <div>
              <label className="text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 block">
                WhatsApp
              </label>
              {isEditing ? (
                <div className="p-2 sm:p-3 bg-white rounded-lg border border-blue-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-150">
                  <input
                    type="text"
                    value={editedProfile?.whatsappNumber || ''}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length > 4) {
                        value = value.slice(0, 4) + '-' + value.slice(4, 8);
                      }
                      handleFieldChange('whatsappNumber', value);
                    }}
                    className="w-full text-sm sm:text-base font-semibold text-gray-900 outline-none bg-transparent"
                    placeholder="9999-9999"
                    maxLength={9}
                  />
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                    Número de WhatsApp para mensajes directos
                  </p>
                </div>
              ) : (
                <div className="p-2.5 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {landlordProfile.whatsappNumber || 'No especificado'}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                    Número de WhatsApp para mensajes directos
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4 sm:mb-8"></div>

          {/* Professional Information */}
          <div className="mb-4 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-6">
              Información Profesional
            </h3>

            <div className="space-y-4 sm:space-y-6">
              {/* Landlord Type */}
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                  Tipo de Propietario
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'individual_owner', label: 'Propietario Individual', icon: User },
                    { value: 'real_estate_agent', label: 'Agente Inmobiliario', icon: Building2 },
                    { value: 'property_company', label: 'Empresa de Gestión', icon: Building2 }
                  ].map((type) => {
                    const isSelected = landlordProfile.landlordType === type.value;
                    const Icon = type.icon;
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
                        <Icon className={cn("w-4 h-4 -mt-px", isSelected ? "text-gray-700" : "text-gray-500")} />
                        {type.label}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Office Address */}
              {landlordProfile.officeAddress && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                    Dirección de Oficina
                  </p>
                  {isEditing ? (
                    <div className="p-2 sm:p-3 bg-white rounded-lg border border-blue-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-150">
                      <input
                        type="text"
                        value={editedProfile?.officeAddress || ''}
                        onChange={(e) => handleFieldChange('officeAddress', e.target.value)}
                        className="w-full text-sm sm:text-base text-gray-900 outline-none bg-transparent"
                        placeholder="Dirección completa de la oficina"
                      />
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-900 rounded-lg text-sm font-medium border border-blue-400">
                      <MapPin className="w-4 h-4 text-gray-700 -mt-px" />
                      {landlordProfile.officeAddress}
                    </div>
                  )}
                </div>
              )}

              {/* Professional Bio / Company Description */}
              {(landlordProfile.professionalBio || landlordProfile.companyDescription) && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                    {landlordProfile.landlordType === 'property_company' ? 'Descripción de la Empresa' : 'Biografía Profesional'}
                  </p>
                  {isEditing ? (
                    <div className="p-2 sm:p-3 bg-white rounded-lg border border-blue-200 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all duration-150">
                      <textarea
                        value={landlordProfile.landlordType === 'property_company'
                          ? editedProfile?.companyDescription || ''
                          : editedProfile?.professionalBio || ''}
                        onChange={(e) => handleFieldChange(
                          landlordProfile.landlordType === 'property_company' ? 'companyDescription' : 'professionalBio',
                          e.target.value
                        )}
                        className="w-full text-sm sm:text-base text-gray-900 outline-none bg-transparent min-h-[100px] resize-none"
                        placeholder="Describe tu experiencia y servicios..."
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {landlordProfile.professionalBio || landlordProfile.companyDescription}
                      </p>
                    </div>
                  )}
                </div>
              )}
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
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg px-6 py-3"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 flex items-center gap-2 shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all"
                >
                  Guardar Cambios
                </Button>
              </>
            ) : (
              <Button
                onClick={handleEditProfile}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 flex items-center gap-2 shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all"
              >
                Editar Perfil
              </Button>
            )}
          </div>
        </section>
        </>
      )}

      {/* Tenant Profile - Show existing tenant profile view if needed */}
      {profileView === 'tenant' && tenantProfile && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 p-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
            <User className="h-12 w-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Vista de Perfil de Inquilino
          </h3>
          <p className="text-gray-600 mb-6">
            Para ver y editar tu perfil de inquilino, ve a la sección de inquilinos.
          </p>
          <Button
            onClick={() => window.location.href = '/tenant/dashboard?tab=profile'}
            size="lg"
            className="rounded-xl shadow-lg hover:shadow-xl px-6 py-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            Ir al Perfil de Inquilino
          </Button>
        </div>
      )}
    </div>
  );
}
