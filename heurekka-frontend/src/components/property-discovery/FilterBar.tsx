'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SearchFilters, PropertyType, SortOption, SPANISH_TEXT } from '@/types/property';
import { validatePrice, validateNumber } from '@/lib/security/validation';
import { MobileFilterModal } from './MobileFilterModal';

interface FilterBarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  locale?: 'es' | 'en';
  className?: string;
  onMobileModalStateChange?: (isOpen: boolean) => void;
}

interface DropdownState {
  price: boolean;
  bedrooms: boolean;
  propertyType: boolean;
  pets: boolean;
  deals: boolean;
  more: boolean;
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
  locale = 'es',
  className = '',
  onMobileModalStateChange
}) => {
  const [dropdowns, setDropdowns] = useState<DropdownState>({
    price: false,
    bedrooms: false,
    propertyType: false,
    pets: false,
    deals: false,
    more: false,
    sort: false,
    advanced: false
  });

  // Mobile modal state
  const [mobileModal, setMobileModal] = useState<{
    isOpen: boolean;
    type: 'bedrooms' | 'price' | 'type' | 'pets' | 'deals' | 'more';
    title: string;
  }>({
    isOpen: false,
    type: 'bedrooms',
    title: ''
  });

  // Temporary filters for beds/baths dropdown (only applied on "View results")
  const [tempBedroomsBaths, setTempBedroomsBaths] = useState<{
    bedrooms: number[];
    bathrooms: number[];
  }>({
    bedrooms: [],
    bathrooms: []
  });

  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Initialize temp filters when beds/baths dropdown opens
  useEffect(() => {
    if (dropdowns.bedrooms) {
      setTempBedroomsBaths({
        bedrooms: filters.bedrooms || [],
        bathrooms: filters.bathrooms || []
      });
    }
  }, [dropdowns.bedrooms, filters.bedrooms, filters.bathrooms]);

  // Reset temp filters when dropdown closes without applying
  useEffect(() => {
    if (!dropdowns.bedrooms) {
      // Reset to current filters when dropdown closes
      setTempBedroomsBaths({
        bedrooms: filters.bedrooms || [],
        bathrooms: filters.bathrooms || []
      });
    }
  }, [dropdowns.bedrooms, filters.bedrooms, filters.bathrooms]);

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

  // Toggle dropdown (desktop only)
  const toggleDropdown = useCallback((dropdown: keyof DropdownState) => {
    setDropdowns(prev => {
      const newState = !prev[dropdown];
      return {
        ...Object.keys(prev).reduce((acc, key) => ({
          ...acc,
          [key]: key === dropdown ? newState : false
        }), {} as DropdownState)
      };
    });
  }, []);

  // Open mobile modal
  const openMobileModal = useCallback((type: 'bedrooms' | 'price' | 'type' | 'pets' | 'deals' | 'more', title: string) => {
    setMobileModal({
      isOpen: true,
      type,
      title
    });
    onMobileModalStateChange?.(true);
  }, [onMobileModalStateChange]);

  // Close mobile modal
  const closeMobileModal = useCallback(() => {
    setMobileModal(prev => ({ ...prev, isOpen: false }));
    onMobileModalStateChange?.(false);
  }, [onMobileModalStateChange]);

  // Handle mobile modal apply
  const handleMobileModalApply = useCallback((newFilters: Partial<SearchFilters>) => {
    onFiltersChange(newFilters);
    setMobileModal(prev => ({ ...prev, isOpen: false }));
    onMobileModalStateChange?.(false);
  }, [onFiltersChange, onMobileModalStateChange]);

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
    // Validate bedroom numbers (0-10 range, 0 represents studio)
    const validatedBedrooms = bedrooms
      .filter(num => typeof num === 'number' && !isNaN(num))
      .map(num => validateNumber(num, 0, 10)) // Changed from 1 to 0 to allow studio
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
      bathrooms: [],
      propertyTypes: [],
      amenities: [],
      sortBy: SortOption.RELEVANCE,
      radiusKm: 5,
      petsAllowed: false,
      hasDeals: false
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
    if (filters.bathrooms && filters.bathrooms.length > 0) count++;
    if (filters.propertyTypes.length > 0) count++;
    if (filters.amenities.length > 0) count++;
    if (filters.petsAllowed) count++;
    if (filters.hasDeals) count++;
    return count;
  };

  const activeFilters = getActiveFilterCount();

  return (
    <div className={`filter-bar w-full ${className}`}>
      {/* Mobile Filter Pills (320px-767px) - Updated to match new design */}
      <div className="md:hidden">
        <div
          className="flex gap-2 pb-2 overflow-x-auto scrollbar-hide overscroll-x-contain"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            touchAction: 'pan-x',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Beds/Baths Filter Pill */}
          <button
            onClick={() => openMobileModal('bedrooms', 'Beds & Baths')}
            className={`flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
              filters.bedrooms.length > 0 || (filters.bathrooms && filters.bathrooms.length > 0)
                ? 'bg-blue-50 border-blue-300 text-blue-700 active:bg-blue-100 active:border-blue-400'
                : 'bg-white text-gray-700 active:bg-gray-200'
            }`}
          >
            Beds/Baths
          </button>

          {/* Price Filter Pill */}
          <button
            onClick={() => toggleDropdown('price')}
            className={`flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
              dropdowns.price
                ? (filters.priceMin > 0 || filters.priceMax < 100000
                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                    : 'bg-gray-200 text-gray-700 border-gray-300')
                : (filters.priceMin > 0 || filters.priceMax < 100000
                    ? 'bg-blue-50 border-blue-300 text-blue-700 active:bg-blue-100 active:border-blue-400'
                    : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200')
            }`}
          >
            Price
          </button>

          {/* Type Filter Pill */}
          <button
            onClick={() => toggleDropdown('propertyType')}
            className={`flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
              dropdowns.propertyType
                ? (filters.propertyTypes.length > 0
                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                    : 'bg-gray-200 text-gray-700 border-gray-300')
                : (filters.propertyTypes.length > 0
                    ? 'bg-blue-50 border-blue-300 text-blue-700 active:bg-blue-100 active:border-blue-400'
                    : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200')
            }`}
          >
            Type
          </button>

          {/* Pets Filter Pill */}
          <button
            onClick={() => toggleDropdown('pets')}
            className={`flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
              dropdowns.pets
                ? (filters.petsAllowed
                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                    : 'bg-gray-200 text-gray-700 border-gray-300')
                : (filters.petsAllowed
                    ? 'bg-blue-50 border-blue-300 text-blue-700 active:bg-blue-100 active:border-blue-400'
                    : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200')
            }`}
          >
            Pets
          </button>

          {/* Deals Filter Pill */}
          <button
            onClick={() => toggleDropdown('deals')}
            className={`flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
              dropdowns.deals
                ? (filters.hasDeals
                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                    : 'bg-gray-200 text-gray-700 border-gray-300')
                : (filters.hasDeals
                    ? 'bg-blue-50 border-blue-300 text-blue-700 active:bg-blue-100 active:border-blue-400'
                    : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200')
            }`}
          >
            Deals
          </button>

          {/* More Filters Pill */}
          <button
            onClick={() => toggleDropdown('more')}
            className={`flex-shrink-0 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
              dropdowns.more
                ? 'bg-gray-200 text-gray-700 border-gray-300'
                : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200'
            }`}
          >
            <span className="mr-1">⚙️</span>
            More
          </button>
        </div>
      </div>

      {/* Desktop Filter Layout (768px+) */}
      <div className="hidden md:flex items-center">
        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Beds/Baths Filter */}
          <div className="relative" ref={el => { dropdownRefs.current.bedrooms = el; }}>
            <button
              onClick={() => toggleDropdown('bedrooms')}
              className={`px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
                dropdowns.bedrooms
                  ? (filters.bedrooms.length > 0 || (filters.bathrooms && filters.bathrooms.length > 0)
                      ? 'bg-blue-100 border-blue-400 text-blue-700'
                      : 'bg-gray-200 text-gray-700 border-gray-300')
                  : (filters.bedrooms.length > 0 || (filters.bathrooms && filters.bathrooms.length > 0)
                      ? 'bg-blue-50 border-blue-300 text-blue-700 active:bg-blue-100 active:border-blue-400'
                      : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200')
              }`}
              aria-expanded={dropdowns.bedrooms}
              aria-haspopup="true"
            >
              {filters.bedrooms.length > 0 || (filters.bathrooms && filters.bathrooms.length > 0)
                ? `${filters.bedrooms.join(', ')} hab | ${(filters.bathrooms || []).join(', ')} baños`
                : 'Beds/Baths'
              }
              <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdowns.bedrooms && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-96 p-6">
                <div className="space-y-8">
                  {/* Bedrooms Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Bedrooms</h3>
                    <div className="bg-gray-100 rounded-full p-2 flex gap-2">
                      {['Studio', '1', '2', '3', '4+'].map(option => {
                        const value = option === 'Studio' ? 0 : option === '4+' ? 4 : parseInt(option);
                        const isSelected = tempBedroomsBaths.bedrooms.includes(value);
                        return (
                          <button
                            key={`bedroom-${option}`}
                            onClick={() => {
                              const newBedrooms = isSelected
                                ? tempBedroomsBaths.bedrooms.filter(b => b !== value)
                                : [...tempBedroomsBaths.bedrooms, value];
                              setTempBedroomsBaths(prev => ({ ...prev, bedrooms: newBedrooms }));
                            }}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-full transition-all duration-200 ${
                              isSelected
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bathrooms Section */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Bathrooms</h3>
                    <div className="bg-gray-100 rounded-full p-2 flex gap-2">
                      {['1', '2', '3', '4', '5+'].map(option => {
                        const value = option === '5+' ? 5 : parseInt(option);
                        const isSelected = tempBedroomsBaths.bathrooms.includes(value);
                        return (
                          <button
                            key={`bathroom-${option}`}
                            onClick={() => {
                              const newBathrooms = isSelected
                                ? tempBedroomsBaths.bathrooms.filter(b => b !== value)
                                : [...tempBedroomsBaths.bathrooms, value];
                              setTempBedroomsBaths(prev => ({ ...prev, bathrooms: newBathrooms }));
                            }}
                            className={`flex-1 py-2 px-3 text-sm font-medium rounded-full transition-all duration-200 ${
                              isSelected
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Footer with Clear and View Results */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        // Clear temporary filters
                        setTempBedroomsBaths({ bedrooms: [], bathrooms: [] });
                        // Apply empty filters immediately and reset all filters to defaults
                        onFiltersChange({
                          bedrooms: [],
                          bathrooms: [],
                          location: '',
                          priceMin: 0,
                          priceMax: 100000,
                          propertyTypes: [],
                          amenities: [],
                          sortBy: SortOption.RELEVANCE,
                          petsAllowed: false,
                          hasDeals: false
                        });
                        setDropdowns(prev => ({ ...prev, bedrooms: false }));
                      }}
                      className="text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors duration-200 underline"
                    >
                      Clear
                    </button>

                    <button
                      onClick={() => {
                        // Apply the temporary filters using the proper handler
                        handleBedroomsChange(tempBedroomsBaths.bedrooms);
                        onFiltersChange({ bathrooms: tempBedroomsBaths.bathrooms });
                        setDropdowns(prev => ({ ...prev, bedrooms: false }));
                      }}
                      className="bg-gray-900 text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors duration-200"
                    >
                      View results
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Filter */}
          <div className="relative" ref={el => { dropdownRefs.current.price = el; }}>
            <button
              onClick={() => toggleDropdown('price')}
              className={`px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
                dropdowns.price
                  ? (filters.priceMin > 0 || filters.priceMax < 100000
                      ? 'bg-blue-100 border-blue-400 text-blue-700'
                      : 'bg-gray-200 text-gray-700 border-gray-300')
                  : (filters.priceMin > 0 || filters.priceMax < 100000
                      ? 'bg-blue-50 border-blue-300 text-blue-700 active:bg-blue-100 active:border-blue-400'
                      : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200')
              }`}
              aria-expanded={dropdowns.price}
              aria-haspopup="true"
            >
              {filters.priceMin > 0 || filters.priceMax < 100000
                ? `${formatCurrency(filters.priceMin)} - ${formatCurrency(filters.priceMax)}`
                : 'Price'
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-0"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-0"
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

          {/* Type Filter */}
          <div className="relative" ref={el => { dropdownRefs.current.propertyType = el; }}>
            <button
              onClick={() => toggleDropdown('propertyType')}
              className={`px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
                dropdowns.propertyType
                  ? (filters.propertyTypes.length > 0
                      ? 'bg-blue-100 border-blue-400 text-blue-700'
                      : 'bg-gray-200 text-gray-700 border-gray-300')
                  : (filters.propertyTypes.length > 0
                      ? 'bg-blue-50 border-blue-300 text-blue-700 active:bg-blue-100 active:border-blue-400'
                      : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200')
              }`}
              aria-expanded={dropdowns.propertyType}
              aria-haspopup="true"
            >
              {filters.propertyTypes.length > 0
                ? `${filters.propertyTypes.length} tipo(s)`
                : 'Type'
              }
              <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdowns.propertyType && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-56 p-4">
                <h3 className="font-medium text-gray-900 mb-3">Tipo de Propiedad</h3>

                <div className="space-y-2">
                  {[
                    { value: PropertyType.APARTMENT, label: 'Apartamento' },
                    { value: PropertyType.HOUSE, label: 'Casa' },
                    { value: PropertyType.ROOM, label: 'Habitación' },
                    { value: PropertyType.OFFICE, label: 'Oficina' }
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
                      <span className="ml-3 text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Pets Filter */}
          <div className="relative" ref={el => { dropdownRefs.current.pets = el; }}>
            <button
              onClick={() => toggleDropdown('pets')}
              className={`px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
                dropdowns.pets
                  ? (filters.petsAllowed
                      ? 'bg-blue-100 border-blue-400 text-blue-700'
                      : 'bg-gray-200 text-gray-700 border-gray-300')
                  : (filters.petsAllowed
                      ? 'bg-blue-50 border-blue-300 text-blue-700 active:bg-blue-100 active:border-blue-400'
                      : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200')
              }`}
              aria-expanded={dropdowns.pets}
              aria-haspopup="true"
            >
              Pets
              <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdowns.pets && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 p-4">
                <h3 className="font-medium text-gray-900 mb-3">Mascotas</h3>

                <div className="space-y-2">
                  <label className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.petsAllowed || false}
                      onChange={(e) => onFiltersChange({ petsAllowed: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm">Se permiten mascotas</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Deals Filter */}
          <div className="relative" ref={el => { dropdownRefs.current.deals = el; }}>
            <button
              onClick={() => toggleDropdown('deals')}
              className={`px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
                dropdowns.deals
                  ? (filters.hasDeals
                      ? 'bg-blue-100 border-blue-400 text-blue-700'
                      : 'bg-gray-200 text-gray-700 border-gray-300')
                  : (filters.hasDeals
                      ? 'bg-blue-50 border-blue-300 text-blue-700 active:bg-blue-100 active:border-blue-400'
                      : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200')
              }`}
              aria-expanded={dropdowns.deals}
              aria-haspopup="true"
            >
              Deals
              <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdowns.deals && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 p-4">
                <h3 className="font-medium text-gray-900 mb-3">Ofertas Especiales</h3>

                <div className="space-y-2">
                  <label className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasDeals || false}
                      onChange={(e) => onFiltersChange({ hasDeals: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm">Solo propiedades con descuentos</span>
                  </label>
                </div>
              </div>
            )}
          </div>


          {/* More Filters */}
          <div className="relative" ref={el => { dropdownRefs.current.more = el; }}>
            <button
              onClick={() => toggleDropdown('more')}
              className={`px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
                dropdowns.more
                  ? 'bg-gray-200 text-gray-700 border-gray-300'
                  : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200'
              }`}
              aria-expanded={dropdowns.more}
              aria-haspopup="true"
            >
              <span className="mr-2">⚙️</span>
              More
            </button>

            {dropdowns.more && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-56 p-4">
                <h3 className="font-medium text-gray-900 mb-3">Más Filtros</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Radio de búsqueda</label>
                    <select
                      value={filters.radiusKm}
                      onChange={(e) => onFiltersChange({ radiusKm: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-0"
                    >
                      <option value={5}>5 km</option>
                      <option value={10}>10 km</option>
                      <option value={25}>25 km</option>
                      <option value={50}>50 km</option>
                    </select>
                  </div>

                  {activeFilters > 0 && (
                    <button
                      onClick={handleClearFilters}
                      className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200"
                    >
                      Limpiar todos los filtros ({activeFilters})
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <MobileFilterModal
        isOpen={mobileModal.isOpen}
        filterType={mobileModal.type}
        title={mobileModal.title}
        filters={filters}
        onClose={closeMobileModal}
        onApply={handleMobileModalApply}
      />
    </div>
  );
};

export default FilterBar;