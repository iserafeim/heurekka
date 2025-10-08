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
import { Plus, Edit, Eye, Trash2, MessageSquare } from 'lucide-react';

type TabSection = 'saved-searches' | 'favorites' | 'conversations';

export default function TenantDashboardPage() {
  const router = useRouter();
  const { data: dashboardData, isLoading } = useTenantDashboard();
  const { data: completionStatus } = useProfileCompletionStatus();
  const [activeTab, setActiveTab] = useState<TabSection>('saved-searches');

  const handleTabChange = (sectionId: string) => {
    setActiveTab(sectionId as TabSection);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const userName = dashboardData?.data?.profile?.fullName?.split(' ')[0] || 'Usuario';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <DashboardHeader
          userName={userName}
          stats={dashboardData?.data?.stats}
          onSectionClick={handleTabChange}
          activeTab={activeTab}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Searches Section */}
            {activeTab === 'saved-searches' && (
              <section className="bg-white rounded-lg border border-gray-200 p-6">
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
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">
                      No tienes búsquedas guardadas aún
                    </p>
                    <Button
                      onClick={() => router.push('/tenant/searches/new')}
                      variant="outline"
                    >
                      Crear Primera Búsqueda
                    </Button>
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
              <section className="bg-white rounded-lg border border-gray-200 p-6">
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
                  <div className="text-center py-8">
                    <BookmarkIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">
                      No tienes propiedades favoritas aún
                    </p>
                    <Button
                      onClick={() => router.push('/propiedades')}
                      variant="outline"
                    >
                      Explorar Propiedades
                    </Button>
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
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Conversaciones
                  </h2>
                </div>

                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">
                    Aún no has iniciado conversaciones
                  </p>
                  <p className="text-sm text-gray-500">
                    Las conversaciones con propietarios aparecerán aquí
                  </p>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Profile Completion Widget */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Mi Perfil
              </h2>
              {completionStatus?.data && (
                <ProfileCompletionProgress
                  percentage={completionStatus.data.percentage}
                  missingFields={completionStatus.data.missingFields}
                  nextSteps={completionStatus.data.nextSteps}
                  showDetails={true}
                  size="small"
                />
              )}

              {/* Profile Summary */}
              {dashboardData?.data?.profile && (
                <div className="mt-6 space-y-3 text-sm">
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Tus Datos</h3>

                    {/* Basic Info */}
                    <div className="space-y-2">
                      <ProfileDataItem
                        label="Nombre"
                        value={dashboardData.data.profile.fullName}
                      />
                      <ProfileDataItem
                        label="Teléfono"
                        value={dashboardData.data.profile.phone}
                      />
                      {dashboardData.data.profile.occupation && (
                        <ProfileDataItem
                          label="Ocupación"
                          value={dashboardData.data.profile.occupation}
                        />
                      )}
                    </div>

                    {/* Budget */}
                    {(dashboardData.data.profile.budgetMin || dashboardData.data.profile.budgetMax) && (
                      <div className="mt-3 pt-3 border-t">
                        <ProfileDataItem
                          label="Presupuesto"
                          value={`L.${dashboardData.data.profile.budgetMin?.toLocaleString() || '0'} - L.${dashboardData.data.profile.budgetMax?.toLocaleString() || '0'}`}
                        />
                      </div>
                    )}

                    {/* Move Date */}
                    {dashboardData.data.profile.moveDate && (
                      <ProfileDataItem
                        label="Fecha de mudanza"
                        value={new Date(dashboardData.data.profile.moveDate).toLocaleDateString('es-HN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      />
                    )}

                    {/* Occupants */}
                    {dashboardData.data.profile.occupants && (
                      <ProfileDataItem
                        label="Ocupantes"
                        value={dashboardData.data.profile.occupants}
                      />
                    )}

                    {/* Property Types */}
                    {dashboardData.data.profile.propertyTypes && dashboardData.data.profile.propertyTypes.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-600 mb-1">Tipo de propiedad</p>
                        <div className="flex flex-wrap gap-1">
                          {dashboardData.data.profile.propertyTypes.map((type: string) => (
                            <span key={type} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                              {type === 'apartment' ? 'Apartamento' : type === 'house' ? 'Casa' : type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Preferred Areas */}
                    {dashboardData.data.profile.preferredAreas && dashboardData.data.profile.preferredAreas.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-600 mb-1">Zonas preferidas</p>
                        <div className="flex flex-wrap gap-1">
                          {dashboardData.data.profile.preferredAreas.map((area: string) => (
                            <span key={area} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs">
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pets */}
                    {dashboardData.data.profile.hasPets && (
                      <div className="mt-3 pt-3 border-t">
                        <ProfileDataItem
                          label="Mascotas"
                          value={dashboardData.data.profile.petDetails || 'Sí'}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Button
                onClick={() => router.push('/tenant/profile')}
                variant="outline"
                className="w-full mt-4"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </section>

            {/* Upgrade CTA */}
            <section className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-6 text-white">
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
    </div>
  );
}

// Helper Components
function SavedSearchCard({ search }: any) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{search.name}</h3>
          <p className="text-sm text-gray-600 mt-1">
            L.{search.criteria.budgetMin?.toLocaleString()} - L.{search.criteria.budgetMax?.toLocaleString()}
          </p>
          {search.newMatchCount > 0 && (
            <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
              {search.newMatchCount} nuevas coincidencias
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost">
            <Eye className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function FavoritePropertyCard({ favorite }: any) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gray-200"></div>
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-sm">
          {favorite.property?.title || 'Propiedad'}
        </p>
        <p className="text-blue-600 font-bold mt-1">
          L.{favorite.property?.price?.toLocaleString()}/mes
        </p>
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
