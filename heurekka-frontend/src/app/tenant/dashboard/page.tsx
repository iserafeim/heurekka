/**
 * Tenant Dashboard Page
 * Página principal del dashboard del inquilino - Rediseñado con Sidebar
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenantDashboard } from '@/hooks/tenant/useTenantDashboard';
import { useDeleteSavedSearch } from '@/hooks/tenant/useSavedSearches';
import { useFavorites, useToggleFavorite } from '@/hooks/tenant/useFavorites';
import { TenantSidebar } from '@/components/tenant/TenantSidebar';
import { TenantHeader } from '@/components/tenant/TenantHeader';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/ui/property-card';
import { cn } from '@/lib/utils';
import { trpc } from '@/lib/trpc/client';
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Home,
  MapPin,
  Search,
  BookmarkIcon,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { TEGUCIGALPA_AREAS } from '@/types/tenant';

type TabSection = 'saved-searches' | 'favorites' | 'conversations' | 'profile';

export default function TenantDashboardPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { data: dashboardData, isLoading } = useTenantDashboard();
  const { data: favoritesResponse } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const [activeTab, setActiveTab] = useState<TabSection>('saved-searches');
  const [expandedSearchId, setExpandedSearchId] = useState<string | null>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<any>(null);

  // Mutation for updating profile
  const updateProfile = trpc.tenantProfile.update.useMutation({
    onSuccess: async () => {
      toast.success('Perfil actualizado exitosamente');
      setIsEditing(false);
      // Invalidate dashboard query to refetch data
      await utils.tenantDashboard.get.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || 'Error al actualizar el perfil');
    }
  });

  // Extract favorites array from response
  const favorites = favoritesResponse?.data || [];

  const handleTabChange = (sectionId: string) => {
    setActiveTab(sectionId as TabSection);
  };

  const handleToggleFavorite = async (propertyId: string) => {
    try {
      await toggleFavorite.mutateAsync({ propertyId });
      toast.success('Favorito actualizado');
    } catch (error) {
      toast.error('Error al actualizar favorito');
    }
  };

  // Handle edit mode
  const handleEditProfile = () => {
    if (dashboardData?.data?.profile) {
      // Determine the move date range from the actual move date
      let moveDateRange = '';
      if (dashboardData.data.profile.moveDate) {
        const range = getMoveDateRange(dashboardData.data.profile.moveDate);
        if (range.includes('Menos de 1 mes')) moveDateRange = 'less-than-1-month';
        else if (range.includes('1 - 3 meses')) moveDateRange = '1-3-months';
        else if (range.includes('3 meses - 1 año')) moveDateRange = '3-months-1-year';
        else if (range.includes('Más de 1 año')) moveDateRange = 'more-than-1-year';
        else moveDateRange = 'not-sure';
      }

      setEditedProfile({
        fullName: dashboardData.data.profile.fullName,
        phone: dashboardData.data.profile.phone,
        email: (dashboardData.data.profile as any).email || '',
        password: '',
        budgetMin: dashboardData.data.profile.budgetMin,
        budgetMax: dashboardData.data.profile.budgetMax,
        moveDate: dashboardData.data.profile.moveDate,
        moveDateRange: moveDateRange,
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
      const { moveDateRange, ...profileData } = editedProfile; // Remove moveDateRange as it's UI-only

      const formattedData = {
        ...profileData,
        // Convert ISO date string to YYYY-MM-DD format if present
        moveDate: profileData.moveDate
          ? new Date(profileData.moveDate).toISOString().split('T')[0]
          : undefined,
        // Ensure empty arrays are sent as undefined
        propertyTypes: profileData.propertyTypes?.length > 0 ? profileData.propertyTypes : undefined,
        preferredAreas: profileData.preferredAreas?.length > 0 ? profileData.preferredAreas : undefined,
        desiredBedrooms: profileData.desiredBedrooms?.length > 0 ? profileData.desiredBedrooms : undefined,
        desiredBathrooms: profileData.desiredBathrooms?.length > 0 ? profileData.desiredBathrooms : undefined,
        desiredParkingSpaces: profileData.desiredParkingSpaces?.length > 0 ? profileData.desiredParkingSpaces : undefined,
        petDetails: profileData.hasPets ? profileData.petDetails : undefined,
        // Only send email if it was changed
        email: profileData.email?.trim() || undefined,
        // Only send password if it was provided
        password: profileData.password?.trim() || undefined,
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
          <p className="text-lg font-medium text-gray-900">Cargando dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Solo un momento</p>
        </div>
      </div>
    );
  }

  const userName = dashboardData?.data?.profile?.fullName || 'Usuario';

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'saved-searches':
        return 'Búsquedas Guardadas';
      case 'favorites':
        return 'Favoritos';
      case 'conversations':
        return 'Conversaciones';
      case 'profile':
        return 'Mi Perfil';
      default:
        return 'Dashboard';
    }
  };

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <TenantSidebar
        variant="inset"
        user={{
          name: userName,
          email: dashboardData?.data?.profile?.phone || '',
          avatar: undefined,
        }}
        stats={dashboardData?.data?.stats}
        activeSection={activeTab}
        onSectionChange={handleTabChange}
      />
      <SidebarInset>
        <TenantHeader title={getSectionTitle()} />
        <div className="flex flex-1 flex-col bg-white rounded-b-xl">
          <div className="@container/main flex flex-1 flex-col">
            <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">

              {/* Main Content Area */}
              <div>
                {/* Content - full width */}
                <div>
                  {/* Saved Searches Section */}
                  {activeTab === 'saved-searches' && (
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-shadow duration-300 p-4 sm:p-6 md:p-8">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-4">
                        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                          Búsquedas Guardadas
                        </h2>
                        <Button
                          onClick={() => router.push('/tenant/searches/new')}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50 w-full sm:w-auto justify-center"
                        >
                          <Plus className="h-4 w-4" />
                          Nueva Búsqueda
                        </Button>
                      </div>

                      {!dashboardData?.data?.savedSearches?.length ? (
                        <div className="text-center py-12">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                            <Search className="h-12 w-12 text-blue-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            ¡Comienza tu búsqueda!
                          </h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Crea búsquedas personalizadas y recibe notificaciones cuando aparezcan propiedades que coincidan con tus criterios
                          </p>
                          <Button
                            onClick={() => router.push('/tenant/searches/new')}
                            size="lg"
                            className="rounded-xl shadow-lg hover:shadow-xl px-6 py-6 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Plus className="h-5 w-5 mr-2" />
                            Crear Primera Búsqueda
                          </Button>
                          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl max-w-md mx-auto border border-blue-100 shadow-sm">
                            <p className="text-sm font-semibold text-gray-900 mb-2">💡 Tip</p>
                            <p className="text-sm text-gray-700">
                              Puedes crear múltiples búsquedas con diferentes criterios y áreas de interés
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {dashboardData.data.savedSearches.slice(0, 3).map((search) => (
                            <SavedSearchCard
                              key={search.id}
                              search={search}
                              isExpanded={expandedSearchId === search.id}
                              onToggleExpand={(id) => setExpandedSearchId(expandedSearchId === id ? null : id)}
                              onFavoriteToggle={handleToggleFavorite}
                            />
                          ))}
                          {dashboardData.data.savedSearches.length > 3 && (
                            <Button
                              onClick={() => router.push('/tenant/searches')}
                              variant="ghost"
                              className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              Ver Todas ({dashboardData.data.savedSearches.length})
                            </Button>
                          )}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Favorites Section */}
                  {activeTab === 'favorites' && (
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-shadow duration-300 p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Propiedades Favoritas
                        </h2>
                      </div>

                      {!favorites.length ? (
                        <div className="text-center py-12">
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                            <BookmarkIcon className="h-12 w-12 text-blue-600" />
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            ¡Guarda tus favoritos!
                          </h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Explora propiedades y guarda las que más te gusten para verlas después
                          </p>
                          <Button
                            onClick={() => router.push('/propiedades')}
                            size="lg"
                            className="rounded-xl shadow-lg hover:shadow-xl px-6 py-6 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Search className="h-5 w-5 mr-2" />
                            Explorar Propiedades
                          </Button>
                          <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl max-w-md mx-auto border border-blue-100 shadow-sm">
                            <p className="text-sm font-semibold text-gray-900 mb-2">💡 Tip</p>
                            <p className="text-sm text-gray-700">
                              Usa favoritos para comparar propiedades fácilmente y tenerlas siempre a mano
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {favorites.map((favorite: any) => {
                            // Transform backend favorite format to PropertyCard Property format
                            const property = favorite.property;

                            // Extract neighborhood from address object
                            const neighborhood = property.address?.neighborhood || '';
                            const city = property.address?.city || 'Tegucigalpa';
                            const street = property.address?.street || '';

                            const normalizedProperty = {
                              id: property.id,
                              address: street,
                              neighborhood,
                              city,
                              price: property.priceAmount,
                              bedrooms: property.bedrooms || 0,
                              bathrooms: typeof property.bathrooms === 'string'
                                ? parseFloat(property.bathrooms)
                                : property.bathrooms || 0,
                              area: property.areaSqm || 0,
                              propertyType: property.type,
                              images: Array.isArray(property.images)
                                ? property.images.map((img: any) => typeof img === 'string' ? img : img?.url || '')
                                : [],
                              description: property.title || '',
                              amenities: property.amenities || [],
                              coordinates: { lat: 0, lng: 0 },
                              landlord: {
                                id: property.landlordId || '',
                                name: 'Propietario',
                              },
                              listing: {
                                listedDate: property.createdAt || new Date().toISOString(),
                                status: 'active',
                                daysOnMarket: 0,
                              },
                              stats: {
                                views: 0,
                                favorites: 0,
                                inquiries: 0,
                              },
                            };

                            return (
                              <PropertyCard
                                key={favorite.id}
                                property={normalizedProperty}
                                isFavorite={true}
                                onFavorite={() => handleToggleFavorite(property.id)}
                              />
                            );
                          })}
                        </div>
                      )}
                    </section>
                  )}

                  {/* Conversations Section */}
                  {activeTab === 'conversations' && (
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-shadow duration-300 p-8">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Conversaciones
                        </h2>
                      </div>

                      <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                          <MessageSquare className="h-12 w-12 text-blue-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          Sin conversaciones aún
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Las conversaciones con propietarios aparecerán aquí cuando contactes propiedades de tu interés
                        </p>
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl max-w-md mx-auto border border-blue-100 shadow-sm">
                          <p className="text-sm font-semibold text-gray-900 mb-2">💡 Tip</p>
                          <p className="text-sm text-gray-700">
                            Contacta propiedades desde la página de búsqueda o desde tus favoritos
                          </p>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Profile Section */}
                  {activeTab === 'profile' && dashboardData?.data?.profile && (
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50 transition-shadow duration-300 p-3 sm:p-6 md:p-8">
                      {/* Section Header */}
                      <div className="mb-4 sm:mb-8">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                          Información Personal
                        </h2>
                      </div>

                      {/* Avatar Section - More Prominent */}
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
                                  value={editedProfile?.moveDateRange || ''}
                                  onChange={(e) => {
                                    const range = e.target.value;
                                    handleFieldChange('moveDateRange', range);

                                    // Convert range to actual date for backend
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
                                    handleFieldChange('moveDate', targetDate.toISOString());
                                  }}
                                  className="w-full px-3 py-2.5 bg-white border border-blue-200 rounded-lg text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150"
                                >
                                  <option value="">Selecciona el periodo...</option>
                                  <option value="less-than-1-month">Menos de 1 mes</option>
                                  <option value="1-3-months">1 - 3 meses</option>
                                  <option value="3-months-1-year">3 meses - 1 año</option>
                                  <option value="more-than-1-year">Más de 1 año</option>
                                  <option value="not-sure">Aún no estoy seguro</option>
                                </select>
                              ) : (
                                <div className="flex flex-wrap gap-2">
                                  {dashboardData.data.profile.moveDate ? (
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-gray-900 rounded-lg text-sm font-medium border border-blue-400 cursor-default select-none">
                                      <Calendar className="w-4 h-4 text-gray-700 -mt-px" />
                                      {getMoveDateRange(dashboardData.data.profile.moveDate)}
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
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Helper Components
function SavedSearchCard({ search, isExpanded, onToggleExpand, onFavoriteToggle }: {
  search: any;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onFavoriteToggle: (propertyId: string) => void;
}) {
  const router = useRouter();
  const deleteSearch = useDeleteSavedSearch();

  // Load properties only when expanded
  const { data: searchResults, isLoading: loadingResults } = trpc.savedSearch.execute.useQuery(
    { searchId: search.id },
    {
      enabled: isExpanded,
      retry: 1,
      staleTime: 30 * 1000,
    }
  );
  const properties = searchResults?.data?.properties || [];

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!search.id) return;

    const searchName = search.profileName || search.name || 'esta búsqueda';
    if (!confirm(`¿Eliminar la búsqueda "${searchName}"?`)) return;

    try {
      await deleteSearch.mutateAsync({ searchId: search.id });
      toast.success('Búsqueda eliminada');
    } catch (error) {
      toast.error('Error al eliminar búsqueda');
    }
  };

  return (
    <div className="group bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-200 ease-out hover:border-gray-300 hover:shadow-sm">
      {/* Header - Clickable */}
      <div
        className={cn(
          "px-3 py-3 sm:px-4 sm:py-3.5 cursor-pointer relative transition-all duration-200",
          isExpanded
            ? "bg-blue-50/30 border-b border-blue-100"
            : "hover:bg-gray-50/50"
        )}
        onClick={() => onToggleExpand(search.id)}
      >
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 sm:gap-2.5">
              <h3 className="font-semibold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors duration-150 truncate">
                {search.profileName || search.name || 'Búsqueda sin nombre'}
              </h3>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-blue-600 flex-shrink-0 transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0 transition-transform duration-200" />
              )}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-1.5">
              L.{search.searchCriteria?.budgetMin?.toLocaleString('es-HN') || '0'} - L.{search.searchCriteria?.budgetMax?.toLocaleString('es-HN') || '0'}
            </p>
            {search.newMatchCount > 0 && (
              <div className="inline-flex items-center gap-1.5 mt-2 sm:mt-2.5 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                {search.newMatchCount} {search.newMatchCount === 1 ? 'nueva' : 'nuevas'}
              </div>
            )}
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 p-0 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors duration-150"
              onClick={(e) => {
                e.stopPropagation();
                if (search.id) router.push(`/tenant/searches/${search.id}/edit`);
              }}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 sm:h-8 sm:w-auto sm:px-2.5 p-0 sm:p-2 text-gray-600 hover:text-red-600 hover:bg-red-50/50 transition-colors duration-150"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable Content - Properties Grid */}
      {isExpanded && (
        <div className="px-3 py-4 sm:px-6 sm:py-5 bg-white border-t border-gray-100">
          {loadingResults ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
                  <div className="aspect-[3/2] bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">No se encontraron propiedades</p>
              <p className="text-xs text-gray-500">
                Intenta ajustar los criterios de búsqueda
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-700 mb-3 sm:mb-4">
                {properties.length} {properties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {properties.map((property: any) => {
                  // Transform to PropertyCard format
                  const normalizedProperty = {
                    id: property.id,
                    address: property.address?.street || '',
                    neighborhood: property.address?.neighborhood || '',
                    city: property.address?.city || 'Tegucigalpa',
                    price: property.priceAmount,
                    bedrooms: property.bedrooms || 0,
                    bathrooms: typeof property.bathrooms === 'string'
                      ? parseFloat(property.bathrooms)
                      : property.bathrooms || 0,
                    area: property.areaSqm || 0,
                    propertyType: property.type,
                    images: Array.isArray(property.images)
                      ? property.images.map((img: any) => typeof img === 'string' ? img : img?.url || '')
                      : [],
                    description: property.title || '',
                    amenities: property.amenities || [],
                    coordinates: { lat: 0, lng: 0 },
                    landlord: {
                      id: property.landlordId || '',
                      name: 'Propietario',
                    },
                    listing: {
                      listedDate: property.createdAt || new Date().toISOString(),
                      status: 'active',
                      daysOnMarket: 0,
                    },
                    stats: {
                      views: 0,
                      favorites: 0,
                      inquiries: 0,
                    },
                  };

                  return (
                    <PropertyCard
                      key={property.id}
                      property={normalizedProperty}
                      isFavorite={false}
                      onFavorite={() => onFavoriteToggle(property.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function FavoritePropertyCard({ favorite }: any) {
  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-100/50 transition-all duration-300 hover:scale-[1.03] cursor-pointer">
      <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/0 group-hover:from-blue-500/10 group-hover:to-blue-500/20 transition-all duration-300"></div>
        <div className="absolute top-3 right-3">
          <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <BookmarkIcon className="h-5 w-5 text-blue-600 fill-current" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="font-bold text-base text-gray-900 group-hover:text-blue-700 transition-colors duration-200 line-clamp-2 mb-2">
          {favorite.property?.title || 'Propiedad'}
        </p>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <p className="text-blue-600 font-bold text-lg">
            L.{favorite.property?.price?.toLocaleString()}/mes
          </p>
        </div>
      </div>
    </div>
  );
}
