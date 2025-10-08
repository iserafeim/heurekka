/**
 * Dashboard Header Component
 * Cabecera del dashboard con saludo y quick stats
 */

'use client';

import React from 'react';
import { BookmarkIcon, MessageSquare, Search } from 'lucide-react';
import type { DashboardStats } from '@/types/tenant';

interface DashboardHeaderProps {
  userName?: string;
  stats?: DashboardStats;
  onSectionClick?: (sectionId: string) => void;
}

export function DashboardHeader({ userName = 'Usuario', stats, onSectionClick }: DashboardHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Hola, {userName}! 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Bienvenido a tu dashboard de búsqueda de propiedades
        </p>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={<Search className="h-6 w-6" />}
            label="Búsquedas Guardadas"
            value={stats.savedSearchesCount}
            badge={stats.newMatches > 0 ? `${stats.newMatches} nuevas` : undefined}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
            onClick={() => onSectionClick?.('saved-searches')}
          />
          <StatCard
            icon={<BookmarkIcon className="h-6 w-6" />}
            label="Favoritos"
            value={stats.favoritesCount}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            onClick={() => onSectionClick?.('favorites')}
          />
          <StatCard
            icon={<MessageSquare className="h-6 w-6" />}
            label="Conversaciones"
            value={stats.conversationsCount}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            onClick={() => onSectionClick?.('conversations')}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, badge, iconBg, iconColor, onClick }: any) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all cursor-pointer hover:border-blue-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${iconBg} ${iconColor} p-3 rounded-lg`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {badge && (
          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
