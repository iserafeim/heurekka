'use client';

import React, { useState } from 'react';
import { useLandlordProfile, useUpdateLandlordProfile } from '@/hooks/landlord/useLandlordProfile';
import { useTenantDashboard } from '@/hooks/tenant/useTenantDashboard';
import { UserRole } from '@/lib/dashboard-tabs';
import { User, Building2, Mail, Phone, MapPin, Award, Sparkles, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ProfileCompletionProgress } from '@/components/tenant/profile/ProfileCompletionProgress';
import { TenantProfileTab } from '@/components/tenant/tabs/TenantProfileTab';
import { trpc } from '@/lib/trpc/react';
import {
  HONDURAS_CITIES,
  PROPERTY_COUNT_OPTIONS,
  YEARS_EXPERIENCE_OPTIONS,
  SPECIALIZATIONS_OPTIONS,
  AGENT_TYPE_OPTIONS,
  PORTFOLIO_SIZE_OPTIONS,
  PROPERTY_TYPES_OPTIONS,
} from '@/types/landlord';

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
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const { data: landlordData, isLoading: landlordLoading } = useLandlordProfile();
  const { data: tenantData, isLoading: tenantLoading } = useTenantDashboard();
  const updateProfileMutation = useUpdateLandlordProfile();
  const changePasswordMutation = trpc.auth.changePassword.useMutation();

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
        // Personal info
        fullName: landlordProfile.fullName || '',
        companyName: landlordProfile.companyName || '',
        phone: landlordProfile.phone || '',
        email: landlordProfile.email || '',
        whatsappNumber: landlordProfile.whatsappNumber || '',

        // Professional info
        landlordType: landlordProfile.landlordType || 'individual_owner',

        // Individual Owner fields
        propertyLocation: landlordProfile.propertyLocation || '',
        propertyCountRange: landlordProfile.propertyCountRange || '',

        // Real Estate Agent fields
        agentType: landlordProfile.agentType || 'independent',
        agencyName: landlordProfile.agencyName || '',
        yearsExperience: landlordProfile.yearsExperience || '',
        specializations: landlordProfile.specializations || [],
        coverageAreas: landlordProfile.coverageAreas || [],
        propertiesInManagement: landlordProfile.propertiesInManagement || '',
        professionalBio: landlordProfile.professionalBio || '',

        // Property Company fields
        foundedYear: landlordProfile.foundedYear || '',
        website: landlordProfile.website || '',
        officeAddress: landlordProfile.officeAddress || '',
        operationZones: landlordProfile.operationZones || [],
        portfolioSize: landlordProfile.portfolioSize || '',
        portfolioTypes: landlordProfile.portfolioTypes || [],
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
    if (!editedProfile) {
      toast.error('No hay cambios para guardar');
      return;
    }

    try {
      // Prepare the data for the backend
      const updateData: any = {
        // Personal info
        fullName: editedProfile.fullName,
        phone: editedProfile.phone,
        email: editedProfile.email,
        whatsappNumber: editedProfile.whatsappNumber,

        // Landlord type
        landlordType: editedProfile.landlordType,
      };

      // Add company name if it's a property company
      if (editedProfile.landlordType === 'property_company') {
        updateData.companyName = editedProfile.companyName;
      }

      // Add type-specific fields based on landlord type
      if (editedProfile.landlordType === 'individual_owner') {
        updateData.propertyLocation = editedProfile.propertyLocation;
        updateData.propertyCountRange = editedProfile.propertyCountRange;
      } else if (editedProfile.landlordType === 'real_estate_agent') {
        updateData.agentType = editedProfile.agentType;
        updateData.agencyName = editedProfile.agencyName;
        updateData.yearsExperience = editedProfile.yearsExperience;
        updateData.specializations = editedProfile.specializations;
        updateData.coverageAreas = editedProfile.coverageAreas;
        updateData.propertiesInManagement = editedProfile.propertiesInManagement;
        updateData.professionalBio = editedProfile.professionalBio;
      } else if (editedProfile.landlordType === 'property_company') {
        updateData.foundedYear = editedProfile.foundedYear;
        updateData.website = editedProfile.website;
        updateData.officeAddress = editedProfile.officeAddress;
        updateData.operationZones = editedProfile.operationZones;
        updateData.portfolioSize = editedProfile.portfolioSize;
        updateData.portfolioTypes = editedProfile.portfolioTypes;
        updateData.companyDescription = editedProfile.companyDescription;
      }

      // Remove empty/null/undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '' || updateData[key] === null || updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      // Call the mutation
      await updateProfileMutation.mutateAsync(updateData);

      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);
      setEditedProfile(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.message || 'Error al actualizar el perfil. Por favor intenta de nuevo.');
    }
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedProfile((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleChangePassword = async () => {
    // Validations
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Por favor completa todos los campos de contraseña');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 12) {
      toast.error('La nueva contraseña debe tener al menos 12 caracteres');
      return;
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(passwordData.newPassword);
    const hasLowerCase = /[a-z]/.test(passwordData.newPassword);
    const hasNumber = /[0-9]/.test(passwordData.newPassword);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(passwordData.newPassword);

    if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
      toast.error('La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Contraseña actualizada exitosamente');
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error?.message || 'Error al cambiar la contraseña. Por favor intenta de nuevo.');
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
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

          {/* Password Change Section */}
          <div className="mt-4 sm:mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-gray-700" />
                Seguridad
              </h3>
              {!isChangingPassword && !isEditing && (
                <Button
                  onClick={() => setIsChangingPassword(true)}
                  size="sm"
                  variant="outline"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Cambiar Contraseña
                </Button>
              )}
            </div>

            {isChangingPassword && (
              <div className="space-y-4 p-4 sm:p-6 bg-blue-50/50 rounded-xl border border-blue-200">
                {/* Current Password */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                    Contraseña Actual
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ingresa tu contraseña actual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                    Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mínimo 12 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Debe incluir mayúsculas, minúsculas, números y caracteres especiales
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-700 mb-2 block">
                    Confirmar Nueva Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Confirma tu nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleCancelPasswordChange}
                    size="sm"
                    variant="outline"
                    disabled={changePasswordMutation.isPending}
                    className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleChangePassword}
                    size="sm"
                    disabled={changePasswordMutation.isPending}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {changePasswordMutation.isPending ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </Button>
                </div>
              </div>
            )}
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
                {isEditing ? (
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'individual_owner', label: 'Propietario Individual', icon: User },
                      { value: 'real_estate_agent', label: 'Agente Inmobiliario', icon: Building2 },
                      { value: 'property_company', label: 'Empresa de Gestión', icon: Building2 }
                    ].map((type) => {
                      const isSelected = editedProfile?.landlordType === type.value;
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleFieldChange('landlordType', type.value)}
                          className={cn(
                            "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all duration-200 cursor-pointer hover:shadow-md",
                            isSelected
                              ? "bg-blue-50 text-gray-700 border-blue-400"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          )}
                        >
                          <Icon className={cn("w-4 h-4 -mt-px", isSelected ? "text-gray-600" : "text-gray-500")} />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-700 rounded-lg text-sm font-medium border border-blue-400">
                    {landlordProfile.landlordType === 'individual_owner' && (
                      <>
                        <User className="w-4 h-4 text-gray-600 -mt-px" />
                        Propietario Individual
                      </>
                    )}
                    {landlordProfile.landlordType === 'real_estate_agent' && (
                      <>
                        <Building2 className="w-4 h-4 text-gray-600 -mt-px" />
                        Agente Inmobiliario
                      </>
                    )}
                    {landlordProfile.landlordType === 'property_company' && (
                      <>
                        <Building2 className="w-4 h-4 text-gray-600 -mt-px" />
                        Empresa de Gestión
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Individual Owner Fields */}
              {(isEditing ? editedProfile?.landlordType === 'individual_owner' : landlordProfile.landlordType === 'individual_owner') && (
                <>
                  {/* Primary Location */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Ubicación Principal
                    </p>
                    {isEditing ? (
                      <select
                        value={editedProfile?.propertyLocation || ''}
                        onChange={(e) => handleFieldChange('propertyLocation', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecciona una ciudad</option>
                        {HONDURAS_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    ) : landlordProfile.propertyLocation ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-700 rounded-lg text-sm font-medium border border-blue-400">
                        <MapPin className="w-4 h-4 text-gray-600 -mt-px" />
                        {landlordProfile.propertyLocation}
                      </div>
                    ) : null}
                  </div>

                  {/* Property Count Range */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Cantidad de Propiedades
                    </p>
                    {isEditing ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                        {PROPERTY_COUNT_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              'cursor-pointer rounded-lg border-2 transition-all p-3 sm:p-4 text-center hover:border-blue-300',
                              editedProfile?.propertyCountRange === option.value
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200'
                            )}
                          >
                            <input
                              type="radio"
                              name="propertyCountRange"
                              value={option.value}
                              checked={editedProfile?.propertyCountRange === option.value}
                              onChange={(e) => handleFieldChange('propertyCountRange', e.target.value)}
                              className="sr-only"
                            />
                            <span className={cn(
                              'text-base sm:text-lg font-semibold',
                              editedProfile?.propertyCountRange === option.value
                                ? 'text-blue-700'
                                : 'text-gray-700'
                            )}>
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : landlordProfile.propertyCountRange ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-700 rounded-lg text-sm font-medium border border-blue-400">
                        <Building2 className="w-4 h-4 text-gray-600 -mt-px" />
                        {landlordProfile.propertyCountRange === '1' && '1 propiedad'}
                        {landlordProfile.propertyCountRange === '2-3' && '2-3 propiedades'}
                        {landlordProfile.propertyCountRange === '4-5' && '4-5 propiedades'}
                        {landlordProfile.propertyCountRange === '5+' && 'Más de 5 propiedades'}
                      </div>
                    ) : null}
                  </div>

                </>
              )}

              {/* Real Estate Agent Fields */}
              {(isEditing ? editedProfile?.landlordType === 'real_estate_agent' : landlordProfile.landlordType === 'real_estate_agent') && (
                <>
                  {/* Agent Type */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Tipo de Agente
                    </p>
                    {isEditing ? (
                      <div className="flex gap-3">
                        {AGENT_TYPE_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              'flex-1 cursor-pointer rounded-lg border-2 transition-all p-3 sm:p-4 text-center hover:border-blue-300',
                              editedProfile?.agentType === option.value
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200'
                            )}
                          >
                            <input
                              type="radio"
                              name="agentType"
                              value={option.value}
                              checked={editedProfile?.agentType === option.value}
                              onChange={(e) => handleFieldChange('agentType', e.target.value)}
                              className="sr-only"
                            />
                            <span className={cn(
                              'text-sm sm:text-base font-medium',
                              editedProfile?.agentType === option.value ? 'text-blue-700' : 'text-gray-700'
                            )}>
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : landlordProfile.agentType ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-700 rounded-lg text-sm font-medium border border-blue-400">
                        {landlordProfile.agentType === 'independent' ? 'Agente Independiente' : 'Agente de Empresa'}
                      </div>
                    ) : null}
                  </div>

                  {/* Company Name (for agency agents) */}
                  {(isEditing ? editedProfile?.agentType === 'agency_agent' : landlordProfile.agentType === 'agency_agent') && (
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                        Nombre de la Empresa
                      </p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editedProfile?.agencyName || ''}
                          onChange={(e) => handleFieldChange('agencyName', e.target.value)}
                          placeholder="Century 21 Honduras"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : landlordProfile.agencyName ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                          <Building2 className="w-4 h-4 text-gray-600 -mt-px" />
                          {landlordProfile.agencyName}
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Years of Experience */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Años de Experiencia
                    </p>
                    {isEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {YEARS_EXPERIENCE_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              'cursor-pointer rounded-lg border-2 transition-all p-3 text-center hover:border-blue-300',
                              editedProfile?.yearsExperience === option.value
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200'
                            )}
                          >
                            <input
                              type="radio"
                              name="yearsExperience"
                              value={option.value}
                              checked={editedProfile?.yearsExperience === option.value}
                              onChange={(e) => handleFieldChange('yearsExperience', e.target.value)}
                              className="sr-only"
                            />
                            <span className={cn(
                              'text-sm sm:text-base font-medium',
                              editedProfile?.yearsExperience === option.value
                                ? 'text-blue-700'
                                : 'text-gray-700'
                            )}>
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : landlordProfile.yearsExperience ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                        <Award className="w-4 h-4 text-gray-600 -mt-px" />
                        {landlordProfile.yearsExperience === '<1' && '< 1 año'}
                        {landlordProfile.yearsExperience === '1-3' && '1-3 años'}
                        {landlordProfile.yearsExperience === '3-5' && '3-5 años'}
                        {landlordProfile.yearsExperience === '5+' && '5 años +'}
                      </div>
                    ) : null}
                  </div>

                  {/* Specializations */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Especializaciones
                    </p>
                    {isEditing ? (
                      <div className="flex flex-col gap-2">
                        {SPECIALIZATIONS_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={(editedProfile?.specializations || []).includes(option.value)}
                              onChange={(e) => {
                                const currentValue = editedProfile?.specializations || [];
                                const newValue = e.target.checked
                                  ? [...currentValue, option.value]
                                  : currentValue.filter((v: string) => v !== option.value);
                                handleFieldChange('specializations', newValue);
                              }}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm sm:text-base">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : landlordProfile.specializations && landlordProfile.specializations.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {landlordProfile.specializations.map((spec: string, index: number) => (
                          <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-gray-700 rounded-lg text-sm font-medium border border-blue-200">
                            {spec === 'residential' && 'Residencial'}
                            {spec === 'commercial' && 'Comercial'}
                            {spec === 'industrial' && 'Industrial'}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Coverage Areas */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Zonas de Cobertura
                    </p>
                    {isEditing ? (
                      <>
                        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                          {HONDURAS_CITIES.map((city) => (
                            <label
                              key={city}
                              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={(editedProfile?.coverageAreas || []).includes(city)}
                                onChange={(e) => {
                                  const currentValue = editedProfile?.coverageAreas || [];
                                  const newValue = e.target.checked
                                    ? [...currentValue, city]
                                    : currentValue.filter((v: string) => v !== city);
                                  handleFieldChange('coverageAreas', newValue);
                                }}
                                disabled={
                                  !(editedProfile?.coverageAreas || []).includes(city) &&
                                  (editedProfile?.coverageAreas || []).length >= 10
                                }
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm">{city}</span>
                            </label>
                          ))}
                        </div>
                        {(editedProfile?.coverageAreas || []).length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            {(editedProfile?.coverageAreas || []).length} de 10 ciudades seleccionadas
                          </p>
                        )}
                      </>
                    ) : landlordProfile.coverageAreas && landlordProfile.coverageAreas.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {landlordProfile.coverageAreas.map((area: string, index: number) => (
                          <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200">
                            <MapPin className="w-3 h-3 text-gray-600" />
                            {area}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Properties in Management */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Propiedades en Gestión
                    </p>
                    {isEditing ? (
                      <select
                        value={editedProfile?.propertiesInManagement || ''}
                        onChange={(e) => handleFieldChange('propertiesInManagement', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                      >
                        <option value="">Selecciona un rango</option>
                        <option value="1-5">1-5 propiedades</option>
                        <option value="6-10">6-10 propiedades</option>
                        <option value="11-20">11-20 propiedades</option>
                        <option value="20+">Más de 20</option>
                      </select>
                    ) : landlordProfile.propertiesInManagement ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                        <Building2 className="w-4 h-4 text-gray-600 -mt-px" />
                        {landlordProfile.propertiesInManagement === '1-5' && '1-5 propiedades'}
                        {landlordProfile.propertiesInManagement === '6-10' && '6-10 propiedades'}
                        {landlordProfile.propertiesInManagement === '11-20' && '11-20 propiedades'}
                        {landlordProfile.propertiesInManagement === '20+' && 'Más de 20 propiedades'}
                      </div>
                    ) : null}
                  </div>
                </>
              )}

              {/* Property Company Fields */}
              {(isEditing ? editedProfile?.landlordType === 'property_company' : landlordProfile.landlordType === 'property_company') && (
                <>
                  {/* Founded Year */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Año de Fundación
                    </p>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedProfile?.foundedYear || ''}
                        onChange={(e) => handleFieldChange('foundedYear', e.target.value ? parseInt(e.target.value) : '')}
                        placeholder={new Date().getFullYear().toString()}
                        min={1900}
                        max={new Date().getFullYear()}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : landlordProfile.foundedYear ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                        {landlordProfile.foundedYear}
                      </div>
                    ) : null}
                  </div>

                  {/* Company Website */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Sitio Web
                    </p>
                    {isEditing ? (
                      <input
                        type="url"
                        value={editedProfile?.website || ''}
                        onChange={(e) => handleFieldChange('website', e.target.value)}
                        placeholder="https://www.ejemplo.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : landlordProfile.website ? (
                      <a
                        href={landlordProfile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-400 hover:bg-blue-100 transition-colors"
                      >
                        {landlordProfile.website}
                      </a>
                    ) : null}
                  </div>

                  {/* Office Address */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Dirección de Oficina Principal
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile?.officeAddress || ''}
                        onChange={(e) => handleFieldChange('officeAddress', e.target.value)}
                        placeholder="Blvd. Morazán, Torre 1, Piso 5"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : landlordProfile.officeAddress ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-700 rounded-lg text-sm font-medium border border-blue-400">
                        <MapPin className="w-4 h-4 text-gray-600 -mt-px" />
                        {landlordProfile.officeAddress}
                      </div>
                    ) : null}
                  </div>

                  {/* Operating Areas */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Zonas de Operación
                    </p>
                    {isEditing ? (
                      <>
                        <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                          {HONDURAS_CITIES.map((city) => (
                            <label
                              key={city}
                              className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={(editedProfile?.operationZones || []).includes(city)}
                                onChange={(e) => {
                                  const currentValue = editedProfile?.operationZones || [];
                                  const newValue = e.target.checked
                                    ? [...currentValue, city]
                                    : currentValue.filter((v: string) => v !== city);
                                  handleFieldChange('operationZones', newValue);
                                }}
                                disabled={
                                  !(editedProfile?.operationZones || []).includes(city) &&
                                  (editedProfile?.operationZones || []).length >= 20
                                }
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm">{city}</span>
                            </label>
                          ))}
                        </div>
                        {(editedProfile?.operationZones || []).length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            {(editedProfile?.operationZones || []).length} de 20 ciudades seleccionadas
                          </p>
                        )}
                      </>
                    ) : landlordProfile.operationZones && landlordProfile.operationZones.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {landlordProfile.operationZones.map((zone: string, index: number) => (
                          <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200">
                            <MapPin className="w-3 h-3 text-gray-600" />
                            {zone}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Portfolio Size */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Tamaño del Portfolio
                    </p>
                    {isEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {PORTFOLIO_SIZE_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className={cn(
                              'cursor-pointer rounded-lg border-2 transition-all p-3 text-center hover:border-blue-300',
                              editedProfile?.portfolioSize === option.value
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200'
                            )}
                          >
                            <input
                              type="radio"
                              name="portfolioSize"
                              value={option.value}
                              checked={editedProfile?.portfolioSize === option.value}
                              onChange={(e) => handleFieldChange('portfolioSize', e.target.value)}
                              className="sr-only"
                            />
                            <span className={cn(
                              'text-sm font-medium',
                              editedProfile?.portfolioSize === option.value
                                ? 'text-blue-700'
                                : 'text-gray-700'
                            )}>
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : landlordProfile.portfolioSize ? (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium border border-gray-200">
                        <Building2 className="w-4 h-4 text-gray-600 -mt-px" />
                        {landlordProfile.portfolioSize === '1-10' && '1-10 propiedades'}
                        {landlordProfile.portfolioSize === '11-25' && '11-25 propiedades'}
                        {landlordProfile.portfolioSize === '26-50' && '26-50 propiedades'}
                        {landlordProfile.portfolioSize === '50+' && 'Más de 50 propiedades'}
                      </div>
                    ) : null}
                  </div>

                  {/* Property Types */}
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3 tracking-tight">
                      Tipos de Propiedad que Gestionan
                    </p>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-3">
                        {PROPERTY_TYPES_OPTIONS.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={(editedProfile?.portfolioTypes || []).includes(option.value)}
                              onChange={(e) => {
                                const currentValue = editedProfile?.portfolioTypes || [];
                                const newValue = e.target.checked
                                  ? [...currentValue, option.value]
                                  : currentValue.filter((v: string) => v !== option.value);
                                handleFieldChange('portfolioTypes', newValue);
                              }}
                              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="font-medium">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : landlordProfile.portfolioTypes && landlordProfile.portfolioTypes.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {landlordProfile.portfolioTypes.map((type: string, index: number) => (
                          <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-gray-700 rounded-lg text-sm font-medium border border-blue-200">
                            {type === 'residential' && 'Residencial'}
                            {type === 'commercial' && 'Comercial'}
                            {type === 'industrial' && 'Industrial'}
                            {type === 'land' && 'Terrenos'}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </>
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
                  disabled={updateProfileMutation.isPending}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-lg px-6 py-3"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveProfile}
                  size="lg"
                  disabled={updateProfileMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 flex items-center gap-2 shadow-lg shadow-blue-200/50 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateProfileMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
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

      {/* Tenant Profile - Only show if user has tenant role */}
      {profileView === 'tenant' && tenantProfile && (userRole === 'tenant-only' || userRole === 'dual-context') && (
        <TenantProfileTab />
      )}
    </div>
  );
}
