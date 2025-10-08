/**
 * Tenant Dashboard Page
 * Página principal del dashboard del inquilino
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/tenant/dashboard/DashboardHeader';
import { ProfileCompletionProgress } from '@/components/tenant/profile/ProfileCompletionProgress';
import { useTenantDashboard } from '@/hooks/tenant/useTenantDashboard';
import { useProfileCompletionStatus } from '@/hooks/tenant/useTenantProfile';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye, Trash2 } from 'lucide-react';

export default function TenantDashboardPage() {
  const router = useRouter();
  const { data: dashboardData, isLoading } = useTenantDashboard();
  const { data: completionStatus } = useProfileCompletionStatus();

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

  const userName = dashboardData?.profile?.personalInfo?.fullName?.split(' ')[0] || 'Usuario';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <DashboardHeader userName={userName} stats={dashboardData?.stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Saved Searches Section */}
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

              {!dashboardData?.savedSearches?.length ? (
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
                  {dashboardData.savedSearches.slice(0, 3).map((search) => (
                    <SavedSearchCard key={search.id} search={search} />
                  ))}
                  {dashboardData.savedSearches.length > 3 && (
                    <Button
                      onClick={() => router.push('/tenant/searches')}
                      variant="ghost"
                      className="w-full"
                    >
                      Ver Todas ({dashboardData.savedSearches.length})
                    </Button>
                  )}
                </div>
              )}
            </section>

            {/* Favorites Section */}
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

              {!dashboardData?.favorites?.length ? (
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
                  {dashboardData.favorites.slice(0, 4).map((favorite) => (
                    <FavoritePropertyCard key={favorite.id} favorite={favorite} />
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Profile Completion Widget */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Mi Perfil
              </h2>
              {completionStatus && (
                <ProfileCompletionProgress
                  percentage={completionStatus.percentage}
                  missingFields={completionStatus.missingFields}
                  nextSteps={completionStatus.nextSteps}
                  showDetails={true}
                  size="small"
                />
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

// Missing imports
import { Search, BookmarkIcon, Check } from 'lucide-react';
