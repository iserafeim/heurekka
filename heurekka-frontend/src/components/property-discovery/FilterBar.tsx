'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { SearchFilters, PropertyType, SortOption, SPANISH_TEXT } from '@/types/property';
import { validatePrice, validateNumber } from '@/lib/security/validation';
import { MobileFilterModal } from './MobileFilterModal';
import { Slider } from '@/components/ui/slider';
import { PriceHistogram } from './PriceHistogram';

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

  // Temporary filters for price dropdown (only applied on "View results")
  const [tempPrice, setTempPrice] = useState<{
    priceMin: number;
    priceMax: number;
  }>({
    priceMin: 0,
    priceMax: 100000
  });

  // Temporary filters for type dropdown (only applied on "View results")
  const [tempPropertyTypes, setTempPropertyTypes] = useState<PropertyType[]>([]);

  // Temporary filters for pets dropdown (only applied on "View results")
  const [tempPetsAllowed, setTempPetsAllowed] = useState<boolean>(false);

  // Temporary filters for deals dropdown (only applied on "View results")
  const [tempHasDeals, setTempHasDeals] = useState<boolean>(false);

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

  // Initialize temp price filters when price dropdown opens
  useEffect(() => {
    if (dropdowns.price) {
      setTempPrice({
        priceMin: filters.priceMin,
        priceMax: filters.priceMax
      });
    }
  }, [dropdowns.price, filters.priceMin, filters.priceMax]);

  // Reset temp price filters when dropdown closes without applying
  useEffect(() => {
    if (!dropdowns.price) {
      // Reset to current filters when dropdown closes
      setTempPrice({
        priceMin: filters.priceMin,
        priceMax: filters.priceMax
      });
    }
  }, [dropdowns.price, filters.priceMin, filters.priceMax]);

  // Initialize temp property types filters when dropdown opens
  useEffect(() => {
    if (dropdowns.propertyType) {
      setTempPropertyTypes(filters.propertyTypes || []);
    }
  }, [dropdowns.propertyType, filters.propertyTypes]);

  // Reset temp property types filters when dropdown closes without applying
  useEffect(() => {
    if (!dropdowns.propertyType) {
      setTempPropertyTypes(filters.propertyTypes || []);
    }
  }, [dropdowns.propertyType, filters.propertyTypes]);

  // Initialize temp pets filters when dropdown opens
  useEffect(() => {
    if (dropdowns.pets) {
      setTempPetsAllowed(filters.petsAllowed || false);
    }
  }, [dropdowns.pets, filters.petsAllowed]);

  // Reset temp pets filters when dropdown closes without applying
  useEffect(() => {
    if (!dropdowns.pets) {
      setTempPetsAllowed(filters.petsAllowed || false);
    }
  }, [dropdowns.pets, filters.petsAllowed]);

  // Initialize temp deals filters when dropdown opens
  useEffect(() => {
    if (dropdowns.deals) {
      setTempHasDeals(filters.hasDeals || false);
    }
  }, [dropdowns.deals, filters.hasDeals]);

  // Reset temp deals filters when dropdown closes without applying
  useEffect(() => {
    if (!dropdowns.deals) {
      setTempHasDeals(filters.hasDeals || false);
    }
  }, [dropdowns.deals, filters.hasDeals]);

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

  // Handle slider range change (temporary - only applied on "View results")
  const handleTempSliderChange = useCallback((values: number[]) => {
    if (values.length === 2) {
      const [min, max] = values;
      setTempPrice({
        priceMin: min,
        priceMax: max
      });
    }
  }, []);

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

  // Format property types for button display
  const formatPropertyTypes = (types: PropertyType[]) => {
    if (types.length === 0) return 'Type';

    // Map property types to Spanish labels
    const typeLabels: Record<PropertyType, string> = {
      [PropertyType.APARTMENT]: 'Apartment',
      [PropertyType.HOUSE]: 'House',
      [PropertyType.ROOM]: 'Room',
      [PropertyType.OFFICE]: 'Townhouse'
    };

    if (types.length === 1) {
      return typeLabels[types[0]];
    } else {
      return `${typeLabels[types[0]]} +${types.length - 1}`;
    }
  };

  // Format pets filter for button display
  const formatPetsFilter = (petsAllowed: boolean) => {
    if (!petsAllowed) return 'Pets';
    return 'Dogs';
  };

  // Format deals filter for button display
  const formatDealsFilter = (hasDeals: boolean) => {
    if (!hasDeals) return 'Deals';
    return 'Rent special';
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
            className={`flex-shrink-0 px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-1 ${
              filters.bedrooms.length > 0 || (filters.bathrooms && filters.bathrooms.length > 0)
                ? 'bg-white border-gray-900 text-gray-900'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <span>Beds/Baths</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Price Filter Pill */}
          <button
            onClick={() => openMobileModal('price', 'Price')}
            className={`flex-shrink-0 px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-1 ${
              filters.priceMin > 0 || filters.priceMax < 100000
                ? 'bg-white border-gray-900 text-gray-900'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <span>Price</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Type Filter Pill */}
          <button
            onClick={() => openMobileModal('propertyType', 'Property Type')}
            className={`flex-shrink-0 px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-1 ${
              filters.propertyTypes.length > 0
                ? 'bg-white border-gray-900 text-gray-900'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <span>{formatPropertyTypes(filters.propertyTypes)}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Pets Filter Pill */}
          <button
            onClick={() => openMobileModal('pets', 'Pets')}
            className={`flex-shrink-0 px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-1 ${
              filters.petsAllowed
                ? 'bg-white border-gray-900 text-gray-900'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <span>{formatPetsFilter(filters.petsAllowed || false)}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Deals Filter Pill */}
          <button
            onClick={() => openMobileModal('deals', 'Deals')}
            className={`flex-shrink-0 px-3 py-2 border rounded-lg text-sm font-medium flex items-center gap-1 ${
              filters.hasDeals
                ? 'bg-white border-gray-900 text-gray-900'
                : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            <span>{formatDealsFilter(filters.hasDeals || false)}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* More Filters Pill */}
          <button
            onClick={() => toggleDropdown('more')}
            className={`flex-shrink-0 px-2 py-1.5 border border-gray-300 rounded-lg text-sm font-medium transition-colors duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
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
              className={`px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
                dropdowns.bedrooms
                  ? (filters.bedrooms.length > 0 || (filters.bathrooms && filters.bathrooms.length > 0)
                      ? 'bg-white border-gray-900 text-gray-900'
                      : 'bg-gray-200 text-gray-700 border-gray-300')
                  : (filters.bedrooms.length > 0 || (filters.bathrooms && filters.bathrooms.length > 0)
                      ? 'bg-white border-gray-900 text-gray-900'
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
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-80 p-4">
                <div className="space-y-5">
                  {/* Bedrooms Section */}
                  <div>
                    <h3 className="text-xs text-gray-600 mb-4">Bedrooms</h3>
                    <div className="border border-gray-200 rounded-full p-1.5 flex">
                      {['Studio', '1', '2', '3', '4+'].map((option, index) => {
                        const value = option === 'Studio' ? 0 : option === '4+' ? 4 : parseInt(option);
                        const isSelected = tempBedroomsBaths.bedrooms.includes(value);
                        const nextValue = index < 4 ? (index === 0 ? 1 : index === 4 ? 4 : index + 1) : null;
                        const prevValue = index > 0 ? (index === 1 ? 0 : index === 4 ? 3 : index - 1) : null;
                        const isNextSelected = nextValue !== null && tempBedroomsBaths.bedrooms.includes(nextValue);
                        const isPrevSelected = prevValue !== null && tempBedroomsBaths.bedrooms.includes(prevValue);

                        let roundedClass = 'rounded-full';
                        if (isSelected) {
                          if (isPrevSelected && isNextSelected) {
                            roundedClass = 'rounded-none';
                          } else if (isPrevSelected) {
                            roundedClass = 'rounded-r-full rounded-l-none';
                          } else if (isNextSelected) {
                            roundedClass = 'rounded-l-full rounded-r-none';
                          }
                        }

                        return (
                          <button
                            key={`bedroom-${option}`}
                            onClick={() => {
                              const newBedrooms = isSelected
                                ? tempBedroomsBaths.bedrooms.filter(b => b !== value)
                                : [...tempBedroomsBaths.bedrooms, value];
                              setTempBedroomsBaths(prev => ({ ...prev, bedrooms: newBedrooms }));
                            }}
                            className={`flex-1 py-1.5 px-2 text-xs font-medium ${roundedClass} ${
                              isSelected
                                ? 'bg-blue-600 text-white'
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
                    <h3 className="text-xs text-gray-600 mb-4">Bathrooms</h3>
                    <div className="border border-gray-200 rounded-full p-1.5 flex">
                      {['1', '2', '3', '4', '5+'].map((option, index) => {
                        const value = option === '5+' ? 5 : parseInt(option);
                        const isSelected = tempBedroomsBaths.bathrooms.includes(value);
                        const nextValue = index < 4 ? (index === 4 ? 5 : index + 2) : null;
                        const prevValue = index > 0 ? (index === 4 ? 4 : index) : null;
                        const isNextSelected = nextValue !== null && tempBedroomsBaths.bathrooms.includes(nextValue);
                        const isPrevSelected = prevValue !== null && tempBedroomsBaths.bathrooms.includes(prevValue);

                        let roundedClass = 'rounded-full';
                        if (isSelected) {
                          if (isPrevSelected && isNextSelected) {
                            roundedClass = 'rounded-none';
                          } else if (isPrevSelected) {
                            roundedClass = 'rounded-r-full rounded-l-none';
                          } else if (isNextSelected) {
                            roundedClass = 'rounded-l-full rounded-r-none';
                          }
                        }

                        return (
                          <button
                            key={`bathroom-${option}`}
                            onClick={() => {
                              const newBathrooms = isSelected
                                ? tempBedroomsBaths.bathrooms.filter(b => b !== value)
                                : [...tempBedroomsBaths.bathrooms, value];
                              setTempBedroomsBaths(prev => ({ ...prev, bathrooms: newBathrooms }));
                            }}
                            className={`flex-1 py-1.5 px-2 text-xs font-medium ${roundedClass} ${
                              isSelected
                                ? 'bg-blue-600 text-white'
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
                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
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
                      className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors duration-200"
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
              className={`px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
                dropdowns.price
                  ? (filters.priceMin > 0 || filters.priceMax < 100000
                      ? 'bg-white border-gray-900 text-gray-900'
                      : 'bg-gray-200 text-gray-700 border-gray-300')
                  : (filters.priceMin > 0 || filters.priceMax < 100000
                      ? 'bg-white border-gray-900 text-gray-900'
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
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 w-96 p-5">
                <div className="space-y-5">
                  {/* Price Input Fields */}
                  <div className="flex items-center gap-3">
                    <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 flex-1">
                      <div className="text-xs text-gray-600 mb-0.5">Min price</div>
                      <div className="text-sm text-gray-900">
                        {formatCurrency(tempPrice.priceMin)}
                        <span className="text-gray-500 ml-1">/mo</span>
                      </div>
                    </div>
                    <div className="text-gray-600 font-bold">—</div>
                    <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 flex-1">
                      <div className="text-xs text-gray-600 mb-0.5">Max price</div>
                      <div className="text-sm text-gray-900">
                        {formatCurrency(tempPrice.priceMax)}
                        <span className="text-gray-500 ml-1">/mo</span>
                      </div>
                    </div>
                  </div>

                  {/* Price Histogram */}
                  <div>
                    <PriceHistogram
                      minPrice={0}
                      maxPrice={100000}
                      selectedMin={tempPrice.priceMin}
                      selectedMax={tempPrice.priceMax}
                    />
                  </div>

                  {/* Dual Range Slider */}
                  <div className="px-2">
                    <Slider
                      value={[tempPrice.priceMin, tempPrice.priceMax]}
                      onValueChange={handleTempSliderChange}
                      max={100000}
                      min={0}
                      step={1000}
                      className="w-full"
                    />
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // Clear temporary filters
                      setTempPrice({ priceMin: 0, priceMax: 100000 });
                      // Apply empty filters immediately and reset all filters to defaults
                      onFiltersChange({
                        priceMin: 0,
                        priceMax: 100000,
                        bedrooms: [],
                        bathrooms: [],
                        location: '',
                        propertyTypes: [],
                        amenities: [],
                        sortBy: SortOption.RELEVANCE,
                        petsAllowed: false,
                        hasDeals: false
                      });
                      setDropdowns(prev => ({ ...prev, price: false }));
                    }}
                    className="text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors duration-200 underline"
                  >
                    Clear
                  </button>

                  <button
                    onClick={() => {
                      // Apply the temporary price filters using the proper handler
                      handlePriceChange(tempPrice.priceMin, tempPrice.priceMax);
                      setDropdowns(prev => ({ ...prev, price: false }));
                    }}
                    className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors duration-200"
                  >
                    View results
                  </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Type Filter */}
          <div className="relative" ref={el => { dropdownRefs.current.propertyType = el; }}>
            <button
              onClick={() => toggleDropdown('propertyType')}
              className={`px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
                dropdowns.propertyType
                  ? (filters.propertyTypes.length > 0
                      ? 'bg-white border-gray-900 text-gray-900'
                      : 'bg-gray-200 text-gray-700 border-gray-300')
                  : (filters.propertyTypes.length > 0
                      ? 'bg-white border-gray-900 text-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200')
              }`}
              aria-expanded={dropdowns.propertyType}
              aria-haspopup="true"
            >
              {formatPropertyTypes(filters.propertyTypes)}
              <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdowns.propertyType && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-52 p-3">
                <div className="space-y-3">
                  {[
                    { value: PropertyType.APARTMENT, label: 'Apartment' },
                    { value: PropertyType.HOUSE, label: 'House' },
                    { value: PropertyType.ROOM, label: 'Room' },
                    { value: PropertyType.OFFICE, label: 'Townhouse' },
                  ].map(type => (
                    <label
                      key={type.value}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={tempPropertyTypes.includes(type.value)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...tempPropertyTypes, type.value]
                            : tempPropertyTypes.filter(t => t !== type.value);
                          setTempPropertyTypes(newTypes);
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-3 text-sm text-gray-900">{type.label}</span>
                    </label>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-3">
                  <button
                    onClick={() => {
                      // Clear temporary filters
                      setTempPropertyTypes([]);
                      // Apply empty filters immediately
                      handlePropertyTypeChange([]);
                      setDropdowns(prev => ({ ...prev, propertyType: false }));
                    }}
                    className="text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors duration-200 underline"
                  >
                    Clear
                  </button>

                  <button
                    onClick={() => {
                      // Apply the temporary property type filters
                      handlePropertyTypeChange(tempPropertyTypes);
                      setDropdowns(prev => ({ ...prev, propertyType: false }));
                    }}
                    className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors duration-200"
                  >
                    View results
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pets Filter */}
          <div className="relative" ref={el => { dropdownRefs.current.pets = el; }}>
            <button
              onClick={() => toggleDropdown('pets')}
              className={`px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
                dropdowns.pets
                  ? (filters.petsAllowed
                      ? 'bg-white border-gray-900 text-gray-900'
                      : 'bg-gray-200 text-gray-700 border-gray-300')
                  : (filters.petsAllowed
                      ? 'bg-white border-gray-900 text-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200')
              }`}
              aria-expanded={dropdowns.pets}
              aria-haspopup="true"
            >
              {formatPetsFilter(filters.petsAllowed || false)}
              <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdowns.pets && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-56 p-4">
                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempPetsAllowed}
                      onChange={(e) => setTempPetsAllowed(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-900">Dogs allowed</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-900">Cats allowed</span>
                  </label>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                  <button
                    onClick={() => {
                      // Clear temporary filters
                      setTempPetsAllowed(false);
                      // Apply empty filters immediately
                      onFiltersChange({ petsAllowed: false });
                      setDropdowns(prev => ({ ...prev, pets: false }));
                    }}
                    className="text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors duration-200 underline"
                  >
                    Clear
                  </button>

                  <button
                    onClick={() => {
                      // Apply the temporary pets filters
                      onFiltersChange({ petsAllowed: tempPetsAllowed });
                      setDropdowns(prev => ({ ...prev, pets: false }));
                    }}
                    className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors duration-200"
                  >
                    View results
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Deals Filter */}
          <div className="relative" ref={el => { dropdownRefs.current.deals = el; }}>
            <button
              onClick={() => toggleDropdown('deals')}
              className={`px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
                dropdowns.deals
                  ? (filters.hasDeals
                      ? 'bg-white border-gray-900 text-gray-900'
                      : 'bg-gray-200 text-gray-700 border-gray-300')
                  : (filters.hasDeals
                      ? 'bg-white border-gray-900 text-gray-900'
                      : 'bg-white text-gray-700 border-gray-300 active:bg-gray-200')
              }`}
              aria-expanded={dropdowns.deals}
              aria-haspopup="true"
            >
              {formatDealsFilter(filters.hasDeals || false)}
              <svg className="ml-2 w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdowns.deals && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-56 p-4">
                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempHasDeals}
                      onChange={(e) => setTempHasDeals(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-900">Rent special</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-900">No security deposit</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-900">Price drop</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-900">Sweet deal</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={false}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-3 text-sm text-gray-900">Utilities included</span>
                  </label>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-4">
                  <button
                    onClick={() => {
                      // Clear temporary filters
                      setTempHasDeals(false);
                      // Apply empty filters immediately
                      onFiltersChange({ hasDeals: false });
                      setDropdowns(prev => ({ ...prev, deals: false }));
                    }}
                    className="text-gray-600 hover:text-gray-800 font-medium text-sm transition-colors duration-200 underline"
                  >
                    Clear
                  </button>

                  <button
                    onClick={() => {
                      // Apply the temporary deals filters
                      onFiltersChange({ hasDeals: tempHasDeals });
                      setDropdowns(prev => ({ ...prev, deals: false }));
                    }}
                    className="bg-gray-900 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors duration-200"
                  >
                    View results
                  </button>
                </div>
              </div>
            )}
          </div>


          {/* More Filters */}
          <div className="relative" ref={el => { dropdownRefs.current.more = el; }}>
            <button
              onClick={() => toggleDropdown('more')}
              className={`px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-all duration-200 hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-gray-400 ${
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
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-52 p-3">
                <h3 className="font-medium text-gray-900 mb-2.5">Más Filtros</h3>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Radio de búsqueda</label>
                    <select
                      value={filters.radiusKm}
                      onChange={(e) => onFiltersChange({ radiusKm: parseInt(e.target.value) })}
                      className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-0"
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
                      className="w-full px-2.5 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200"
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