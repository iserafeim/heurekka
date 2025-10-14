/**
 * Analytics Tab Component
 * Dashboard analytics and metrics for landlord
 * Simplified version focusing on actionable metrics
 */

'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  TrendingUp,
  Users,
  Eye,
  Calendar as CalendarIcon,
  RefreshCcw,
  BarChart3,
} from 'lucide-react';
import { useLandlordAnalytics, DateRange } from '@/hooks/landlord/useLandlordAnalytics';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

export function AnalyticsTab() {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [timeRange, setTimeRange] = React.useState<'7d' | '30d' | '90d' | 'custom'>('7d');
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [tempDateRange, setTempDateRange] = React.useState<DateRange | undefined>(undefined);

  const {
    metrics,
    isLoading,
    refetch,
    totalLeads,
    newLeads,
    totalViews,
    contactRate,
    leadsTrend,
    propertiesPerformance,
  } = useLandlordAnalytics(dateRange);

  // Initialize with 7 days on mount
  React.useEffect(() => {
    const now = new Date();
    setDateRange({ from: subDays(now, 7), to: now });
  }, []);

  // Handle time range change from buttons
  const handleTimeRangeChange = (value: '7d' | '30d' | '90d' | 'custom') => {
    const now = new Date();
    switch (value) {
      case '7d':
        setTimeRange(value);
        setDateRange({ from: subDays(now, 7), to: now });
        setShowDatePicker(false);
        break;
      case '30d':
        setTimeRange(value);
        setDateRange({ from: subDays(now, 30), to: now });
        setShowDatePicker(false);
        break;
      case '90d':
        setTimeRange(value);
        setDateRange({ from: subDays(now, 90), to: now });
        setShowDatePicker(false);
        break;
      case 'custom':
        setTempDateRange(dateRange);
        setShowDatePicker(true);
        break;
    }
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    if (tempDateRange?.from && tempDateRange?.to) {
      setTimeRange('custom');
      setDateRange(tempDateRange);
      setShowDatePicker(false);
    }
  };

  // Chart configuration for analytics trend
  const chartConfig = {
    views: {
      label: "Vistas",
      color: "hsl(210, 100%, 78%)", // Light blue like "Desktop"
    },
    leads: {
      label: "Leads",
      color: "hsl(217, 91%, 60%)", // Medium blue like "Mobile"
    },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Métricas y rendimiento de tus propiedades
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
          onClick={() => handleTimeRangeChange('7d')}
          className={`px-4 py-2 text-sm font-medium !rounded-xl border shadow-sm hover:shadow-md transition-all ${
            timeRange === '7d'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Últimos 7 días
        </button>
        <button
          onClick={() => handleTimeRangeChange('30d')}
          className={`px-4 py-2 text-sm font-medium !rounded-xl border shadow-sm hover:shadow-md transition-all ${
            timeRange === '30d'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Último mes
        </button>
        <button
          onClick={() => handleTimeRangeChange('90d')}
          className={`px-4 py-2 text-sm font-medium !rounded-xl border shadow-sm hover:shadow-md transition-all ${
            timeRange === '90d'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Últimos 3 meses
        </button>
        <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
          <PopoverTrigger asChild>
            <button
              onClick={() => handleTimeRangeChange('custom')}
              className={`px-4 py-2 text-sm font-medium !rounded-xl border shadow-sm hover:shadow-md transition-all flex items-center gap-2 ${
                timeRange === 'custom'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              Rango personalizado
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-white border-gray-200 rounded-xl" align="start">
            <div className="p-3 space-y-3 bg-white rounded-xl">
              <div className="space-y-2">
                <div className="text-sm font-medium mb-2">Seleccionar rango de fechas</div>
                <Calendar
                  mode="range"
                  selected={tempDateRange}
                  onSelect={setTempDateRange}
                  locale={es}
                  className="rounded-xl border border-gray-200"
                  disabled={(date) => date > new Date()}
                  numberOfMonths={1}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDatePicker(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={applyCustomDateRange}
                  disabled={!tempDateRange?.from || !tempDateRange?.to}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white flex items-center justify-center z-40 min-h-[500px]">
          <div className="flex flex-col items-center gap-4">
            <RefreshCcw className="h-12 w-12 text-blue-600 animate-spin" />
            <p className="text-sm text-gray-600 font-medium">Cargando datos...</p>
          </div>
        </div>
      )}

      {/* Metrics Overview */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Leads */}
            <MetricCard
              title="Total Leads"
              value={totalLeads}
              icon={Users}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
              subtitle="Contactos recibidos"
            />

            {/* New Leads (Unread) */}
            <MetricCard
              title="Nuevos sin Ver"
              value={newLeads}
              icon={BarChart3}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
              subtitle="Requieren atención"
            />

            {/* Total Views */}
            <MetricCard
              title="Vistas Totales"
              value={totalViews.toLocaleString()}
              icon={Eye}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
              subtitle="Visualizaciones"
            />

            {/* Contact Rate */}
            <MetricCard
              title="Tasa de Contacto"
              value={`${contactRate.toFixed(1)}%`}
              icon={TrendingUp}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
              subtitle="Vistas → Leads"
            />
          </div>

          {/* Analytics Trend Chart (Views & Leads) */}
          <Card className="rounded-2xl border border-gray-200 shadow-lg shadow-blue-100/30 pt-0">
            <CardHeader className="flex items-center gap-2 space-y-0 border-b border-gray-100 py-5">
              <div className="flex-1">
                <CardTitle className="text-lg">Tendencia de Vistas y Leads</CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  {timeRange === '7d' && 'Últimos 7 días'}
                  {timeRange === '30d' && 'Último mes'}
                  {timeRange === '90d' && 'Últimos 3 meses'}
                  {timeRange === 'custom' && dateRange?.from && dateRange?.to &&
                    `${format(dateRange.from, 'dd MMM', { locale: es })} - ${format(dateRange.to, 'dd MMM', { locale: es })}`}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
              {leadsTrend && leadsTrend.length > 0 ? (
                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                  <AreaChart data={leadsTrend}>
                    <defs>
                      <linearGradient id="fillLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-leads)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-leads)" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="fillViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-views)" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="var(--color-views)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="#e5e7eb"
                      strokeDasharray="0"
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tick={{ fill: '#9ca3af', fontSize: 12, opacity: 1 }}
                      style={{ fill: '#9ca3af' }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                        });
                      }}
                    />
                    <YAxis
                      hide
                      domain={[0, 'dataMax + 20']}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                          labelFormatter={(value) => {
                            return new Date(value).toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric',
                            });
                          }}
                          indicator="dot"
                        />
                      }
                    />
                    <Area
                      dataKey="views"
                      type="natural"
                      fill="url(#fillViews)"
                      stroke="var(--color-views)"
                      strokeWidth={1}
                    />
                    <Area
                      dataKey="leads"
                      type="natural"
                      fill="url(#fillLeads)"
                      stroke="var(--color-leads)"
                      strokeWidth={1}
                    />
                    <ChartLegend content={<ChartLegendContent className="gap-4" />} />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">No hay datos de tendencia aún</p>
                  <p className="text-xs text-gray-500">El gráfico mostrará tus vistas y leads a lo largo del tiempo</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Performance Table */}
          <Card className="rounded-2xl border border-gray-200 shadow-lg shadow-blue-100/30">
            <CardHeader>
              <CardTitle className="text-lg">Rendimiento por Propiedad</CardTitle>
              <CardDescription>Vistas, leads y tasa de conversión de cada propiedad</CardDescription>
            </CardHeader>
            <CardContent>
              {propertiesPerformance && propertiesPerformance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-sm text-gray-900">Propiedad</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-gray-900">Vistas</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-gray-900">Leads</th>
                        <th className="text-right py-3 px-4 font-semibold text-sm text-gray-900">Tasa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertiesPerformance.map((property, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{property.name}</div>
                            <div className="text-xs text-gray-500">{property.location}</div>
                          </td>
                          <td className="text-right py-3 px-4 text-gray-700">{property.views.toLocaleString()}</td>
                          <td className="text-right py-3 px-4 text-gray-700">{property.leads}</td>
                          <td className="text-right py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              property.contactRate >= 3
                                ? 'bg-green-100 text-green-800'
                                : property.contactRate >= 2
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {property.contactRate.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">No hay datos de propiedades aún</p>
                  <p className="text-xs text-gray-500">Las métricas aparecerán cuando tus propiedades reciban vistas</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!isLoading && !metrics && (
        <Card className="rounded-2xl border border-gray-200 shadow-xl shadow-blue-100/50 hover:shadow-2xl hover:shadow-blue-200/50 transition-shadow duration-300">
          <CardContent className="py-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-inner">
              <BarChart3 className="h-12 w-12 text-blue-600" />
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
  subtitle?: string;
}

function MetricCard({ title, value, icon: Icon, iconColor, iconBg, subtitle }: MetricCardProps) {
  return (
    <Card className="rounded-2xl border border-gray-200 shadow-lg shadow-blue-100/30 hover:shadow-xl hover:shadow-blue-200/40 transition-all duration-300">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-full ${iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
