/**
 * Analytics Tab Component
 * Dashboard analytics and metrics for landlord
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  MessageSquare,
  Users,
  CheckCircle2,
  Eye,
  Calendar,
  RefreshCcw,
} from 'lucide-react';
import { useLandlordAnalytics, DateRange } from '@/hooks/landlord/useLandlordAnalytics';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export function AnalyticsTab() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

  const {
    metrics,
    isLoading,
    refetch,
    totalLeads,
    newLeads,
    responseRate,
    avgResponseTime,
    conversionRate,
    qualityDistribution,
    priorityDistribution,
    sourceDistribution,
  } = useLandlordAnalytics(dateRange);

  // Preset date ranges
  const handleSetDateRange = (preset: 'week' | 'month' | 'all') => {
    const now = new Date();
    switch (preset) {
      case 'week':
        setDateRange({ from: subDays(now, 7), to: now });
        break;
      case 'month':
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case 'all':
        setDateRange(undefined);
        break;
    }
  };

  // Prepare chart data
  const qualityData = [
    { name: 'Alta', value: qualityDistribution.high, color: '#10b981' },
    { name: 'Media', value: qualityDistribution.medium, color: '#f59e0b' },
    { name: 'Baja', value: qualityDistribution.low, color: '#6b7280' },
  ];

  const priorityData = [
    { name: 'Alta', value: priorityDistribution.high, color: '#ef4444' },
    { name: 'Media', value: priorityDistribution.medium, color: '#eab308' },
    { name: 'Baja', value: priorityDistribution.low, color: '#6b7280' },
  ];

  const sourceData = [
    { name: 'Directa', value: sourceDistribution.direct },
    { name: 'Marketplace', value: sourceDistribution.marketplace },
    { name: 'Búsqueda', value: sourceDistribution.search },
    { name: 'Referido', value: sourceDistribution.referral },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Métricas y estadísticas de tus leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl shadow-sm hover:shadow-md transition-all"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Date Range Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleSetDateRange('all')}
          className={`px-4 py-2 text-sm font-medium !rounded-xl border shadow-sm hover:shadow-md transition-all ${
            !dateRange
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Todo el tiempo
        </button>
        <button
          onClick={() => handleSetDateRange('week')}
          className={`px-4 py-2 text-sm font-medium !rounded-xl border shadow-sm hover:shadow-md transition-all flex items-center gap-1 ${
            dateRange && dateRange.from && (new Date().getTime() - dateRange.from.getTime()) <= 7 * 24 * 60 * 60 * 1000
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Calendar className="h-3 w-3" />
          Última semana
        </button>
        <button
          onClick={() => handleSetDateRange('month')}
          className={`px-4 py-2 text-sm font-medium !rounded-xl border shadow-sm hover:shadow-md transition-all flex items-center gap-1 ${
            dateRange && dateRange.from && dateRange.from.getMonth() === new Date().getMonth()
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Calendar className="h-3 w-3" />
          Este mes
        </button>
      </div>

      {/* Loading State */}
      {isLoading && !metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {/* Metrics Overview */}
      {!isLoading && metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Leads */}
            <MetricCard
              title="Total Leads"
              value={totalLeads}
              icon={Users}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
            />

            {/* Response Rate */}
            <MetricCard
              title="Tasa de Respuesta"
              value={`${responseRate.toFixed(1)}%`}
              icon={MessageSquare}
              iconColor="text-green-600"
              iconBg="bg-green-100"
              trend={responseRate >= 70 ? 'up' : 'down'}
            />

            {/* Avg Response Time */}
            <MetricCard
              title="Tiempo Promedio de Respuesta"
              value={`${Math.round(avgResponseTime)} min`}
              icon={Clock}
              iconColor="text-orange-600"
              iconBg="bg-orange-100"
              trend={avgResponseTime <= 30 ? 'up' : 'down'}
            />

            {/* Conversion Rate */}
            <MetricCard
              title="Tasa de Conversión"
              value={`${conversionRate.toFixed(1)}%`}
              icon={CheckCircle2}
              iconColor="text-purple-600"
              iconBg="bg-purple-100"
              trend={conversionRate >= 15 ? 'up' : 'down'}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality Distribution */}
            <Card className="rounded-2xl border border-gray-200 shadow-lg shadow-blue-100/30">
              <CardHeader>
                <CardTitle className="text-lg">Distribución por Calidad</CardTitle>
                <CardDescription>Calidad de leads recibidos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={qualityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {qualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Priority Distribution */}
            <Card className="rounded-2xl border border-gray-200 shadow-lg shadow-blue-100/30">
              <CardHeader>
                <CardTitle className="text-lg">Distribución por Prioridad</CardTitle>
                <CardDescription>Prioridad de leads recibidos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Source Distribution */}
            <Card className="lg:col-span-2 rounded-2xl border border-gray-200 shadow-lg shadow-blue-100/30">
              <CardHeader>
                <CardTitle className="text-lg">Distribución por Fuente</CardTitle>
                <CardDescription>De dónde provienen tus leads</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Status Breakdown */}
          <Card className="rounded-2xl border border-gray-200 shadow-lg shadow-blue-100/30">
            <CardHeader>
              <CardTitle className="text-lg">Desglose por Estado</CardTitle>
              <CardDescription>Estado actual de tus leads</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatusBadge label="Nuevos" count={metrics.newLeads} color="bg-green-100 text-green-800" />
                <StatusBadge label="Vistos" count={metrics.viewedLeads} color="bg-blue-100 text-blue-800" />
                <StatusBadge label="Contactados" count={metrics.contactedLeads} color="bg-purple-100 text-purple-800" />
                <StatusBadge label="Agendados" count={metrics.scheduledLeads} color="bg-orange-100 text-orange-800" />
                <StatusBadge label="Completados" count={metrics.completedLeads} color="bg-gray-100 text-gray-800" />
                <StatusBadge label="Rechazados" count={metrics.rejectedLeads} color="bg-red-100 text-red-800" />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !metrics && (
        <Card className="rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-shadow duration-300">
          <CardContent className="py-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
              <BarChart className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay datos disponibles
            </h3>
            <p className="text-sm text-gray-600">
              Las métricas aparecerán cuando empieces a recibir leads
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper Components

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  trend?: 'up' | 'down';
}

function MetricCard({ title, value, icon: Icon, iconColor, iconBg, trend }: MetricCardProps) {
  return (
    <Card className="rounded-2xl border border-gray-200 shadow-lg shadow-blue-100/30 hover:shadow-xl hover:shadow-blue-200/40 transition-all duration-300">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          </div>
          <div className={`h-12 w-12 rounded-full ${iconBg} flex items-center justify-center`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1">
            {trend === 'up' ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={`text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? 'Bueno' : 'Mejorar'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatusBadgeProps {
  label: string;
  count: number;
  color: string;
}

function StatusBadge({ label, count, color }: StatusBadgeProps) {
  return (
    <div className={`${color} rounded-lg p-3 text-center`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs font-medium mt-1">{label}</p>
    </div>
  );
}
