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
  Eye,
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

type TabSection = 'saved-searches' | 'favorites' | 'conversations' | 'profile';

export default function TenantDashboardPage() {
  const router = useRouter();
  const { data: dashboardData, isLoading } = useTenantDashboard();
  const { data: favoritesResponse } = useFavorites();
  const toggleFavorite = useToggleFavorite();
  const [activeTab, setActiveTab] = useState<TabSection>('saved-searches');
  const [expandedSearchId, setExpandedSearchId] = useState<string | null>(null);

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
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-shadow duration-300 p-8">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Búsquedas Guardadas
                        </h2>
                        <Button
                          onClick={() => router.push('/tenant/searches/new')}
                          size="sm"
                          variant="outline"
                          className="flex items-center gap-2 border-blue-600 text-blue-600 hover:bg-blue-50"
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
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50 transition-shadow duration-300 p-5 md:p-6">
                      {/* Section Header with Subtitle */}
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-1">
                          Mi Perfil
                        </h2>
                        <p className="text-xs text-gray-600">
                          Tu información y preferencias de búsqueda
                        </p>
                      </div>

                      {/* Primary Identity Section - Enhanced */}
                      <div className="bg-gradient-to-br from-blue-50 via-blue-50/80 to-white rounded-xl p-4 border border-blue-100 shadow-sm mb-6 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg ring-2 ring-blue-100">
                            {dashboardData.data.profile.fullName.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 truncate mb-0.5">
                              {dashboardData.data.profile.fullName}
                            </h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1.5">
                              <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                              {dashboardData.data.profile.phone}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Search Criteria Section - Enhanced */}
                      <div className="mb-6">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Criterios de Búsqueda
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(dashboardData.data.profile.budgetMin || dashboardData.data.profile.budgetMax) && (
                            <div className="flex items-start gap-2.5 p-3.5 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 shadow-sm animate-in fade-in-50 slide-in-from-bottom-4">
                              <DollarSign className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                                  Presupuesto Mensual
                                </p>
                                <p className="text-base font-semibold text-gray-900">
                                  L.{dashboardData.data.profile.budgetMin?.toLocaleString() || '0'} - L.{dashboardData.data.profile.budgetMax?.toLocaleString() || '0'}
                                </p>
                              </div>
                            </div>
                          )}

                          {dashboardData.data.profile.moveDate && (
                            <div className="flex items-start gap-2.5 p-3.5 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100 shadow-sm animate-in fade-in-50 slide-in-from-bottom-4">
                              <Calendar className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                                  ¿Cuándo deseas mudarte?
                                </p>
                                <p className="text-base font-semibold text-gray-900">
                                  {getMoveDateRange(dashboardData.data.profile.moveDate)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Preferences Section - Enhanced with Blue Theme */}
                      {(dashboardData.data.profile.propertyTypes?.length > 0 ||
                        dashboardData.data.profile.preferredAreas?.length > 0) && (
                        <div className="mb-6">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                            Preferencias
                          </h4>

                          <div className="space-y-4">
                            {dashboardData.data.profile.propertyTypes?.length > 0 && (
                              <>
                                <div className="animate-in fade-in-50 slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Tipo de Propiedad
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {dashboardData.data.profile.propertyTypes.map((type: string, index: number) => (
                                      <span
                                        key={type}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 min-w-[70px] justify-center bg-blue-50 text-blue-800 rounded-md text-xs font-semibold border border-blue-100 shadow-sm"
                                        style={{ animationDelay: `${150 + index * 50}ms` }}
                                      >
                                        <Home className="w-3.5 h-3.5 text-blue-600" />
                                        {type === 'apartment' ? 'Apartamento' : type === 'house' ? 'Casa' : type}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                {/* Visual Separator */}
                                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                              </>
                            )}

                            {dashboardData.data.profile.preferredAreas?.length > 0 && (
                              <>
                                <div className="animate-in fade-in-50 slide-in-from-bottom-4" style={{ animationDelay: '200ms' }}>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Zonas Preferidas
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {dashboardData.data.profile.preferredAreas.map((area: string, index: number) => (
                                      <span
                                        key={area}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-800 rounded-md text-xs font-semibold border border-blue-100 shadow-sm"
                                        style={{ animationDelay: `${250 + index * 50}ms` }}
                                      >
                                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                                        {area}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                {/* Visual Separator */}
                                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                              </>
                            )}

                            {dashboardData.data.profile.desiredBedrooms?.length > 0 && (
                              <>
                                <div className="animate-in fade-in-50 slide-in-from-bottom-4" style={{ animationDelay: '300ms' }}>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Habitaciones
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {dashboardData.data.profile.desiredBedrooms
                                      .sort((a: number, b: number) => a - b)
                                      .map((count: number, index: number) => (
                                        <span
                                          key={count}
                                          className="inline-flex items-center justify-center px-2.5 py-1.5 min-w-[45px] bg-blue-50 text-blue-800 rounded-md text-xs font-bold border border-blue-100 shadow-sm"
                                          style={{ animationDelay: `${350 + index * 50}ms` }}
                                        >
                                          {count === 5 ? '5+' : count}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                                {/* Visual Separator */}
                                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                              </>
                            )}

                            {dashboardData.data.profile.desiredBathrooms?.length > 0 && (
                              <>
                                <div className="animate-in fade-in-50 slide-in-from-bottom-4" style={{ animationDelay: '400ms' }}>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Baños
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {dashboardData.data.profile.desiredBathrooms
                                      .sort((a: number, b: number) => a - b)
                                      .map((count: number, index: number) => (
                                        <span
                                          key={count}
                                          className="inline-flex items-center justify-center px-2.5 py-1.5 min-w-[45px] bg-blue-50 text-blue-800 rounded-md text-xs font-bold border border-blue-100 shadow-sm"
                                          style={{ animationDelay: `${450 + index * 50}ms` }}
                                        >
                                          {count === 4 ? '4+' : count}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                                {/* Visual Separator */}
                                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                              </>
                            )}

                            {dashboardData.data.profile.desiredParkingSpaces?.length > 0 && (
                              <>
                                <div className="animate-in fade-in-50 slide-in-from-bottom-4" style={{ animationDelay: '500ms' }}>
                                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                    Parqueos
                                  </p>
                                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                                    {dashboardData.data.profile.desiredParkingSpaces
                                      .sort((a: number, b: number) => a - b)
                                      .map((count: number, index: number) => (
                                        <span
                                          key={count}
                                          className="inline-flex items-center justify-center px-2.5 py-1.5 min-w-[45px] bg-blue-50 text-blue-800 rounded-md text-xs font-bold border border-blue-100 shadow-sm"
                                          style={{ animationDelay: `${550 + index * 50}ms` }}
                                        >
                                          {count === 3 ? '3+' : count}
                                        </span>
                                      ))}
                                  </div>
                                </div>
                                {/* Visual Separator */}
                                <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                              </>
                            )}

                            {/* Mascotas - Siempre mostrar */}
                            <div className="animate-in fade-in-50 slide-in-from-bottom-4" style={{ animationDelay: '600ms' }}>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                Mascotas
                              </p>
                              <div className="flex flex-wrap gap-1.5 md:gap-2">
                                {dashboardData.data.profile.hasPets ? (
                                  dashboardData.data.profile.petDetails ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-800 rounded-md text-xs font-semibold border border-blue-100 shadow-sm">
                                      <span className="text-sm">🐾</span>
                                      {dashboardData.data.profile.petDetails}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-800 rounded-md text-xs font-semibold border border-blue-100 shadow-sm">
                                      <span className="text-sm">🐾</span>
                                      Sí
                                    </span>
                                  )
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 text-gray-700 rounded-md text-xs font-semibold border border-gray-200 shadow-sm">
                                    No
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Edit Profile Button - Primary Action */}
                      <div className="pt-5 mt-1">
                        <div className="h-px bg-gradient-to-r from-transparent via-blue-200 to-transparent mb-5"></div>
                        <Button
                          onClick={() => router.push('/tenant/profile')}
                          size="default"
                          className="w-full md:w-auto bg-blue-600 text-white font-semibold rounded-lg px-5 py-2.5 flex items-center justify-center gap-2 shadow-md shadow-blue-200/50"
                        >
                          <Edit className="h-4 w-4" />
                          Editar Perfil
                        </Button>
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
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all duration-300">
      {/* Header - Clickable */}
      <div
        className={cn(
          "p-5 cursor-pointer relative transition-all duration-300",
          isExpanded
            ? "bg-gradient-to-br from-blue-50/40 to-purple-50/20 border-b border-gray-200"
            : "hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50"
        )}
        onClick={() => onToggleExpand(search.id)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors duration-200 truncate">
                {search.profileName || search.name || 'Búsqueda sin nombre'}
              </h3>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-blue-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <p className="text-sm font-medium text-gray-600">
                L.{search.searchCriteria?.budgetMin?.toLocaleString() || '0'} - L.{search.searchCriteria?.budgetMax?.toLocaleString() || '0'}
              </p>
            </div>
            {search.newMatchCount > 0 && (
              <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-md">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                {search.newMatchCount} nuevas coincidencias
              </div>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-blue-50 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                if (search.id) router.push(`/tenant/searches/${search.id}`);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-blue-50 hover:text-blue-600"
              onClick={(e) => {
                e.stopPropagation();
                if (search.id) router.push(`/tenant/searches/${search.id}/edit`);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="hover:bg-red-50 hover:text-red-600"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Expandable Content - Properties Grid */}
      {isExpanded && (
        <div className="p-6 bg-gray-50">
          {loadingResults ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-sm text-gray-600">Cargando propiedades...</p>
              </div>
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No se encontraron propiedades</p>
              <p className="text-sm text-gray-500 mt-1">
                Intenta ajustar los criterios de búsqueda
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-4">
                {properties.length} {properties.length === 1 ? 'propiedad encontrada' : 'propiedades encontradas'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
