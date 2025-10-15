/**
 * Lead Filters Component
 * Horizontal filter bar for leads list
 */

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Search } from 'lucide-react';
import { LeadFilters as LeadFiltersType } from '@/hooks/landlord/useLandlordLeads';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface LeadFiltersProps {
  filters: LeadFiltersType;
  onFilterChange: (filters: LeadFiltersType) => void;
  onReset: () => void;
  properties?: Array<{ id: string; title: string }>;
}

export function LeadFilters({ filters, onFilterChange, onReset, properties = [] }: LeadFiltersProps) {
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

  const handlePropertyChange = (value: string) => {
    onFilterChange({
      ...filters,
      propertyId: value === 'all' ? undefined : value,
    });
  };

  const handleUrgencyChange = (value: string) => {
    onFilterChange({
      ...filters,
      urgency: value === 'all' ? undefined : (value as any),
    });
  };

  const handleBudgetCompatibleToggle = (checked: boolean) => {
    onFilterChange({
      ...filters,
      budgetCompatible: checked ? true : undefined,
    });
  };

  const handleHasPetsToggle = (checked: boolean) => {
    onFilterChange({
      ...filters,
      hasPets: checked ? true : undefined,
    });
  };

  const handleIsVerifiedToggle = (checked: boolean) => {
    onFilterChange({
      ...filters,
      isVerified: checked ? true : undefined,
    });
  };

  const activeFiltersCount = [
    filters.status,
    filters.propertyId,
    filters.urgency,
    filters.budgetCompatible,
    filters.hasPets,
    filters.isVerified,
    filters.searchQuery,
  ].filter(Boolean).length;

  return (
    <div>
      {/* Mobile: Search bar above filters */}
      <div className="md:hidden mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-mobile"
            placeholder="Buscar por nombre o mensaje..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      {/* Mobile: Horizontal scroll container for filters */}
      <div
        className="md:hidden flex gap-2 pb-2 overflow-x-auto scrollbar-hide overscroll-x-contain"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          touchAction: 'pan-x',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {/* Status Filter */}
        <div className="flex-shrink-0">
          <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
            <SelectTrigger className={`w-auto min-w-[140px] rounded-xl border shadow-sm hover:shadow-md transition-all ${
              filters.status ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200'
            }`}>
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="new">Nuevo</SelectItem>
              <SelectItem value="archived">Archivado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Property Filter */}
        {properties.length > 0 && (
          <div className="flex-shrink-0">
            <Select value={filters.propertyId || 'all'} onValueChange={handlePropertyChange}>
              <SelectTrigger className={`w-auto min-w-[140px] rounded-xl border shadow-sm hover:shadow-md transition-all ${
                filters.propertyId ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200'
              }`}>
                <SelectValue placeholder="Propiedad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las propiedades</SelectItem>
                {properties.map((property) => (
                  <SelectItem key={property.id} value={property.id}>
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Urgency Filter */}
        <div className="flex-shrink-0">
          <Select value={filters.urgency || 'all'} onValueChange={handleUrgencyChange}>
            <SelectTrigger className={`w-auto min-w-[140px] rounded-xl border shadow-sm hover:shadow-md transition-all ${
              filters.urgency ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200'
            }`}>
              <SelectValue placeholder="Urgencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las urgencias</SelectItem>
              <SelectItem value="immediate">⚡ Urgente</SelectItem>
              <SelectItem value="planned">📅 Pronto</SelectItem>
              <SelectItem value="flexible">🕐 Flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* More Filters Popover */}
        <div className="flex-shrink-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`rounded-xl border shadow-sm hover:shadow-md transition-all ${
                  (filters.budgetCompatible || filters.hasPets || filters.isVerified)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-gray-200'
                }`}
              >
                Más filtros
                {(filters.budgetCompatible || filters.hasPets || filters.isVerified) && (
                  <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs rounded-full bg-white text-blue-600">
                    {[filters.budgetCompatible, filters.hasPets, filters.isVerified].filter(Boolean).length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4 bg-white border-gray-200 rounded-xl" align="start">
              <div className="space-y-4">
                <h4 className="font-semibold text-sm">Filtros adicionales</h4>

                {/* Budget Compatible */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="budgetCompatible"
                    checked={filters.budgetCompatible || false}
                    onCheckedChange={handleBudgetCompatibleToggle}
                  />
                  <Label
                    htmlFor="budgetCompatible"
                    className="text-sm font-medium cursor-pointer"
                  >
                    💰 Presupuesto compatible
                  </Label>
                </div>

                {/* Has Pets */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPets"
                    checked={filters.hasPets || false}
                    onCheckedChange={handleHasPetsToggle}
                  />
                  <Label
                    htmlFor="hasPets"
                    className="text-sm font-medium cursor-pointer"
                  >
                    🐕 Con mascotas
                  </Label>
                </div>

                {/* Verified */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isVerified"
                    checked={filters.isVerified || false}
                    onCheckedChange={handleIsVerifiedToggle}
                  />
                  <Label
                    htmlFor="isVerified"
                    className="text-sm font-medium cursor-pointer"
                  >
                    ✅ Verificados
                  </Label>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Limpiar ({activeFiltersCount})
            </Button>
          </div>
        )}
      </div>

      {/* Desktop: Normal flex-wrap layout */}
      <div className="hidden md:flex md:flex-wrap md:gap-2 md:items-center">
        {/* Search Bar */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="search-desktop"
            placeholder="Buscar por nombre o mensaje..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 rounded-xl"
          />
        </div>

        {/* Status Filter */}
        <Select value={filters.status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className={`w-auto min-w-[140px] rounded-xl border shadow-sm hover:shadow-md transition-all ${
            filters.status ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200'
          }`}>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="new">Nuevo</SelectItem>
            <SelectItem value="archived">Archivado</SelectItem>
          </SelectContent>
        </Select>

        {/* Property Filter */}
        {properties.length > 0 && (
          <Select value={filters.propertyId || 'all'} onValueChange={handlePropertyChange}>
            <SelectTrigger className={`w-auto min-w-[140px] rounded-xl border shadow-sm hover:shadow-md transition-all ${
              filters.propertyId ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200'
            }`}>
              <SelectValue placeholder="Propiedad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las propiedades</SelectItem>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Urgency Filter */}
        <Select value={filters.urgency || 'all'} onValueChange={handleUrgencyChange}>
          <SelectTrigger className={`w-auto min-w-[140px] rounded-xl border shadow-sm hover:shadow-md transition-all ${
            filters.urgency ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-gray-200'
          }`}>
            <SelectValue placeholder="Urgencia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las urgencias</SelectItem>
            <SelectItem value="immediate">⚡ Urgente</SelectItem>
            <SelectItem value="planned">📅 Pronto</SelectItem>
            <SelectItem value="flexible">🕐 Flexible</SelectItem>
          </SelectContent>
        </Select>

        {/* More Filters Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={`rounded-xl border shadow-sm hover:shadow-md transition-all ${
                (filters.budgetCompatible || filters.hasPets || filters.isVerified)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white border-gray-200'
              }`}
            >
              Más filtros
              {(filters.budgetCompatible || filters.hasPets || filters.isVerified) && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs rounded-full bg-white text-blue-600">
                  {[filters.budgetCompatible, filters.hasPets, filters.isVerified].filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4 bg-white border-gray-200 rounded-xl" align="start">
            <div className="space-y-4">
              <h4 className="font-semibold text-sm">Filtros adicionales</h4>

              {/* Budget Compatible */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="budgetCompatible-desktop"
                  checked={filters.budgetCompatible || false}
                  onCheckedChange={handleBudgetCompatibleToggle}
                />
                <Label
                  htmlFor="budgetCompatible-desktop"
                  className="text-sm font-medium cursor-pointer"
                >
                  💰 Presupuesto compatible
                </Label>
              </div>

              {/* Has Pets */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasPets-desktop"
                  checked={filters.hasPets || false}
                  onCheckedChange={handleHasPetsToggle}
                />
                <Label
                  htmlFor="hasPets-desktop"
                  className="text-sm font-medium cursor-pointer"
                >
                  🐕 Con mascotas
                </Label>
              </div>

              {/* Verified */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isVerified-desktop"
                  checked={filters.isVerified || false}
                  onCheckedChange={handleIsVerifiedToggle}
                />
                <Label
                  htmlFor="isVerified-desktop"
                  className="text-sm font-medium cursor-pointer"
                >
                  ✅ Verificados
                </Label>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters Button */}
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar ({activeFiltersCount})
          </Button>
        )}
      </div>
    </div>
  );
}
