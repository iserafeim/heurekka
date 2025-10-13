/**
 * Lead Filters Component
 * Filter sidebar for leads list
 */

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Search, Filter } from 'lucide-react';
import { LeadFilters as LeadFiltersType } from '@/hooks/landlord/useLandlordLeads';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFilterChange: (filters: LeadFiltersType) => void;
  onReset: () => void;
}

export function LeadFilters({ filters, onFilterChange, onReset }: LeadFiltersProps) {
  const [searchQuery, setSearchQuery] = React.useState(filters.searchQuery || '');

  // Debounce search query
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== filters.searchQuery) {
        onFilterChange({ ...filters, searchQuery: searchQuery || undefined });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleStatusChange = (value: string) => {
    onFilterChange({
      ...filters,
      status: value === 'all' ? undefined : (value as any),
    });
  };

  const handlePriorityToggle = (priority: 'high' | 'medium' | 'low') => {
    const current = filters.priority || [];
    const updated = current.includes(priority)
      ? current.filter((p) => p !== priority)
      : [...current, priority];
    onFilterChange({
      ...filters,
      priority: updated.length > 0 ? updated : undefined,
    });
  };

  const handleQualityToggle = (quality: 'high' | 'medium' | 'low') => {
    const current = filters.quality || [];
    const updated = current.includes(quality)
      ? current.filter((q) => q !== quality)
      : [...current, quality];
    onFilterChange({
      ...filters,
      quality: updated.length > 0 ? updated : undefined,
    });
  };

  const activeFiltersCount = [
    filters.status,
    filters.priority?.length,
    filters.quality?.length,
    filters.searchQuery,
  ].filter(Boolean).length;

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-lg shadow-blue-100/30 sticky top-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Filtros</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs rounded-full">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onReset} className="h-8 px-2 text-xs rounded-xl hover:bg-blue-50 transition-all">
              <X className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search" className="text-sm font-medium">
            Buscar
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nombre o mensaje..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label htmlFor="status" className="text-sm font-medium">
            Estado
          </Label>
          <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="new">Nuevo</SelectItem>
              <SelectItem value="viewed">Visto</SelectItem>
              <SelectItem value="contacted">Contactado</SelectItem>
              <SelectItem value="scheduled">Agendado</SelectItem>
              <SelectItem value="completed">Completado</SelectItem>
              <SelectItem value="rejected">Rechazado</SelectItem>
              <SelectItem value="expired">Expirado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Prioridad</Label>
          <div className="flex flex-col gap-2">
            {(['high', 'medium', 'low'] as const).map((priority) => {
              const isSelected = filters.priority?.includes(priority);
              const labels = { high: 'Alta', medium: 'Media', low: 'Baja' };
              const colors = {
                high: 'border-red-300 bg-red-50 text-red-800 hover:bg-red-100',
                medium: 'border-yellow-300 bg-yellow-50 text-yellow-800 hover:bg-yellow-100',
                low: 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100',
              };

              return (
                <Button
                  key={priority}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePriorityToggle(priority)}
                  className={`justify-start rounded-xl transition-all hover:shadow-sm ${
                    isSelected
                      ? colors[priority]
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`mr-2 h-4 w-4 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'border-current' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-sm bg-current" />
                    )}
                  </div>
                  {labels[priority]}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Quality */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Calidad</Label>
          <div className="flex flex-col gap-2">
            {(['high', 'medium', 'low'] as const).map((quality) => {
              const isSelected = filters.quality?.includes(quality);
              const labels = { high: 'Alta', medium: 'Media', low: 'Baja' };
              const colors = {
                high: 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100',
                medium: 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
                low: 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100',
              };

              return (
                <Button
                  key={quality}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQualityToggle(quality)}
                  className={`justify-start rounded-xl transition-all hover:shadow-sm ${
                    isSelected
                      ? colors[quality]
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`mr-2 h-4 w-4 rounded border-2 flex items-center justify-center ${
                      isSelected ? 'border-current' : 'border-gray-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="h-2 w-2 rounded-sm bg-current" />
                    )}
                  </div>
                  {labels[quality]}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
