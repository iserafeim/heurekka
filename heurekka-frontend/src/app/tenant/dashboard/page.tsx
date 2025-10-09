/**
 * Tenant Dashboard Page
 * Página principal del dashboard del inquilino
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/tenant/dashboard/DashboardHeader';
import { ProfileCompletionProgress } from '@/components/tenant/profile/ProfileCompletionProgress';
import { useTenantDashboard } from '@/hooks/tenant/useTenantDashboard';
import { useProfileCompletionStatus } from '@/hooks/tenant/useTenantProfile';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye, Trash2, MessageSquare, User, Phone, Briefcase, DollarSign, Calendar, Users, Home, MapPin } from 'lucide-react';

type TabSection = 'saved-searches' | 'favorites' | 'conversations';

export default function TenantDashboardPage() {
  const router = useRouter();
  const { data: dashboardData, isLoading } = useTenantDashboard();
  const { data: completionStatus } = useProfileCompletionStatus();
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

  const userName = dashboardData?.data?.profile?.fullName?.split(' ')[0] || 'Usuario';

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <DashboardHeader
          userName={userName}
          stats={dashboardData?.data?.stats}
          onSectionClick={handleTabChange}
          activeTab={activeTab}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-8">
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
                    className="flex items-center gap-2"
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
                      className="rounded-xl shadow-lg hover:shadow-xl px-6 py-6"
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
                        className="w-full"
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
              <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-green-100/50 hover:shadow-2xl hover:shadow-green-200/50 transition-shadow duration-300 p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Propiedades Favoritas
                  </h2>
                  <Button
                    onClick={() => router.push('/tenant/favorites')}
                    size="sm"
                    variant="outline"
                  >
                    Ver Todas
                  </Button>
                </div>

                {!dashboardData?.data?.favorites?.length ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-200 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                      <BookmarkIcon className="h-12 w-12 text-green-600" />
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
                      className="rounded-xl shadow-lg hover:shadow-xl px-6 py-6 bg-green-600 hover:bg-green-700"
                    >
                      <Search className="h-5 w-5 mr-2" />
                      Explorar Propiedades
                    </Button>
                    <div className="mt-8 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl max-w-md mx-auto border border-green-100 shadow-sm">
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
              <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-purple-100/50 hover:shadow-2xl hover:shadow-purple-200/50 transition-shadow duration-300 p-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Conversaciones
                  </h2>
                </div>

                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-200 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
                    <MessageSquare className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Sin conversaciones aún
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Las conversaciones con propietarios aparecerán aquí cuando contactes propiedades de tu interés
                  </p>
                  <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl max-w-md mx-auto border border-purple-100 shadow-sm">
                    <p className="text-sm font-semibold text-gray-900 mb-2">💡 Tip</p>
                    <p className="text-sm text-gray-700">
                      Contacta propiedades desde la página de búsqueda o desde tus favoritos
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-8">
            {/* Profile Completion Widget */}
            <section className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/80 hover:shadow-2xl hover:shadow-gray-200/80 transition-shadow duration-300 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Mi Perfil
              </h2>
              {completionStatus?.data && (
                <div className="mb-6">
                  <ProfileCompletionProgress
                    percentage={completionStatus.data.percentage}
                    missingFields={completionStatus.data.missingFields}
                    nextSteps={completionStatus.data.nextSteps}
                    showDetails={true}
                    size="medium"
                  />
                </div>
              )}

              {/* Profile Summary */}
              {dashboardData?.data?.profile && (
                <div className="space-y-6">
                  {/* Primary Identity Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
                        {dashboardData.data.profile.fullName.split(' ').map((n: string) => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {dashboardData.data.profile.fullName}
                        </h3>
                        <p className="text-sm text-gray-600">{dashboardData.data.profile.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Search Criteria Section */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Criterios de Búsqueda
                    </h4>

                    {(dashboardData.data.profile.budgetMin || dashboardData.data.profile.budgetMax) && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <DollarSign className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Presupuesto Mensual
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            L.{dashboardData.data.profile.budgetMin?.toLocaleString() || '0'} - L.{dashboardData.data.profile.budgetMax?.toLocaleString() || '0'}
                          </p>
                        </div>
                      </div>
                    )}

                    {dashboardData.data.profile.moveDate && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            ¿Cuándo deseas mudarte?
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {getMoveDateRange(dashboardData.data.profile.moveDate)}
                          </p>
                        </div>
                      </div>
                    )}

                    {dashboardData.data.profile.occupants && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <Users className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                            Ocupantes
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {dashboardData.data.profile.occupants}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Preferences Section */}
                  {(dashboardData.data.profile.propertyTypes?.length > 0 ||
                    dashboardData.data.profile.preferredAreas?.length > 0) && (
                    <div className="pt-6 border-t-2 border-gray-100 space-y-4">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Preferencias
                      </h4>

                      {dashboardData.data.profile.propertyTypes?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Tipo de Propiedad
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {dashboardData.data.profile.propertyTypes.map((type: string) => (
                              <span
                                key={type}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium border border-blue-100 hover:bg-blue-100 transition-colors duration-150"
                              >
                                <Home className="w-3.5 h-3.5" />
                                {type === 'apartment' ? 'Apartamento' : type === 'house' ? 'Casa' : type}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {dashboardData.data.profile.preferredAreas?.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                            Zonas Preferidas
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {dashboardData.data.profile.preferredAreas.map((area: string) => (
                              <span
                                key={area}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-100 hover:bg-emerald-100 transition-colors duration-150"
                              >
                                <MapPin className="w-3.5 h-3.5" />
                                {area}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 pt-6 border-t-2 border-gray-100">
                <Button
                  onClick={() => router.push('/tenant/profile')}
                  className="w-full h-12 bg-white border-2 border-gray-200 text-gray-700 font-semibold text-sm rounded-lg hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-all duration-150 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <Edit className="h-4 w-4" />
                  Editar Perfil
                </Button>
              </div>
            </section>

            {/* Upgrade CTA */}
            <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-2xl shadow-blue-500/30 hover:shadow-3xl hover:shadow-blue-600/40 transition-all duration-300 hover:scale-[1.02] p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">
                ¿Tienes una propiedad?
              </h3>
              <p className="text-sm text-blue-100 mb-4">
                Publica gratis y encuentra inquilinos
              </p>
              <ul className="space-y-2 text-sm mb-4">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Sin comisiones
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Alcance directo
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  Gestión simple
                </li>
              </ul>
              <Button
                onClick={() => router.push('/landlord/onboarding')}
                className="w-full bg-white text-blue-600 hover:bg-gray-100"
              >
                Publicar Propiedad
              </Button>
            </section>
          </div>
        </div>
    </div>
  );
}

// Helper Components
function SavedSearchCard({ search }: any) {
  return (
    <div className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 hover:scale-[1.02] cursor-pointer relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-50/0 group-hover:from-blue-50/40 group-hover:to-purple-50/20 transition-all duration-300"></div>
      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-700 transition-colors duration-200 truncate">
            {search.name}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <DollarSign className="h-4 w-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-600">
              L.{search.criteria.budgetMin?.toLocaleString()} - L.{search.criteria.budgetMax?.toLocaleString()}
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
          <Button size="sm" variant="ghost" className="hover:bg-blue-50 hover:text-blue-600">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="hover:bg-blue-50 hover:text-blue-600">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FavoritePropertyCard({ favorite }: any) {
  return (
    <div className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-green-400 hover:shadow-2xl hover:shadow-green-100/50 transition-all duration-300 hover:scale-[1.03] cursor-pointer">
      <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/10 group-hover:to-emerald-500/20 transition-all duration-300"></div>
        <div className="absolute top-3 right-3">
          <div className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <BookmarkIcon className="h-5 w-5 text-green-600 fill-current" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="font-bold text-base text-gray-900 group-hover:text-green-700 transition-colors duration-200 line-clamp-2 mb-2">
          {favorite.property?.title || 'Propiedad'}
        </p>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <p className="text-green-600 font-bold text-lg">
            L.{favorite.property?.price?.toLocaleString()}/mes
          </p>
        </div>
      </div>
    </div>
  );
}

// Profile Data Item Component
function ProfileDataItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-600">{label}</p>
      <p className="text-sm text-gray-900 font-medium">{value}</p>
    </div>
  );
}

// Missing imports
import { Search, BookmarkIcon, Check } from 'lucide-react';
