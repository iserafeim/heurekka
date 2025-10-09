/**
 * Dashboard Header Component
 * Cabecera del dashboard con saludo y quick stats
 */

'use client';

import React from 'react';
import { BookmarkIcon, MessageSquare, Search, CheckCircle2 } from 'lucide-react';
import type { DashboardStats } from '@/types/tenant';

interface DashboardHeaderProps {
  userName?: string;
  stats?: DashboardStats;
  onSectionClick?: (sectionId: string) => void;
  activeTab?: string;
}

export function DashboardHeader({ userName = 'Usuario', stats, onSectionClick, activeTab }: DashboardHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight">
          ¡Hola, {userName}!{' '}
          <span className="inline-block animate-[wave_0.5s_ease-in-out] origin-[70%_70%]">👋</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 font-light mt-2">
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
            isActive={activeTab === 'saved-searches'}
          />
          <StatCard
            icon={<BookmarkIcon className="h-6 w-6" />}
            label="Favoritos"
            value={stats.favoritesCount}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            onClick={() => onSectionClick?.('favorites')}
            isActive={activeTab === 'favorites'}
          />
          <StatCard
            icon={<MessageSquare className="h-6 w-6" />}
            label="Conversaciones"
            value={stats.conversationsCount}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
            onClick={() => onSectionClick?.('conversations')}
            isActive={activeTab === 'conversations'}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, badge, iconBg, iconColor, onClick, isActive }: any) {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-4 transition-all duration-300 cursor-pointer ${
        isActive
          ? 'bg-blue-50 border-blue-600 shadow-lg scale-[1.02]'
          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md hover:scale-[1.01] shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${isActive ? `${iconBg} ${iconColor}` : `${iconBg} ${iconColor}`} p-2.5 rounded-xl shadow-sm`}>
            {icon}
          </div>
          <div>
            <p className={`text-xs font-medium ${isActive ? 'text-blue-700' : 'text-gray-600'}`}>
              {label}
            </p>
            <p className={`text-2xl font-bold ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
              {value}
            </p>
          </div>
        </div>
        {badge && (
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full shadow-sm ${
            isActive
              ? 'bg-blue-100 text-blue-700 border border-blue-200'
              : 'bg-blue-100 text-blue-700 border border-blue-200'
          }`}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}
