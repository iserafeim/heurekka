'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SearchFilters, PropertyType, SortOption, SPANISH_TEXT } from '@/types/property';
import { validatePrice, validateNumber } from '@/lib/security/validation';

interface FilterBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  resultCount: number;
  loading?: boolean;
  locale?: 'es' | 'en';
  className?: string;
}

interface DropdownState {
  price: boolean;
  bedrooms: boolean;
  propertyType: boolean;
  sort: boolean;
  advanced: boolean;
}

/**
 * Horizontal FilterBar component with dropdowns
 * Provides filtering options for property search
 */
export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  resultCount,
  loading = false,
  locale = 'es',
  className = ''
}) => {
  const [dropdowns, setDropdowns] = useState<DropdownState>({
    price: false,
    bedrooms: false,
    propertyType: false,
    sort: false,
    advanced: false
  });

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const openDropdown = Object.keys(dropdowns).find(key => dropdowns[key as keyof DropdownState]);
      if (openDropdown && dropdownRefs.current[openDropdown]) {
        const dropdownElement = dropdownRefs.current[openDropdown];
        if (dropdownElement && !dropdownElement.contains(event.target as Node)) {
          setDropdowns(prev => ({ ...prev, [openDropdown]: false }));
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdowns]);

  // Toggle dropdown
  const toggleDropdown = useCallback((dropdown: keyof DropdownState) => {
    setDropdowns(prev => ({
      ...prev,
      [dropdown]: !prev[dropdown],
      // Close other dropdowns
      ...Object.keys(prev).reduce((acc, key) => ({
        ...acc,
        [key]: key === dropdown ? !prev[dropdown] : false
      }), {} as DropdownState)
    }));
  }, []);

  // Handle price range change
  const handlePriceChange = useCallback((min: number, max: number) => {
    const validatedMin = validatePrice(min.toString());
    const validatedMax = validatePrice(max.toString());
    
    // Ensure min <= max
    const finalMin = Math.min(validatedMin, validatedMax);
    const finalMax = Math.max(validatedMin, validatedMax);
    
    onFiltersChange({
      priceMin: finalMin,
      priceMax: finalMax
    });
  }, [onFiltersChange]);

  // Handle bedrooms change
  const handleBedroomsChange = useCallback((bedrooms: number[]) => {
    // Validate bedroom numbers (1-10 range)
    const validatedBedrooms = bedrooms
      .filter(num => typeof num === 'number' && !isNaN(num))
      .map(num => validateNumber(num, 1, 10))
      .filter((num, index, arr) => arr.indexOf(num) === index); // Remove duplicates
    
    onFiltersChange({ bedrooms: validatedBedrooms });
  }, [onFiltersChange]);

  // Handle property type change
  const handlePropertyTypeChange = useCallback((types: PropertyType[]) => {
    onFiltersChange({ propertyTypes: types });
  }, [onFiltersChange]);

  // Handle sort change
  const handleSortChange = useCallback((sortBy: SortOption) => {
    onFiltersChange({ sortBy });
    setDropdowns(prev => ({ ...prev, sort: false }));
  }, [onFiltersChange]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    onFiltersChange({
      location: '',
      priceMin: 0,
      priceMax: 100000,
      bedrooms: [],
      propertyTypes: [],
      amenities: [],
      sortBy: SortOption.RELEVANCE,
      radiusKm: 5
    });
  }, [onFiltersChange]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'es' ? 'es-HN' : 'en-US', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Get active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.priceMin > 0 || filters.priceMax < 100000) count++;
    if (filters.bedrooms.length > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    return count;
  };

  const activeFilters = getActiveFilterCount();

  return (
    <div className={`filter-bar ${className}`}>
      <div className="flex items-center justify-between">
        {/* Left side - Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Price Filter */}
          <div className="relative" ref={el => dropdownRefs.current.price = el}>
            <button
              onClick={() => toggleDropdown('price')}
              className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                filters.priceMin > 0 || filters.priceMax < 100000
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white text-gray-700'
              }`}
              aria-expanded={dropdowns.price}
              aria-haspopup="true"
            >
              <span className="mr-2">💰</span>
              {filters.priceMin > 0 || filters.priceMax < 100000
                ? `${formatCurrency(filters.priceMin)} - ${formatCurrency(filters.priceMax)}`
                : SPANISH_TEXT.filters.price
              }
              <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {dropdowns.price && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-80 p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  {SPANISH_TEXT.filters.price}
                </h3>
                
                <div className="space-y-4">
                  {/* Price inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Mínimo
                      </label>
                      <input
                        type="number"
                        value={filters.priceMin}
                        onChange={(e) => handlePriceChange(validatePrice(e.target.value), filters.priceMax)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="1000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">
                        Máximo
                      </label>
                      <input
                        type="number"
                        value={filters.priceMax}
                        onChange={(e) => handlePriceChange(filters.priceMin, validatePrice(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="1000"
                      />
                    </div>
                  </div>
                  
                  {/* Quick price ranges */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Rangos rápidos:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { min: 0, max: 10000, label: 'Hasta L.10,000' },
                        { min: 10000, max: 25000, label: 'L.10,000 - L.25,000' },
                        { min: 25000, max: 50000, label: 'L.25,000 - L.50,000' },
                        { min: 50000, max: 100000, label: 'L.50,000+' }
                      ].map(range => (
                        <button
                          key={`${range.min}-${range.max}`}
                          onClick={() => handlePriceChange(range.min, range.max)}
                          className="px-3 py-2 text-sm border border-gray-200 rounded-md hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bedrooms Filter */}
          <div className="relative" ref={el => dropdownRefs.current.bedrooms = el}>
            <button
              onClick={() => toggleDropdown('bedrooms')}
              className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                filters.bedrooms.length > 0
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white text-gray-700'
              }`}
              aria-expanded={dropdowns.bedrooms}
              aria-haspopup="true"
            >
              <span className="mr-2">🛏️</span>
              {filters.bedrooms.length > 0
                ? `${filters.bedrooms.join(', ')} ${SPANISH_TEXT.property.bedrooms}`
                : SPANISH_TEXT.filters.bedrooms
              }
              <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {dropdowns.bedrooms && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  {SPANISH_TEXT.filters.bedrooms}
                </h3>
                
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <button
                      key={num}
                      onClick={() => {
                        const newBedrooms = filters.bedrooms.includes(num)
                          ? filters.bedrooms.filter(b => b !== num)
                          : [...filters.bedrooms, num];
                        handleBedroomsChange(newBedrooms);
                      }}
                      className={`px-3 py-2 text-sm border border-gray-200 rounded-md transition-colors duration-200 ${
                        filters.bedrooms.includes(num)
                          ? 'bg-blue-50 border-blue-300 text-blue-700'
                          : 'hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {num}+
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Property Type Filter */}
          <div className="relative" ref={el => dropdownRefs.current.propertyType = el}>
            <button
              onClick={() => toggleDropdown('propertyType')}
              className={`px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                filters.propertyTypes.length > 0
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white text-gray-700'
              }`}
              aria-expanded={dropdowns.propertyType}
              aria-haspopup="true"
            >
              <span className="mr-2">🏠</span>
              {filters.propertyTypes.length > 0
                ? `${filters.propertyTypes.length} tipo(s)`
                : SPANISH_TEXT.filters.propertyType
              }
              <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {dropdowns.propertyType && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-56 p-4">
                <h3 className="font-medium text-gray-900 mb-3">
                  {SPANISH_TEXT.filters.propertyType}
                </h3>
                
                <div className="space-y-2">
                  {[
                    { value: PropertyType.APARTMENT, label: 'Apartamento', icon: '🏢' },
                    { value: PropertyType.HOUSE, label: 'Casa', icon: '🏠' },
                    { value: PropertyType.ROOM, label: 'Habitación', icon: '🚪' },
                    { value: PropertyType.OFFICE, label: 'Oficina', icon: '🏢' }
                  ].map(type => (
                    <label
                      key={type.value}
                      className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters.propertyTypes.includes(type.value)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.propertyTypes, type.value]
                            : filters.propertyTypes.filter(t => t !== type.value);
                          handlePropertyTypeChange(newTypes);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm">
                        <span className="mr-2">{type.icon}</span>
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {activeFilters > 0 && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              Limpiar filtros ({activeFilters})
            </button>
          )}
        </div>

        {/* Right side - Results and Sort */}
        <div className="flex items-center gap-4">
          {/* Results count */}
          <div className="text-sm text-gray-600 whitespace-nowrap">
            {loading ? (
              <span className="animate-pulse">Buscando...</span>
            ) : (
              <span>
                <span className="font-medium text-gray-900">{resultCount.toLocaleString()}</span>{' '}
                {SPANISH_TEXT.search.results}
              </span>
            )}
          </div>

          {/* Sort dropdown */}
          <div className="relative" ref={el => dropdownRefs.current.sort = el}>
            <button
              onClick={() => toggleDropdown('sort')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white text-gray-700 hover:border-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-expanded={dropdowns.sort}
              aria-haspopup="true"
            >
              {SPANISH_TEXT.filters.sortBy}
              <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {dropdowns.sort && (
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 p-2">
                {[
                  { value: SortOption.RELEVANCE, label: 'Relevancia' },
                  { value: SortOption.PRICE_LOW, label: 'Precio: Menor a Mayor' },
                  { value: SortOption.PRICE_HIGH, label: 'Precio: Mayor a Menor' },
                  { value: SortOption.NEWEST, label: 'Más Recientes' },
                  { value: SortOption.DISTANCE, label: 'Distancia' }
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                      filters.sortBy === option.value
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;