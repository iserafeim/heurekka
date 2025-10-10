/**
 * Tenant Dashboard Page
 * Página principal del dashboard del inquilino - Rediseñado con Sidebar
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenantDashboard } from '@/hooks/tenant/useTenantDashboard';
import { useDeleteSavedSearch } from '@/hooks/tenant/useSavedSearches';
import { TenantSidebar } from '@/components/tenant/TenantSidebar';
import { TenantHeader } from '@/components/tenant/TenantHeader';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import { toast } from 'sonner';

type TabSection = 'saved-searches' | 'favorites' | 'conversations' | 'profile';

export default function TenantDashboardPage() {
  const router = useRouter();
  const { data: dashboardData, isLoading } = useTenantDashboard();
  const [activeTab, setActiveTab] = useState<TabSection>('saved-searches');

  const handleTabChange = (sectionId: string) => {
    setActiveTab(sectionId as TabSection);
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
                            <SavedSearchCard key={search.id} search={search} />
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
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                          Propiedades Favoritas
                        </h2>
                        <Button
                          onClick={() => router.push('/tenant/favorites')}
                          size="sm"
                          variant="outline"
                          className="border-blue-600 text-blue-600 hover:bg-blue-50"
                        >
                          Ver Todas
                        </Button>
                      </div>

                      {!dashboardData?.data?.favorites?.length ? (
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {dashboardData.data.favorites.slice(0, 4).map((favorite) => (
                            <FavoritePropertyCard key={favorite.id} favorite={favorite} />
                          ))}
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
                    <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50 transition-shadow duration-300 p-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-8">
                        Mi Perfil
                      </h2>

                      {/* Primary Identity Section */}
                      <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 border border-blue-100 mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-2xl flex-shrink-0">
                            {dashboardData.data.profile.fullName.split(' ').map((n: string) => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-2xl font-bold text-gray-900 truncate">
                              {dashboardData.data.profile.fullName}
                            </h3>
                            <p className="text-lg text-gray-600">{dashboardData.data.profile.phone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Search Criteria Section */}
                      <div className="mb-8">
                        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                          Criterios de Búsqueda
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(dashboardData.data.profile.budgetMin || dashboardData.data.profile.budgetMax) && (
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                              <DollarSign className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                                  Presupuesto Mensual
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                  L.{dashboardData.data.profile.budgetMin?.toLocaleString() || '0'} - L.{dashboardData.data.profile.budgetMax?.toLocaleString() || '0'}
                                </p>
                              </div>
                            </div>
                          )}

                          {dashboardData.data.profile.moveDate && (
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                              <Calendar className="w-6 h-6 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                                  ¿Cuándo deseas mudarte?
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                  {getMoveDateRange(dashboardData.data.profile.moveDate)}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Preferences Section */}
                      {(dashboardData.data.profile.propertyTypes?.length > 0 ||
                        dashboardData.data.profile.preferredAreas?.length > 0) && (
                        <div className="mb-8">
                          <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                            Preferencias
                          </h4>

                          <div className="space-y-6">
                            {dashboardData.data.profile.propertyTypes?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                                  Tipo de Propiedad
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {dashboardData.data.profile.propertyTypes.map((type: string) => (
                                    <span
                                      key={type}
                                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 hover:bg-blue-100 transition-colors duration-150"
                                    >
                                      <Home className="w-4 h-4" />
                                      {type === 'apartment' ? 'Apartamento' : type === 'house' ? 'Casa' : type}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {dashboardData.data.profile.preferredAreas?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                                  Zonas Preferidas
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {dashboardData.data.profile.preferredAreas.map((area: string) => (
                                    <span
                                      key={area}
                                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100 hover:bg-emerald-100 transition-colors duration-150"
                                    >
                                      <MapPin className="w-4 h-4" />
                                      {area}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {dashboardData.data.profile.desiredBedrooms?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                                  Habitaciones
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {dashboardData.data.profile.desiredBedrooms
                                    .sort((a: number, b: number) => a - b)
                                    .map((count: number) => (
                                      <span
                                        key={count}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100 hover:bg-purple-100 transition-colors duration-150"
                                      >
                                        {count === 5 ? '5+' : count}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}

                            {dashboardData.data.profile.desiredBathrooms?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                                  Baños
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {dashboardData.data.profile.desiredBathrooms
                                    .sort((a: number, b: number) => a - b)
                                    .map((count: number) => (
                                      <span
                                        key={count}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-cyan-50 text-cyan-700 rounded-lg text-sm font-medium border border-cyan-100 hover:bg-cyan-100 transition-colors duration-150"
                                      >
                                        {count === 4 ? '4+' : count}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}

                            {dashboardData.data.profile.desiredParkingSpaces?.length > 0 && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                                  Parqueos
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {dashboardData.data.profile.desiredParkingSpaces
                                    .sort((a: number, b: number) => a - b)
                                    .map((count: number) => (
                                      <span
                                        key={count}
                                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium border border-amber-100 hover:bg-amber-100 transition-colors duration-150"
                                      >
                                        {count === 3 ? '3+' : count}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}

                            {dashboardData.data.profile.hasPets && dashboardData.data.profile.petDetails && (
                              <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                                  Mascotas
                                </p>
                                <p className="text-sm text-gray-700 bg-orange-50 border border-orange-100 rounded-lg p-3">
                                  {dashboardData.data.profile.petDetails}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="pt-6 border-t-2 border-gray-100">
                        <Button
                          onClick={() => router.push('/tenant/profile')}
                          size="lg"
                          className="w-full md:w-auto bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-all duration-150 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                        >
                          <Edit className="h-5 w-5" />
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
function SavedSearchCard({ search }: any) {
  const router = useRouter();
  const deleteSearch = useDeleteSavedSearch();

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
    <div className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/40 group-hover:to-purple-50/20 transition-all duration-300"></div>
      <div className="relative flex items-start justify-between">
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => search.id && router.push(`/tenant/searches/${search.id}`)}
        >
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors duration-200 truncate">
            {search.profileName || search.name || 'Búsqueda sin nombre'}
          </h3>
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
