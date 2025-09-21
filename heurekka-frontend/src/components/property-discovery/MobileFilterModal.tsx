'use client';

import React from 'react';
import { SearchFilters, PropertyType } from '@/types/property';
import { Slider } from '@/components/ui/slider';
import { PriceHistogram } from './PriceHistogram';

interface MobileFilterModalProps {
  isOpen: boolean;
  filterType: 'bedrooms' | 'price' | 'propertyType' | 'pets' | 'deals' | 'more';
  filters: SearchFilters;
  onClose: () => void;
  onApply: (newFilters: Partial<SearchFilters>) => void;
}

/**
 * Mobile fullscreen filter modal with exact structure from the image
 */
export const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  isOpen,
  filterType,
  filters,
  onClose,
  onApply
}) => {
  const [tempFilters, setTempFilters] = React.useState<Partial<SearchFilters>>({});

  // Initialize temp filters when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setTempFilters({
        bedrooms: filters.bedrooms || [],
        bathrooms: filters.bathrooms || [],
        priceMin: filters.priceMin || 0,
        priceMax: filters.priceMax || 100000,
        propertyTypes: filters.propertyTypes || [],
        petsAllowed: filters.petsAllowed || false,
        hasDeals: filters.hasDeals || false
      });
    }
  }, [isOpen, filters]);

  // Handle temp slider change for price
  const handleTempSliderChange = (values: number[]) => {
    setTempFilters(prev => ({
      ...prev,
      priceMin: values[0],
      priceMax: values[1]
    }));
  };

  // Format currency - same as FilterBar
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleBedroomToggle = (num: number) => {
    const currentBedrooms = tempFilters.bedrooms || [];
    const newBedrooms = currentBedrooms.includes(num)
      ? currentBedrooms.filter(b => b !== num)
      : [...currentBedrooms, num];

    setTempFilters(prev => ({ ...prev, bedrooms: newBedrooms }));
  };

  const handleBathroomToggle = (num: number) => {
    const currentBathrooms = tempFilters.bathrooms || [];
    const newBathrooms = currentBathrooms.includes(num)
      ? currentBathrooms.filter(b => b !== num)
      : [...currentBathrooms, num];

    setTempFilters(prev => ({ ...prev, bathrooms: newBathrooms }));
  };

  const handleApply = () => {
    onApply(tempFilters);
    onClose();
  };

  if (!isOpen) return null;

  // Helper function to determine rounded classes for consecutive selections
  const getConsecutiveRoundedClass = (options: (string | number)[], selectedValues: number[], index: number, value: number) => {
    const isSelected = selectedValues.includes(value);
    if (!isSelected) return '';

    // Check if previous option is selected
    const prevIndex = index - 1;
    const prevValue = prevIndex >= 0 ? (options[prevIndex] === 'studio' ? 0 : options[prevIndex] === '4+' ? 4 : options[prevIndex] === '5+' ? 5 : options[prevIndex] as number) : null;
    const isPrevSelected = prevValue !== null && selectedValues.includes(prevValue);

    // Check if next option is selected
    const nextIndex = index + 1;
    const nextValue = nextIndex < options.length ? (options[nextIndex] === 'studio' ? 0 : options[nextIndex] === '4+' ? 4 : options[nextIndex] === '5+' ? 5 : options[nextIndex] as number) : null;
    const isNextSelected = nextValue !== null && selectedValues.includes(nextValue);

    // Determine rounded class based on consecutive selections
    if (!isPrevSelected && !isNextSelected) {
      return 'rounded-full'; // Single selection
    } else if (!isPrevSelected && isNextSelected) {
      return 'rounded-l-full'; // Start of group
    } else if (isPrevSelected && !isNextSelected) {
      return 'rounded-r-full'; // End of group
    } else {
      return ''; // Middle of group
    }
  };

  const renderBedroomsBathroomsContent = () => (
    <div className="flex-1 px-6 py-4 space-y-5 overflow-y-auto">
      {/* Bedrooms Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Bedrooms</h3>
        <div className="flex bg-white border border-gray-200 rounded-full p-1">
          {['studio', 1, 2, 3, '4+'].map((option, index) => {
            const value = option === 'studio' ? 0 : option === '4+' ? 4 : option as number;
            const isSelected = (tempFilters.bedrooms || []).includes(value);
            const roundedClass = getConsecutiveRoundedClass(['studio', 1, 2, 3, '4+'], tempFilters.bedrooms || [], index, value);

            return (
              <button
                key={option}
                onClick={() => handleBedroomToggle(value)}
                className={`flex-1 py-2 px-3 text-center text-sm font-medium ${
                  isSelected
                    ? `bg-blue-600 text-white ${roundedClass}`
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option === 'studio' ? 'Studio' : option}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bathrooms Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Bathrooms</h3>
        <div className="flex bg-white border border-gray-200 rounded-full p-1">
          {[1, 2, 3, 4, '5+'].map((option, index) => {
            const value = option === '5+' ? 5 : option as number;
            const isSelected = (tempFilters.bathrooms || []).includes(value);
            const roundedClass = getConsecutiveRoundedClass([1, 2, 3, 4, '5+'], tempFilters.bathrooms || [], index, value);

            return (
              <button
                key={option}
                onClick={() => handleBathroomToggle(value)}
                className={`flex-1 py-2 px-3 text-center text-sm font-medium ${
                  isSelected
                    ? `bg-blue-600 text-white ${roundedClass}`
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderPriceContent = () => (
    <div className="flex-1 px-6 py-4 space-y-5 overflow-y-auto">
      <div className="space-y-5">
        {/* Price Input Fields */}
        <div className="flex items-center gap-3">
          <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 flex-1">
            <div className="text-xs text-gray-600 mb-0.5">Min price</div>
            <div className="text-sm text-gray-900">
              {formatCurrency(tempFilters.priceMin || 0)}
              <span className="text-gray-500 ml-1">/mo</span>
            </div>
          </div>
          <div className="text-gray-600 font-bold">—</div>
          <div className="bg-white border border-gray-300 rounded-lg px-3 py-2 flex-1">
            <div className="text-xs text-gray-600 mb-0.5">Max price</div>
            <div className="text-sm text-gray-900">
              {formatCurrency(tempFilters.priceMax || 100000)}
              <span className="text-gray-500 ml-1">/mo</span>
            </div>
          </div>
        </div>

        {/* Price Histogram */}
        <div>
          <PriceHistogram
            minPrice={0}
            maxPrice={100000}
            selectedMin={tempFilters.priceMin || 0}
            selectedMax={tempFilters.priceMax || 100000}
          />
        </div>

        {/* Dual Range Slider */}
        <div className="px-2">
          <Slider
            value={[tempFilters.priceMin || 0, tempFilters.priceMax || 100000]}
            onValueChange={handleTempSliderChange}
            max={100000}
            min={0}
            step={1000}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );

  const renderPropertyTypeContent = () => {
    const propertyTypeMap = {
      'Apartment': PropertyType.APARTMENT,
      'Condo': 'condo' as PropertyType,
      'House': PropertyType.HOUSE,
      'Room': PropertyType.ROOM,
      'Townhouse': 'townhouse' as PropertyType,
      'Other': PropertyType.OFFICE
    };

    return (
      <div className="flex-1 px-6 py-3 overflow-y-auto">
        <div className="space-y-1">
          {Object.entries(propertyTypeMap).map(([displayName, propertyType]) => (
            <label key={displayName} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
              <span className="text-sm text-gray-900">{displayName}</span>
              <input
                type="checkbox"
                checked={(tempFilters.propertyTypes || []).includes(propertyType)}
                onChange={(e) => {
                  const currentTypes = tempFilters.propertyTypes || [];
                  const newTypes = e.target.checked
                    ? [...currentTypes, propertyType]
                    : currentTypes.filter(t => t !== propertyType);
                  setTempFilters(prev => ({ ...prev, propertyTypes: newTypes }));
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderPetsContent = () => (
    <div className="flex-1 px-6 py-4 overflow-y-auto">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Pet Policy</h3>
        <label className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
          <input
            type="checkbox"
            checked={tempFilters.petsAllowed || false}
            onChange={(e) => setTempFilters(prev => ({ ...prev, petsAllowed: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-3 text-sm text-gray-900">Pets Allowed</span>
        </label>
      </div>
    </div>
  );

  const renderDealsContent = () => (
    <div className="flex-1 px-6 py-4 overflow-y-auto">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Special Offers</h3>
        <label className="flex items-center p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
          <input
            type="checkbox"
            checked={tempFilters.hasDeals || false}
            onChange={(e) => setTempFilters(prev => ({ ...prev, hasDeals: e.target.checked }))}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="ml-3 text-sm text-gray-900">Has Deals & Specials</span>
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Modal Container with Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-end backdrop-brightness-75"
        onClick={(e) => {
          // Only close if clicking the background area (not the modal content)
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="w-full h-auto max-h-[70vh] bg-white rounded-t-2xl flex flex-col animate-slide-up">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            {/* Clear Button */}
            <button
              onClick={() => {
                if (filterType === 'bedrooms') {
                  setTempFilters({ bedrooms: [], bathrooms: [] });
                } else if (filterType === 'price') {
                  setTempFilters({ priceMin: 0, priceMax: 100000 });
                } else if (filterType === 'propertyType') {
                  setTempFilters({ propertyTypes: [] });
                } else if (filterType === 'pets') {
                  setTempFilters({ petsAllowed: false });
                } else if (filterType === 'deals') {
                  setTempFilters({ hasDeals: false });
                }
              }}
              className="text-gray-600 hover:text-gray-800 font-medium text-base transition-colors duration-200"
            >
              Clear
            </button>

            {/* Title */}
            <h2 className="text-base font-semibold text-gray-900 uppercase tracking-wider">
              {filterType === 'bedrooms' ? 'BEDS/BATHS' :
               filterType === 'price' ? 'PRICE' :
               filterType === 'propertyType' ? 'PROPERTY TYPE' :
               filterType === 'pets' ? 'PETS' :
               filterType === 'deals' ? 'DEALS' : 'FILTER'}
            </h2>

            {/* Close X */}
            <button
              onClick={onClose}
              className="p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          {filterType === 'bedrooms' && renderBedroomsBathroomsContent()}
          {filterType === 'price' && renderPriceContent()}
          {filterType === 'propertyType' && renderPropertyTypeContent()}
          {filterType === 'pets' && renderPetsContent()}
          {filterType === 'deals' && renderDealsContent()}

          {/* Footer */}
          <div className="px-6 pb-safe pt-6 border-t border-gray-100 mt-auto" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
            <button
              onClick={handleApply}
              className="w-full bg-gray-900 text-white py-4 rounded-lg text-base font-semibold hover:bg-gray-800 transition-colors duration-200"
            >
              Ver resultados
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileFilterModal;